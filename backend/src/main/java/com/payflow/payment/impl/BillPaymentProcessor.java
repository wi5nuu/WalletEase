package com.payflow.payment.impl;

import com.payflow.dto.request.PaymentRequest;
import com.payflow.dto.response.PaymentResult;
import com.payflow.entity.Bill;
import com.payflow.entity.IdempotencyKey;
import com.payflow.entity.Transaction;
import com.payflow.entity.Wallet;
import com.payflow.entity.WalletAudit;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.payment.PaymentProcessor;
import com.payflow.repository.BillRepository;
import com.payflow.repository.IdempotencyKeyRepository;
import com.payflow.repository.TransactionRepository;
import com.payflow.repository.WalletAuditRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.util.ReferenceCodeGenerator;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * BillPaymentProcessor - Concrete implementation of PaymentProcessor.
 * 
 * Handles bill payments (electricity, water, internet, etc.).
 * 
 * POLYMORPHISM: Implements PaymentProcessor interface
 */
@Component
public class BillPaymentProcessor implements PaymentProcessor {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final BillRepository billRepository;
    private final ReferenceCodeGenerator referenceCodeGenerator;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final WalletAuditRepository walletAuditRepository;

    public BillPaymentProcessor(WalletRepository walletRepository,
                                TransactionRepository transactionRepository,
                                BillRepository billRepository,
                                ReferenceCodeGenerator referenceCodeGenerator,
                                IdempotencyKeyRepository idempotencyKeyRepository,
                                WalletAuditRepository walletAuditRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.billRepository = billRepository;
        this.referenceCodeGenerator = referenceCodeGenerator;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.walletAuditRepository = walletAuditRepository;
    }

    @Override
    public PaymentType getType() {
        return PaymentType.BILL_PAYMENT;
    }

    @Override
    @Transactional
    public PaymentResult process(PaymentRequest request) {
        // Validate request
        if (!validate(request)) {
            return PaymentResult.failure("VALIDATION_ERROR", "Invalid bill payment request");
        }

        // Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            java.util.Optional<IdempotencyKey> existing = idempotencyKeyRepository.findByKeyValue(request.getIdempotencyKey());
            if (existing.isPresent()) {
                IdempotencyKey cached = existing.get();
                return PaymentResult.success(cached.getTransactionId(), cached.getReferenceCode(), "Payment already processed (idempotent)");
            }
        }

        // Load wallet with pessimistic lock
        Wallet wallet = walletRepository.findByIdWithLock(request.getSenderWalletId())
                .orElse(null);
        if (wallet == null) {
            return PaymentResult.failure("WALLET_NOT_FOUND", "Wallet not found");
        }

        // Load bill type
        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", request.getBillId()));

        if (!bill.getIsActive()) {
            return PaymentResult.failure("BILL_INACTIVE", "This bill type is not currently active");
        }

        // Determine amount
        BigDecimal amount;
        if (bill.hasFixedAmount()) {
            amount = bill.getFixedAmount();
        } else {
            amount = request.getAmount();
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return PaymentResult.failure("INVALID_AMOUNT", "Invalid payment amount");
        }

        // Calculate total with fee
        BigDecimal fee = calculateFee(amount);
        BigDecimal totalAmount = amount.add(fee);

        // Check balance
        if (!wallet.hasSufficientBalance(totalAmount)) {
            return PaymentResult.failure("INSUFFICIENT_BALANCE", "Insufficient balance for bill payment");
        }

        // Build description
        String description = String.format("%s - Customer ID: %s", bill.getName(), request.getCustomerId());
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            description += " - " + request.getDescription();
        }

        // Create transaction
        Transaction transaction = Transaction.create(
                wallet,
                null, // No receiver wallet for bill payments (external payment)
                amount,
                fee,
                Transaction.Type.BILL_PAYMENT,
                referenceCodeGenerator.generate(),
                description
        );

        // Capture balance before debit
        BigDecimal balanceBefore = wallet.getBalance();

        // Execute payment
        wallet.debit(totalAmount);

        // Save
        walletRepository.save(wallet);

        transaction.complete();
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Record audit trail
        recordAudit(wallet, savedTransaction, Transaction.Type.BILL_PAYMENT,
                totalAmount, balanceBefore, "Bill payment: " + bill.getName());

        // Store idempotency key
        storeIdempotencyKey(request.getIdempotencyKey(), "BILL_PAYMENT",
                wallet.getId(), savedTransaction.getId(), savedTransaction.getReferenceCode());

        return PaymentResult.success(savedTransaction);
    }

    @Override
    public boolean validate(PaymentRequest request) {
        if (request.getSenderWalletId() == null) {
            return false;
        }
        if (request.getBillId() == null) {
            return false;
        }
        if (request.getCustomerId() == null || request.getCustomerId().isBlank()) {
            return false;
        }
        // Amount is optional if bill has fixed amount
        if (request.getAmount() != null) {
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return false;
            }
            if (request.getAmount().scale() > 2) {
                return false;
            }
        }
        return true;
    }

    @Override
    public BigDecimal calculateFee(BigDecimal amount) {
        // Bill payment fee: 1% of amount, max Rp 5,000
        BigDecimal fee = amount.multiply(new BigDecimal("0.01"));
        BigDecimal maxFee = new BigDecimal("5000");
        return fee.min(maxFee);
    }

    private void recordAudit(Wallet wallet, Transaction transaction, Transaction.Type operationType,
                              BigDecimal amount, BigDecimal balanceBefore, String description) {
        BigDecimal balanceAfter = balanceBefore.subtract(amount);
        WalletAudit audit = WalletAudit.record(
                wallet.getId(),
                transaction.getId(),
                WalletAudit.OperationType.valueOf(operationType.name()),
                amount,
                balanceBefore,
                balanceAfter,
                description
        );
        walletAuditRepository.save(audit);
    }

    private void storeIdempotencyKey(String keyValue, String requestType, java.util.UUID walletId,
                                      java.util.UUID transactionId, String referenceCode) {
        if (keyValue == null || keyValue.isBlank()) return;
        if (idempotencyKeyRepository.existsByKeyValue(keyValue)) return;

        IdempotencyKey key = IdempotencyKey.create(keyValue, requestType, walletId);
        key.setResponseStatus("COMPLETED");
        key.setResponseBody("{\"transactionId\":\"" + transactionId + "\",\"referenceCode\":\"" + referenceCode + "\"}");
        key.setTransactionId(transactionId);
        key.setExpiresAt(LocalDateTime.now().plusHours(24));
        idempotencyKeyRepository.save(key);
    }
}

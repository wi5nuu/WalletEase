package com.payflow.payment.impl;

import com.payflow.dto.request.PaymentRequest;
import com.payflow.dto.response.PaymentResult;
import com.payflow.entity.IdempotencyKey;
import com.payflow.entity.Transaction;
import com.payflow.entity.Wallet;
import com.payflow.entity.WalletAudit;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.payment.PaymentProcessor;
import com.payflow.repository.IdempotencyKeyRepository;
import com.payflow.repository.TransactionRepository;
import com.payflow.repository.WalletAuditRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.util.ReferenceCodeGenerator;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * QrPaymentProcessor - Concrete implementation of PaymentProcessor.
 *
 * Handles QR code-based peer-to-peer payments.
 * Transfers funds from sender to recipient wallet identified by QR code data.
 *
 * POLYMORPHISM: Implements PaymentProcessor interface
 */
@Component
public class QrPaymentProcessor implements PaymentProcessor {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final ReferenceCodeGenerator referenceCodeGenerator;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final WalletAuditRepository walletAuditRepository;

    public QrPaymentProcessor(WalletRepository walletRepository,
                               TransactionRepository transactionRepository,
                               ReferenceCodeGenerator referenceCodeGenerator,
                               IdempotencyKeyRepository idempotencyKeyRepository,
                               WalletAuditRepository walletAuditRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.referenceCodeGenerator = referenceCodeGenerator;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.walletAuditRepository = walletAuditRepository;
    }

    @Override
    public PaymentType getType() {
        return PaymentType.QR_PAYMENT;
    }

    @Override
    @Transactional
    public PaymentResult process(PaymentRequest request) {
        // Validate request
        if (!validate(request)) {
            return PaymentResult.failure("VALIDATION_ERROR", "Invalid QR payment request");
        }

        // Idempotency check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            var existing = idempotencyKeyRepository.findByKeyValue(request.getIdempotencyKey());
            if (existing.isPresent()) {
                IdempotencyKey cached = existing.get();
                return PaymentResult.success(cached.getTransactionId(), cached.getReferenceCode(),
                        "Payment already processed (idempotent)");
            }
        }

        // Load wallets with pessimistic locks (ordered to prevent deadlocks)
        Wallet senderWallet;
        Wallet receiverWallet;
        if (request.getSenderWalletId().compareTo(request.getReceiverWalletId()) < 0) {
            senderWallet = walletRepository.findByIdWithLock(request.getSenderWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", request.getSenderWalletId()));
            receiverWallet = walletRepository.findByIdWithLock(request.getReceiverWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", request.getReceiverWalletId()));
        } else {
            receiverWallet = walletRepository.findByIdWithLock(request.getReceiverWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", request.getReceiverWalletId()));
            senderWallet = walletRepository.findByIdWithLock(request.getSenderWalletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", request.getSenderWalletId()));
        }

        BigDecimal amount = request.getAmount();

        // Check balance
        if (!senderWallet.hasSufficientBalance(amount)) {
            return PaymentResult.failure("INSUFFICIENT_BALANCE", "Insufficient balance for QR payment");
        }

        // Capture balances before operation
        BigDecimal senderBalanceBefore = senderWallet.getBalance();
        BigDecimal receiverBalanceBefore = receiverWallet.getBalance();

        // Create transaction
        String description = "QR Payment";
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            description += " - " + request.getDescription();
        }

        Transaction transaction = Transaction.create(
                senderWallet,
                receiverWallet,
                amount,
                BigDecimal.ZERO,
                Transaction.Type.QR_PAYMENT,
                referenceCodeGenerator.generate(),
                description
        );

        // Execute transfer
        senderWallet.debit(amount);
        receiverWallet.credit(amount);

        // Save wallets
        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // Complete transaction
        transaction.complete();
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Record audit trail for sender (DEBIT)
        recordAudit(senderWallet, savedTransaction, Transaction.Type.QR_PAYMENT,
                amount, senderBalanceBefore, "QR Payment sent");

        // Record audit trail for receiver (CREDIT)
        recordAudit(receiverWallet, savedTransaction, Transaction.Type.QR_PAYMENT,
                amount, receiverBalanceBefore, "QR Payment received");

        // Store idempotency key
        storeIdempotencyKey(request.getIdempotencyKey(), "QR_PAYMENT",
                senderWallet.getId(), savedTransaction.getId(), savedTransaction.getReferenceCode());

        return PaymentResult.success(savedTransaction);
    }

    @Override
    public boolean validate(PaymentRequest request) {
        if (request.getSenderWalletId() == null) return false;
        if (request.getReceiverWalletId() == null) return false;
        if (request.getSenderWalletId().equals(request.getReceiverWalletId())) return false;
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) return false;
        if (request.getAmount().scale() > 2) return false;
        return true;
    }

    @Override
    public BigDecimal calculateFee(BigDecimal amount) {
        // QR payments are free (no fee)
        return BigDecimal.ZERO;
    }

    private void recordAudit(Wallet wallet, Transaction transaction, Transaction.Type operationType,
                              BigDecimal amount, BigDecimal balanceBefore, String description) {
        boolean isDebit = operationType == Transaction.Type.QR_PAYMENT
                && description.contains("sent");
        BigDecimal balanceAfter = isDebit
                ? balanceBefore.subtract(amount)
                : balanceBefore.add(amount);

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

    private void storeIdempotencyKey(String keyValue, String requestType, UUID walletId,
                                      UUID transactionId, String referenceCode) {
        if (keyValue == null || keyValue.isBlank()) return;
        if (idempotencyKeyRepository.existsByKeyValue(keyValue)) return;

        IdempotencyKey key = IdempotencyKey.create(keyValue, requestType, walletId);
        key.setResponseStatus("COMPLETED");
        key.setResponseBody("{\"transactionId\":\"" + transactionId + "\",\"referenceCode\":\"" + referenceCode + "\"}");
        key.setTransactionId(transactionId);
        idempotencyKeyRepository.save(key);
    }
}

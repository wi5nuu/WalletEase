package com.payflow.payment.impl;

import com.payflow.dto.request.PaymentRequest;
import com.payflow.dto.response.PaymentResult;
import com.payflow.entity.IdempotencyKey;
import com.payflow.entity.Transaction;
import com.payflow.entity.Wallet;
import com.payflow.entity.WalletAudit;
import com.payflow.exception.InsufficientBalanceException;
import com.payflow.payment.PaymentProcessor;
import com.payflow.repository.IdempotencyKeyRepository;
import com.payflow.repository.TransactionRepository;
import com.payflow.repository.WalletAuditRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.util.ReferenceCodeGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * WalletTransferProcessor - Concrete implementation of PaymentProcessor.
 * 
 * Handles wallet-to-wallet transfers.
 * 
 * POLYMORPHISM: Implements PaymentProcessor interface
 */
@Component
public class WalletTransferProcessor implements PaymentProcessor {

    private static final Logger logger = LoggerFactory.getLogger(WalletTransferProcessor.class);

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final ReferenceCodeGenerator referenceCodeGenerator;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final WalletAuditRepository walletAuditRepository;

    public WalletTransferProcessor(WalletRepository walletRepository,
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
        return PaymentType.WALLET_TRANSFER;
    }

    @Override
    @Transactional
    public PaymentResult process(PaymentRequest request) {
        // Validate request
        if (!validate(request)) {
            return PaymentResult.failure("VALIDATION_ERROR", "Invalid transfer request");
        }

        // IDEMPOTENCY CHECK
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            IdempotencyKey existingKey = idempotencyKeyRepository.findByKeyValue(request.getIdempotencyKey()).orElse(null);
            if (existingKey != null && !existingKey.isExpired()) {
                if ("SUCCESS".equals(existingKey.getResponseStatus()) && existingKey.getTransactionId() != null) {
                    return PaymentResult.success(existingKey.getTransactionId(), "SUCCESS",
                            "Idempotent: returning cached transfer result");
                }
                return PaymentResult.failure("CACHED_FAILURE", "Previous transfer attempt failed");
            }
        }

        // DEADLOCK PREVENTION: Always lock wallets in consistent order (by UUID).
        UUID senderId = request.getSenderWalletId();
        UUID receiverId = request.getReceiverWalletId();

        if (senderId.equals(receiverId)) {
            return PaymentResult.failure("SELF_TRANSFER", "Cannot transfer to same wallet");
        }

        Wallet firstLock, secondLock;
        boolean senderIsFirst = senderId.compareTo(receiverId) < 0;

        if (senderIsFirst) {
            firstLock = walletRepository.findByIdWithLock(senderId).orElse(null);
            secondLock = walletRepository.findByIdWithLock(receiverId).orElse(null);
        } else {
            firstLock = walletRepository.findByIdWithLock(receiverId).orElse(null);
            secondLock = walletRepository.findByIdWithLock(senderId).orElse(null);
        }

        if (firstLock == null || secondLock == null) {
            return PaymentResult.failure("WALLET_NOT_FOUND", "Sender or receiver wallet not found");
        }

        Wallet senderWallet = senderIsFirst ? firstLock : secondLock;
        Wallet receiverWallet = senderIsFirst ? secondLock : firstLock;

        BigDecimal fee = calculateFee(request.getAmount());
        BigDecimal totalAmount = request.getAmount().add(fee);
        if (!senderWallet.hasSufficientBalance(totalAmount)) {
            return PaymentResult.failure("INSUFFICIENT_BALANCE", "Insufficient balance for transfer");
        }

        // Capture balances before mutation for audit trail
        BigDecimal senderBalanceBefore = senderWallet.getBalance();
        BigDecimal receiverBalanceBefore = receiverWallet.getBalance();

        // Create transaction record
        Transaction transaction = Transaction.create(
                senderWallet, receiverWallet,
                request.getAmount(), fee,
                Transaction.Type.TRANSFER,
                referenceCodeGenerator.generate(),
                request.getDescription()
        );

        // Execute transfer using encapsulated domain methods
        senderWallet.debit(totalAmount);
        receiverWallet.credit(request.getAmount());

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        transaction.complete();
        Transaction savedTransaction = transactionRepository.save(transaction);

        // AUDIT TRAIL: Record balance changes for both wallets
        walletAuditRepository.save(WalletAudit.record(
                senderWallet.getId(), savedTransaction.getId(),
                WalletAudit.OperationType.TRANSFER_OUT,
                totalAmount, senderBalanceBefore, senderWallet.getBalance(),
                "Transfer to " + (receiverWallet.getUser() != null ? receiverWallet.getUser().getUsername() : "unknown")
        ));
        walletAuditRepository.save(WalletAudit.record(
                receiverWallet.getId(), savedTransaction.getId(),
                WalletAudit.OperationType.TRANSFER_IN,
                request.getAmount(), receiverBalanceBefore, receiverWallet.getBalance(),
                "Transfer from " + (senderWallet.getUser() != null ? senderWallet.getUser().getUsername() : "unknown")
        ));

        // IDEMPOTENCY: Cache the result
        cacheIdempotencyResult(request.getIdempotencyKey(), senderWallet.getId(),
                PaymentResult.success(savedTransaction), savedTransaction.getId());

        return PaymentResult.success(savedTransaction);
    }

    private void cacheIdempotencyResult(String keyValue, UUID walletId,
                                         PaymentResult result, UUID transactionId) {
        if (keyValue == null || keyValue.isBlank()) return;
        try {
            IdempotencyKey key = IdempotencyKey.create(keyValue, "TRANSFER", walletId);
            key.setResponseStatus(result.isSuccess() ? "SUCCESS" : "FAILED");
            key.setTransactionId(transactionId);
            idempotencyKeyRepository.save(key);
        } catch (Exception e) {
            logger.warn("Failed to cache idempotency key: {}", keyValue, e);
        }
    }

    @Override
    public boolean validate(PaymentRequest request) {
        if (request.getSenderWalletId() == null || request.getReceiverWalletId() == null) {
            return false;
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        if (request.getAmount().scale() > 2) {
            return false;
        }
        // Max Rp 50,000,000
        if (request.getAmount().compareTo(new BigDecimal("50000000")) > 0) {
            return false;
        }
        return true;
    }

    @Override
    public BigDecimal calculateFee(BigDecimal amount) {
        // Transfer fee: Rp 1,000 for amounts <= Rp 100,000
        // Free for amounts > Rp 100,000
        if (amount.compareTo(new BigDecimal("100000")) <= 0) {
            return new BigDecimal("1000");
        }
        return BigDecimal.ZERO;
    }
}

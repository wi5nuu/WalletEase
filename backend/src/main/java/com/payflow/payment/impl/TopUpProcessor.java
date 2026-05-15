package com.payflow.payment.impl;

import com.payflow.dto.request.PaymentRequest;
import com.payflow.dto.response.GatewayResponse;
import com.payflow.dto.response.PaymentResult;
import com.payflow.entity.IdempotencyKey;
import com.payflow.entity.Transaction;
import com.payflow.entity.Wallet;
import com.payflow.entity.WalletAudit;
import com.payflow.gateway.IntegrationGateway;
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
 * TopUpProcessor - Concrete implementation of PaymentProcessor.
 * 
 * Handles wallet top-ups via integration with external payment gateway.
 * 
 * POLYMORPHISM: Implements PaymentProcessor interface
 */
@Component
public class TopUpProcessor implements PaymentProcessor {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final IntegrationGateway integrationGateway;
    private final ReferenceCodeGenerator referenceCodeGenerator;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final WalletAuditRepository walletAuditRepository;

    public TopUpProcessor(WalletRepository walletRepository,
                         TransactionRepository transactionRepository,
                         IntegrationGateway integrationGateway,
                         ReferenceCodeGenerator referenceCodeGenerator,
                         IdempotencyKeyRepository idempotencyKeyRepository,
                         WalletAuditRepository walletAuditRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.integrationGateway = integrationGateway;
        this.referenceCodeGenerator = referenceCodeGenerator;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.walletAuditRepository = walletAuditRepository;
    }

    @Override
    public PaymentType getType() {
        return PaymentType.TOP_UP;
    }

    @Override
    @Transactional
    public PaymentResult process(PaymentRequest request) {
        // Validate request
        if (!validate(request)) {
            return PaymentResult.failure("VALIDATION_ERROR", "Invalid top-up request");
        }

        // IDEMPOTENCY CHECK: If this key was already processed, return cached result
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            IdempotencyKey existingKey = idempotencyKeyRepository.findByKeyValue(request.getIdempotencyKey()).orElse(null);
            if (existingKey != null && !existingKey.isExpired()) {
                // Return cached response - prevents double-charge on retry
                PaymentResult cachedResult = deserializeCachedResult(existingKey);
                if (cachedResult != null) {
                    return cachedResult;
                }
            }
        }

        // Load wallet with pessimistic lock to prevent concurrent top-up race conditions
        Wallet wallet = walletRepository.findByIdWithLock(request.getSenderWalletId())
                .orElse(null);
        if (wallet == null) {
            return PaymentResult.failure("WALLET_NOT_FOUND", "Wallet not found");
        }

        // Call integration gateway for top-up
        com.payflow.dto.request.GatewayTopUpRequest gatewayRequest =
                new com.payflow.dto.request.GatewayTopUpRequest(
                        wallet.getId(),
                        request.getAmount(),
                        wallet.getCurrency(),
                        "VIRTUAL_ACCOUNT"
                );
        // Set idempotency key on gateway request
        gatewayRequest.setIdempotencyKey(request.getIdempotencyKey());

        GatewayResponse gatewayResponse = integrationGateway.processTopUp(gatewayRequest);

        // Handle gateway response
        if (gatewayResponse.isFailed()) {
            return PaymentResult.failure(
                    "GATEWAY_ERROR",
                    "Payment gateway error: " + gatewayResponse.getErrorMessage()
            );
        }

        if (gatewayResponse.isPending()) {
            Transaction transaction = Transaction.create(
                    null, wallet, request.getAmount(),
                    calculateFee(request.getAmount()),
                    Transaction.Type.TOP_UP,
                    referenceCodeGenerator.generate(),
                    "Top-up via payment gateway"
            );
            Transaction saved = transactionRepository.save(transaction);
            return PaymentResult.success(saved);
        }

        // Gateway success - proceed with credit
        BigDecimal fee = calculateFee(request.getAmount());
        BigDecimal netAmount = request.getAmount().subtract(fee);
        BigDecimal balanceBefore = wallet.getBalance();

        // Create transaction
        Transaction transaction = Transaction.create(
                null, wallet, request.getAmount(), fee,
                Transaction.Type.TOP_UP,
                referenceCodeGenerator.generate(),
                "Top-up via payment gateway"
        );

        // Credit wallet
        wallet.credit(netAmount);

        // Add gateway reference to metadata
        transaction.addMetadata("gatewayReferenceId", gatewayResponse.getGatewayReferenceId());
        transaction.complete();

        // Save
        walletRepository.save(wallet);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // AUDIT TRAIL: Record the balance change
        walletAuditRepository.save(WalletAudit.record(
                wallet.getId(), savedTransaction.getId(),
                WalletAudit.OperationType.TOP_UP,
                netAmount, balanceBefore, wallet.getBalance(),
                "Top-up: +" + netAmount + " (fee: " + fee + ")"
        ));

        // IDEMPOTENCY: Cache the result for 24 hours
        cacheIdempotencyResult(request.getIdempotencyKey(), wallet.getId(),
                PaymentResult.success(savedTransaction), savedTransaction.getId());

        return PaymentResult.success(savedTransaction);
    }

    private void cacheIdempotencyResult(String keyValue, UUID walletId,
                                         PaymentResult result, UUID transactionId) {
        if (keyValue == null || keyValue.isBlank()) return;
        try {
            IdempotencyKey key = IdempotencyKey.create(keyValue, "TOP_UP", walletId);
            key.setResponseStatus(result.isSuccess() ? "SUCCESS" : "FAILED");
            key.setTransactionId(transactionId);
            idempotencyKeyRepository.save(key);
        } catch (Exception e) {
            // Log but don't fail the transaction if idempotency caching fails
            org.slf4j.LoggerFactory.getLogger(TopUpProcessor.class)
                    .warn("Failed to cache idempotency key: {}", keyValue, e);
        }
    }

    private PaymentResult deserializeCachedResult(IdempotencyKey key) {
        if ("SUCCESS".equals(key.getResponseStatus()) && key.getTransactionId() != null) {
            return PaymentResult.success(key.getTransactionId(), key.getResponseStatus(),
                    "Idempotent: returning cached result");
        }
        return PaymentResult.failure("CACHED_FAILURE", "Previous attempt failed");
    }

    @Override
    public boolean validate(PaymentRequest request) {
        if (request.getSenderWalletId() == null) {
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
        // Top-up fee: 0.5% of amount, min Rp 1,000, max Rp 5,000
        BigDecimal percentage = new BigDecimal("0.005");
        BigDecimal fee = amount.multiply(percentage);
        
        BigDecimal minFee = new BigDecimal("1000");
        BigDecimal maxFee = new BigDecimal("5000");
        
        return fee.max(minFee).min(maxFee);
    }
}

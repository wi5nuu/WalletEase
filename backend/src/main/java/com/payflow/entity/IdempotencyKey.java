package com.payflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Idempotency Key entity for preventing duplicate payment processing.
 *
 * When a payment request comes in with an idempotency key, we check if
 * it already exists. If it does, we return the cached response instead
 * of processing again. This prevents double-charging on network retries.
 *
 * Keys expire after 24 hours and are cleaned up by a scheduled task.
 */
@Entity
@Table(name = "idempotency_keys", indexes = {
    @Index(name = "idx_idempotency_key_value", columnList = "keyValue", unique = true),
    @Index(name = "idx_idempotency_expires_at", columnList = "expiresAt")
})
public class IdempotencyKey extends BaseEntity {

    @Column(name = "key_value", nullable = false, unique = true, length = 100)
    private String keyValue;

    @Column(name = "request_type", nullable = false, length = 30)
    private String requestType; // TOP_UP, TRANSFER, BILL_PAYMENT, etc.

    @Column(name = "wallet_id")
    private UUID walletId;

    @Column(name = "response_status", length = 20)
    private String responseStatus;

    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    protected IdempotencyKey() {
    }

    public static IdempotencyKey create(String keyValue, String requestType, UUID walletId) {
        IdempotencyKey key = new IdempotencyKey();
        key.keyValue = keyValue;
        key.requestType = requestType;
        key.walletId = walletId;
        key.expiresAt = LocalDateTime.now().plusHours(24);
        return key;
    }

    // Getters and setters
    public String getKeyValue() { return keyValue; }
    public void setKeyValue(String keyValue) { this.keyValue = keyValue; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public UUID getWalletId() { return walletId; }
    public void setWalletId(UUID walletId) { this.walletId = walletId; }

    public String getResponseStatus() { return responseStatus; }
    public void setResponseStatus(String responseStatus) { this.responseStatus = responseStatus; }

    public String getResponseBody() { return responseBody; }
    public void setResponseBody(String responseBody) { this.responseBody = responseBody; }

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public String getReferenceCode() {
        if (responseBody != null && responseBody.contains("referenceCode")) {
            // Simple extraction from JSON string
            int start = responseBody.indexOf("\"referenceCode\":\"") + 17;
            int end = responseBody.indexOf("\"", start);
            return responseBody.substring(start, end);
        }
        return null;
    }
}

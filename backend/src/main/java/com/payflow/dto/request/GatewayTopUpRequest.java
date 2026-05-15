package com.payflow.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for top-up requests sent to the integration gateway.
 */
public class GatewayTopUpRequest {

    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String idempotencyKey;

    public GatewayTopUpRequest() {
    }

    public GatewayTopUpRequest(UUID walletId, BigDecimal amount, String currency, String paymentMethod) {
        this.walletId = walletId;
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.idempotencyKey = UUID.randomUUID().toString();
    }

    // Getters and Setters
    public UUID getWalletId() {
        return walletId;
    }

    public void setWalletId(UUID walletId) {
        this.walletId = walletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}

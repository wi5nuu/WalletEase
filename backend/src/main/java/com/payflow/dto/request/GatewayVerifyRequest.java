package com.payflow.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for payment verification requests sent to the integration gateway.
 */
public class GatewayVerifyRequest {

    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private String verificationType;

    public GatewayVerifyRequest() {
    }

    public GatewayVerifyRequest(UUID walletId, BigDecimal amount, String currency, String verificationType) {
        this.walletId = walletId;
        this.amount = amount;
        this.currency = currency;
        this.verificationType = verificationType;
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

    public String getVerificationType() {
        return verificationType;
    }

    public void setVerificationType(String verificationType) {
        this.verificationType = verificationType;
    }
}

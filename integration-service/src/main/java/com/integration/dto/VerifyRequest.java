package com.integration.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for verify requests.
 */
public class VerifyRequest {

    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private String verificationType;

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

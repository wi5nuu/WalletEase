package com.payflow.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for withdrawal requests sent to the integration gateway.
 */
public class GatewayWithdrawRequest {

    private UUID walletId;
    private BigDecimal amount;
    private String currency;
    private String destinationAccount;
    private String destinationBank;
    private String idempotencyKey;

    public GatewayWithdrawRequest() {
    }

    public GatewayWithdrawRequest(UUID walletId, BigDecimal amount, String currency, 
                                   String destinationAccount, String destinationBank) {
        this.walletId = walletId;
        this.amount = amount;
        this.currency = currency;
        this.destinationAccount = destinationAccount;
        this.destinationBank = destinationBank;
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

    public String getDestinationAccount() {
        return destinationAccount;
    }

    public void setDestinationAccount(String destinationAccount) {
        this.destinationAccount = destinationAccount;
    }

    public String getDestinationBank() {
        return destinationBank;
    }

    public void setDestinationBank(String destinationBank) {
        this.destinationBank = destinationBank;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}

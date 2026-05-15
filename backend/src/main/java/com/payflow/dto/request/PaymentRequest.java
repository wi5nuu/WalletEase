package com.payflow.dto.request;

import com.payflow.payment.PaymentProcessor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * PaymentRequest - DTO for payment processing requests.
 * This is the input to the PaymentProcessor interface (POLYMORPHISM).
 */
public class PaymentRequest {

    private PaymentProcessor.PaymentType type;
    private UUID senderWalletId;
    private UUID receiverWalletId;
    private BigDecimal amount;
    private String description;
    private String pin;
    private UUID billId;          // For bill payments
    private String customerId;     // For bill payments
    private String metadata;       // Additional JSON metadata
    private String idempotencyKey; // Unique key for idempotent requests

    // Getters and Setters
    public PaymentProcessor.PaymentType getType() {
        return type;
    }

    public void setType(PaymentProcessor.PaymentType type) {
        this.type = type;
    }

    public UUID getSenderWalletId() {
        return senderWalletId;
    }

    public void setSenderWalletId(UUID senderWalletId) {
        this.senderWalletId = senderWalletId;
    }

    public UUID getReceiverWalletId() {
        return receiverWalletId;
    }

    public void setReceiverWalletId(UUID receiverWalletId) {
        this.receiverWalletId = receiverWalletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public UUID getBillId() {
        return billId;
    }

    public void setBillId(UUID billId) {
        this.billId = billId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}

package com.payflow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.payflow.validation.ValidAmount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for QR code payment requests.
 */
public class QrPaymentRequest {

    @NotNull(message = "Recipient wallet ID is required")
    @JsonProperty("recipientWalletId")
    private UUID recipientWalletId;

    @NotNull(message = "Amount is required")
    @ValidAmount
    @JsonProperty("amount")
    private BigDecimal amount;

    @NotBlank(message = "PIN is required")
    @JsonProperty("pin")
    private String pin;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @JsonProperty("description")
    private String description;

    @JsonProperty("idempotencyKey")
    private String idempotencyKey;

    // Getters and Setters
    public UUID getRecipientWalletId() {
        return recipientWalletId;
    }

    public void setRecipientWalletId(UUID recipientWalletId) {
        this.recipientWalletId = recipientWalletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}

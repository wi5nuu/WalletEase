package com.payflow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.payflow.validation.ValidAmount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for bill payment requests.
 */
public class BillPaymentRequest {

    @NotNull(message = "Bill ID is required")
    @JsonProperty("billId")
    private UUID billId;

    @NotBlank(message = "Customer ID is required")
    @Size(max = 50, message = "Customer ID must not exceed 50 characters")
    @JsonProperty("customerId")
    private String customerId;

    @NotNull(message = "Amount is required")
    @ValidAmount
    @JsonProperty("amount")
    private BigDecimal amount;

    @NotBlank(message = "PIN is required")
    @JsonProperty("pin")
    private String pin;

    @JsonProperty("idempotencyKey")
    private String idempotencyKey;

    // Getters and Setters
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

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}

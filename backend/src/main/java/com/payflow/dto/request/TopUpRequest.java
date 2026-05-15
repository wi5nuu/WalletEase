package com.payflow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.payflow.validation.ValidAmount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * DTO for wallet top-up requests.
 */
public class TopUpRequest {

    @NotNull(message = "Amount is required")
    @ValidAmount
    @JsonProperty("amount")
    private BigDecimal amount;

    @NotBlank(message = "PIN is required")
    @JsonProperty("pin")
    private String pin;

    @JsonProperty("paymentMethod")
    private String paymentMethod = "VIRTUAL_ACCOUNT";

    @JsonProperty("idempotencyKey")
    private String idempotencyKey;

    // Getters and Setters
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

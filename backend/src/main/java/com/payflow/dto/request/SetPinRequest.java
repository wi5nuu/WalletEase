package com.payflow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for setting or changing transaction PIN.
 */
public class SetPinRequest {

    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN must be exactly 6 digits")
    @JsonProperty("pin")
    private String pin;

    @NotBlank(message = "Confirm PIN is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Confirm PIN must be exactly 6 digits")
    @JsonProperty("confirmPin")
    private String confirmPin;

    // Getters and Setters
    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public String getConfirmPin() {
        return confirmPin;
    }

    public void setConfirmPin(String confirmPin) {
        this.confirmPin = confirmPin;
    }

    public boolean pinsMatch() {
        return pin != null && pin.equals(confirmPin);
    }
}

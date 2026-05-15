package com.integration.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for gateway responses.
 */
public class GatewayResponse {

    public enum Status {
        SUCCESS,
        PENDING,
        FAILED
    }

    private Status status;
    private String gatewayReferenceId;
    private String message;
    private BigDecimal processedAmount;
    private String currency;
    private LocalDateTime processedAt;
    private String errorCode;
    private String errorMessage;

    public GatewayResponse() {
        this.processedAt = LocalDateTime.now();
    }

    // Factory methods
    public static GatewayResponse success(String gatewayReferenceId, BigDecimal processedAmount, String currency) {
        GatewayResponse response = new GatewayResponse();
        response.status = Status.SUCCESS;
        response.gatewayReferenceId = gatewayReferenceId;
        response.processedAmount = processedAmount;
        response.currency = currency;
        response.message = "Gateway processing successful";
        return response;
    }

    public static GatewayResponse pending(String gatewayReferenceId) {
        GatewayResponse response = new GatewayResponse();
        response.status = Status.PENDING;
        response.gatewayReferenceId = gatewayReferenceId;
        response.message = "Gateway processing pending";
        return response;
    }

    public static GatewayResponse failed(String errorCode, String errorMessage) {
        GatewayResponse response = new GatewayResponse();
        response.status = Status.FAILED;
        response.errorCode = errorCode;
        response.errorMessage = errorMessage;
        response.message = "Gateway processing failed: " + errorMessage;
        return response;
    }

    // Getters and Setters
    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getGatewayReferenceId() {
        return gatewayReferenceId;
    }

    public void setGatewayReferenceId(String gatewayReferenceId) {
        this.gatewayReferenceId = gatewayReferenceId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public BigDecimal getProcessedAmount() {
        return processedAmount;
    }

    public void setProcessedAmount(BigDecimal processedAmount) {
        this.processedAmount = processedAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public boolean isSuccess() {
        return status == Status.SUCCESS;
    }

    public boolean isPending() {
        return status == Status.PENDING;
    }

    public boolean isFailed() {
        return status == Status.FAILED;
    }
}

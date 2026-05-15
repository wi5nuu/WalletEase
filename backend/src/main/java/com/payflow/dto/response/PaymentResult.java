package com.payflow.dto.response;

import com.payflow.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PaymentResult - DTO for payment processing results.
 * Returned by PaymentProcessor.process() (POLYMORPHISM).
 */
public class PaymentResult {

    private boolean success;
    private UUID transactionId;
    private String referenceCode;
    private Transaction.Status status;
    private BigDecimal amount;
    private BigDecimal fee;
    private String message;
    private LocalDateTime timestamp;
    private String errorCode;

    // Private constructor - use factory methods
    private PaymentResult() {
        this.timestamp = LocalDateTime.now();
    }

    // Factory method for success
    public static PaymentResult success(Transaction transaction) {
        PaymentResult result = new PaymentResult();
        result.success = true;
        result.transactionId = transaction.getId();
        result.referenceCode = transaction.getReferenceCode();
        result.status = transaction.getStatus();
        result.amount = transaction.getAmount();
        result.fee = transaction.getFee();
        result.message = "Payment processed successfully";
        return result;
    }

    // Factory method for success with custom transaction ID (for idempotent responses)
    public static PaymentResult success(UUID transactionId, String status, String message) {
        PaymentResult result = new PaymentResult();
        result.success = true;
        result.transactionId = transactionId;
        result.status = Transaction.Status.valueOf(status);
        result.message = message;
        return result;
    }

    // Factory method for failure
    public static PaymentResult failure(String errorCode, String message) {
        PaymentResult result = new PaymentResult();
        result.success = false;
        result.status = Transaction.Status.FAILED;
        result.errorCode = errorCode;
        result.message = message;
        return result;
    }

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public Transaction.Status getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

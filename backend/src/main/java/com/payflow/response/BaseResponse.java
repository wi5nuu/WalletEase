package com.payflow.response;

import java.time.Instant;

/**
 * BaseResponse - Sealed class demonstrating INHERITANCE (OOP Pillar #2)
 * 
 * This is an ABSTRACTION layer that defines the contract for all API responses.
 * Only SuccessResponse and ErrorResponse can extend this class.
 * 
 * POLYMORPHISM: Services can return BaseResponse which will be either
 * SuccessResponse or ErrorResponse at runtime.
 */
public abstract sealed class BaseResponse<T> permits SuccessResponse, ErrorResponse {

    private final String status;
    private final String message;
    private final Instant timestamp;

    protected BaseResponse(String status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    // ABSTRACTION: Abstract method for getting the data payload
    public abstract T getData();

    // Helper factory methods
    public static <T> SuccessResponse<T> success(T data) {
        return new SuccessResponse<>(data, "Success");
    }

    public static <T> SuccessResponse<T> success(T data, String message) {
        return new SuccessResponse<>(data, message);
    }

    public static ErrorResponse error(String message) {
        return new ErrorResponse(null, message);
    }

    public static ErrorResponse error(String code, String message) {
        return new ErrorResponse(code, message);
    }
}

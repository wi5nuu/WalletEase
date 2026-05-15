package com.payflow.response;

/**
 * ErrorResponse - Final class extending BaseResponse.
 * Represents failed API responses with error details.
 * 
 * INHERITANCE: Extends BaseResponse (sealed hierarchy)
 */
public final class ErrorResponse extends BaseResponse<Object> {

    private final String code;
    private final Object details;

    ErrorResponse(String code, String message) {
        super("error", message);
        this.code = code;
        this.details = null;
    }

    ErrorResponse(String code, String message, Object details) {
        super("error", message);
        this.code = code;
        this.details = details;
    }

    @Override
    public Object getData() {
        return null; // Error responses don't have data
    }

    public String getCode() {
        return code;
    }

    public Object getDetails() {
        return details;
    }

    @Override
    public String toString() {
        return "ErrorResponse{" +
                "status=" + getStatus() +
                ", code=" + code +
                ", message=" + getMessage() +
                ", timestamp=" + getTimestamp() +
                (details != null ? ", details=" + details : "") +
                '}';
    }

    // Static factory methods for common errors
    public static ErrorResponse badRequest(String message) {
        return new ErrorResponse("BAD_REQUEST", message);
    }

    public static ErrorResponse unauthorized(String message) {
        return new ErrorResponse("UNAUTHORIZED", message);
    }

    public static ErrorResponse forbidden(String message) {
        return new ErrorResponse("FORBIDDEN", message);
    }

    public static ErrorResponse notFound(String resource) {
        return new ErrorResponse("NOT_FOUND", resource + " not found");
    }

    public static ErrorResponse validation(String message, Object details) {
        return new ErrorResponse("VALIDATION_ERROR", message, details);
    }

    public static ErrorResponse internal(String message) {
        return new ErrorResponse("INTERNAL_ERROR", message);
    }

    public static ErrorResponse insufficientBalance() {
        return new ErrorResponse("INSUFFICIENT_BALANCE", "Insufficient wallet balance");
    }

    public static ErrorResponse invalidPin() {
        return new ErrorResponse("INVALID_PIN", "Invalid transaction PIN");
    }
}

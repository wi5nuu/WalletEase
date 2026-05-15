package com.payflow.exception;

/**
 * Exception thrown when a user attempts to access a resource they don't own or have permission for.
 */
public class UnauthorizedAccessException extends RuntimeException {

    public UnauthorizedAccessException() {
        super("Unauthorized access");
    }

    public UnauthorizedAccessException(String message) {
        super(message);
    }

    public UnauthorizedAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}

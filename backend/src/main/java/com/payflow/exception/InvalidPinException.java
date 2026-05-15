package com.payflow.exception;

/**
 * Exception thrown when an invalid transaction PIN is provided.
 */
public class InvalidPinException extends RuntimeException {

    public InvalidPinException() {
        super("Invalid transaction PIN");
    }

    public InvalidPinException(String message) {
        super(message);
    }

    public InvalidPinException(String message, Throwable cause) {
        super(message, cause);
    }
}

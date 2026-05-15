package com.payflow.exception;

/**
 * Exception thrown when rate limit is exceeded.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException() {
        super("Rate limit exceeded. Please try again later.");
    }

    public RateLimitExceededException(String message) {
        super(message);
    }

    public RateLimitExceededException(long retryAfterSeconds) {
        super(String.format("Rate limit exceeded. Please try again after %d seconds.", retryAfterSeconds));
    }
}

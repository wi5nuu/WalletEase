package com.payflow.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for generating unique reference codes for transactions.
 */
@Component
public class ReferenceCodeGenerator {

    private static final String PREFIX = "PAY";
    private static final int RANDOM_LENGTH = 8;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generate a unique transaction reference code.
     * Format: PAY-YYYYMMDD-XXXXXXXX (where X is alphanumeric)
     */
    public String generate() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = generateRandomString(RANDOM_LENGTH);
        return String.format("%s-%s-%s", PREFIX, datePart, randomPart);
    }

    /**
     * Generate a random string of specified length.
     */
    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    /**
     * Generate a shorter code for QR payments.
     */
    public String generateShortCode() {
        return generateRandomString(12);
    }
}

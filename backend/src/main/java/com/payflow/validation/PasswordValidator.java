package com.payflow.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator implementation for @ValidPassword annotation.
 */
public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Password requirements regex:
    // - At least 8 characters
    // - At least 1 uppercase letter
    // - At least 1 lowercase letter
    // - At least 1 digit
    // - At least 1 special character
    private static final String PASSWORD_PATTERN = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            return false;
        }
        return password.matches(PASSWORD_PATTERN);
    }
}

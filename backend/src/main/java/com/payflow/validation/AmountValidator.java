package com.payflow.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

/**
 * Validator implementation for @ValidAmount annotation.
 */
public class AmountValidator implements ConstraintValidator<ValidAmount, BigDecimal> {

    // Maximum transaction amount: Rp 50,000,000
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("50000000");

    @Override
    public void initialize(ValidAmount constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(BigDecimal amount, ConstraintValidatorContext context) {
        if (amount == null) {
            return false;
        }

        // Check positive
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        // Check max 2 decimal places
        if (amount.scale() > 2) {
            return false;
        }

        // Check maximum amount
        if (amount.compareTo(MAX_AMOUNT) > 0) {
            return false;
        }

        return true;
    }
}

package com.payflow.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

/**
 * Unit tests for @ValidAmount annotation and AmountValidator.
 */
class ValidAmountTest {

    private AmountValidator validator;
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new AmountValidator();
        context = mock(ConstraintValidatorContext.class);
    }

    @Test
    void testValidAmounts() {
        // Valid amounts: positive, <= 2 decimal places, <= 50,000,000
        assertTrue(validator.isValid(new BigDecimal("1000"), context));
        assertTrue(validator.isValid(new BigDecimal("1000.00"), context));
        assertTrue(validator.isValid(new BigDecimal("1000.50"), context));
        assertTrue(validator.isValid(new BigDecimal("0.01"), context));
        assertTrue(validator.isValid(new BigDecimal("50000000"), context));
        assertTrue(validator.isValid(new BigDecimal("1"), context));
    }

    @Test
    void testInvalidAmounts_Negative() {
        assertFalse(validator.isValid(new BigDecimal("-100"), context));
        assertFalse(validator.isValid(new BigDecimal("-0.01"), context));
    }

    @Test
    void testInvalidAmounts_Zero() {
        assertFalse(validator.isValid(new BigDecimal("0"), context));
        assertFalse(validator.isValid(new BigDecimal("0.00"), context));
    }

    @Test
    void testInvalidAmounts_TooManyDecimals() {
        assertFalse(validator.isValid(new BigDecimal("1000.001"), context));
        assertFalse(validator.isValid(new BigDecimal("1000.999"), context));
    }

    @Test
    void testInvalidAmounts_ExceedsMaximum() {
        assertFalse(validator.isValid(new BigDecimal("50000001"), context));
        assertFalse(validator.isValid(new BigDecimal("100000000"), context));
        assertFalse(validator.isValid(new BigDecimal("50000000.01"), context));
    }

    @Test
    void testNullAmount() {
        assertFalse(validator.isValid(null, context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "1000000",      // 1 million - valid
        "50000000",     // 50 million (max) - valid
        "10000.99",     // Valid with decimals
        "1.99"          // Small valid amount
    })
    void testBoundaryValidAmounts(String amount) {
        assertTrue(validator.isValid(new BigDecimal(amount), context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "50000001",     // Just over max
        "99999999",     // Way over max
        "100.123"       // Too many decimals
    })
    void testBoundaryInvalidAmounts(String amount) {
        assertFalse(validator.isValid(new BigDecimal(amount), context));
    }
}

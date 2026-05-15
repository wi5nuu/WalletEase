package com.payflow.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

/**
 * Unit tests for @ValidPassword annotation and PasswordValidator.
 */
class ValidPasswordTest {

    private PasswordValidator validator;
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new PasswordValidator();
        context = mock(ConstraintValidatorContext.class);
    }

    @Test
    void testValidPassword_AllRequirements() {
        // Valid: 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
        assertTrue(validator.isValid("Test@123", context));
        assertTrue(validator.isValid("Password1!", context));
        assertTrue(validator.isValid("MyP@ssw0rd", context));
        assertTrue(validator.isValid("Abcdef1#", context));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "short1!",      // Too short (< 8 chars)
        "noupper1!",    // No uppercase
        "NOLOWER1!",    // No lowercase
        "NoDigits!@",   // No digits
        "NoSpecial1",   // No special char
        "onlylowercase", // No uppercase, digits, special
        "12345678",     // Only digits
        "!!!!!!!!",     // Only special
        "",             // Empty
        "        "      // Only spaces (technically valid length but no required chars)
    })
    void testInvalidPasswords(String password) {
        assertFalse(validator.isValid(password, context));
    }

    @Test
    void testNullPassword() {
        assertFalse(validator.isValid(null, context));
    }

    @Test
    void testBlankPassword() {
        assertFalse(validator.isValid("   ", context));
        assertFalse(validator.isValid("", context));
    }

    @Test
    void testLongValidPassword() {
        assertTrue(validator.isValid("VeryLongPassword1!@#", context));
    }

    @Test
    void testEdgeCase_Exactly8Chars() {
        assertTrue(validator.isValid("Test@12a", context));
    }
}

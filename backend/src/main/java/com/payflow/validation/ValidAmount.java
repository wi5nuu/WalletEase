package com.payflow.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom validation annotation for transaction amounts.
 * Enforces: positive amount, max 2 decimal places, max Rp 50,000,000.
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AmountValidator.class)
public @interface ValidAmount {

    String message() default "Amount must be positive, maximum 2 decimal places, and not exceed Rp 50,000,000";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

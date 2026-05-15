package com.payflow.payment;

import com.payflow.dto.request.PaymentRequest;
import com.payflow.dto.response.PaymentResult;

/**
 * PaymentProcessor - Interface demonstrating POLYMORPHISM (OOP Pillar #3)
 * 
 * This is an ABSTRACTION that defines the contract for all payment processing.
 * Multiple implementations exist: WalletTransferProcessor, BillPaymentProcessor, TopUpProcessor.
 * 
 * POLYMORPHISM: The PaymentProcessorFactory selects the correct implementation
 * at runtime based on PaymentType, and Spring injects the correct bean.
 */
public interface PaymentProcessor {

    /**
     * Get the payment type this processor handles.
     * 
     * @return The PaymentType enum value
     */
    PaymentType getType();

    /**
     * Process a payment request.
     * 
     * @param request The payment request containing all necessary details
     * @return The payment result with status and transaction details
     */
    PaymentResult process(PaymentRequest request);

    /**
     * Validate a payment request before processing.
     * 
     * @param request The payment request
     * @return true if valid, false otherwise
     */
    boolean validate(PaymentRequest request);

    /**
     * Calculate fee for this payment type.
     * 
     * @param amount The payment amount
     * @return The calculated fee
     */
    java.math.BigDecimal calculateFee(java.math.BigDecimal amount);

    /**
     * PaymentType enum defining all supported payment types.
     */
    enum PaymentType {
        WALLET_TRANSFER,
        BILL_PAYMENT,
        TOP_UP,
        QR_PAYMENT
    }
}

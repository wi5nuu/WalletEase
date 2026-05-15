package com.payflow.payment;

import com.payflow.payment.impl.BillPaymentProcessor;
import com.payflow.payment.impl.TopUpProcessor;
import com.payflow.payment.impl.WalletTransferProcessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PaymentProcessorFactory.
 * Tests correct processor resolution for each PaymentType.
 */
@ExtendWith(MockitoExtension.class)
class PaymentProcessorFactoryTest {

    @Mock
    private WalletTransferProcessor walletTransferProcessor;
    
    @Mock
    private BillPaymentProcessor billPaymentProcessor;
    
    @Mock
    private TopUpProcessor topUpProcessor;

    private PaymentProcessorFactory factory;

    @BeforeEach
    void setUp() {
        // Set up the mock processors to return their respective types
        org.mockito.Mockito.when(walletTransferProcessor.getType())
                .thenReturn(PaymentProcessor.PaymentType.WALLET_TRANSFER);
        org.mockito.Mockito.when(billPaymentProcessor.getType())
                .thenReturn(PaymentProcessor.PaymentType.BILL_PAYMENT);
        org.mockito.Mockito.when(topUpProcessor.getType())
                .thenReturn(PaymentProcessor.PaymentType.TOP_UP);

        List<PaymentProcessor> processors = Arrays.asList(
                walletTransferProcessor,
                billPaymentProcessor,
                topUpProcessor
        );
        
        factory = new PaymentProcessorFactory(processors);
    }

    @Test
    void testGetProcessor_WalletTransfer() {
        // When
        PaymentProcessor processor = factory.getProcessor(PaymentProcessor.PaymentType.WALLET_TRANSFER);

        // Then
        assertNotNull(processor);
        assertEquals(PaymentProcessor.PaymentType.WALLET_TRANSFER, processor.getType());
    }

    @Test
    void testGetProcessor_BillPayment() {
        // When
        PaymentProcessor processor = factory.getProcessor(PaymentProcessor.PaymentType.BILL_PAYMENT);

        // Then
        assertNotNull(processor);
        assertEquals(PaymentProcessor.PaymentType.BILL_PAYMENT, processor.getType());
    }

    @Test
    void testGetProcessor_TopUp() {
        // When
        PaymentProcessor processor = factory.getProcessor(PaymentProcessor.PaymentType.TOP_UP);

        // Then
        assertNotNull(processor);
        assertEquals(PaymentProcessor.PaymentType.TOP_UP, processor.getType());
    }

    @Test
    void testGetProcessor_UnknownType() {
        // When & Then
        // This test verifies that requesting a non-existent type throws exception
        assertThrows(IllegalArgumentException.class, () -> {
            factory.getProcessor(PaymentProcessor.PaymentType.QR_PAYMENT);
        });
    }

    @Test
    void testHasProcessor_ReturnsTrueForExisting() {
        // Then
        assertTrue(factory.hasProcessor(PaymentProcessor.PaymentType.WALLET_TRANSFER));
        assertTrue(factory.hasProcessor(PaymentProcessor.PaymentType.BILL_PAYMENT));
        assertTrue(factory.hasProcessor(PaymentProcessor.PaymentType.TOP_UP));
    }

    @Test
    void testHasProcessor_ReturnsFalseForNonExisting() {
        // Then
        assertFalse(factory.hasProcessor(PaymentProcessor.PaymentType.QR_PAYMENT));
    }
}

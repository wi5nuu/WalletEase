package com.payflow.service;

import com.payflow.dto.request.BillPaymentRequest;
import com.payflow.dto.request.TopUpRequest;
import com.payflow.dto.request.TransferRequest;
import com.payflow.dto.response.PaymentResult;
import com.payflow.entity.*;
import com.payflow.exception.InsufficientBalanceException;
import com.payflow.exception.InvalidPinException;
import com.payflow.mapper.TransactionMapper;
import com.payflow.payment.PaymentProcessor;
import com.payflow.payment.PaymentProcessorFactory;
import com.payflow.repository.*;
import com.payflow.service.impl.TransactionServiceImpl;
import com.payflow.service.interfaces.AuthService;
import com.payflow.service.interfaces.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TransactionServiceImpl.
 * Tests transfer, top-up, bill payment flows with success and failure scenarios.
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private WalletRepository walletRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuthService authService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private PaymentProcessorFactory paymentProcessorFactory;
    @Mock
    private TransactionMapper transactionMapper;
    @Mock
    private PaymentProcessor paymentProcessor;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User testUser;
    private Wallet testWallet;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.createNewUser("testuser", "test@test.com", "081234567890", "Test User", "password");
        testWallet = Wallet.createWallet(testUser);
        setField(testWallet, "balance", new BigDecimal("1000000"));
        setField(testWallet, "id", UUID.randomUUID());
    }

    @Test
    void testTopUp_Success() {
        // Given
        TopUpRequest request = new TopUpRequest();
        request.setAmount(new BigDecimal("500000"));
        request.setPin("123456");

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(authService.verifyPin(anyString(), anyString())).thenReturn(true);
        when(walletRepository.findByUserId(testUserId)).thenReturn(Optional.of(testWallet));
        when(paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.TOP_UP)).thenReturn(paymentProcessor);
        
        Transaction tx = Transaction.create(null, testWallet, new BigDecimal("500000"), 
                BigDecimal.ZERO, Transaction.Type.TOP_UP, "REF123", "Top-up");
        tx.complete();
        
        when(paymentProcessor.process(any())).thenReturn(PaymentResult.success(tx));

        // When
        PaymentResult result = transactionService.topUp(testUserId, request);

        // Then
        assertTrue(result.isSuccess());
        verify(notificationService).sendTransactionNotification(any(), anyString(), anyString());
    }

    @Test
    void testTopUp_InvalidPin() {
        // Given
        TopUpRequest request = new TopUpRequest();
        request.setAmount(new BigDecimal("500000"));
        request.setPin("000000");

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(authService.verifyPin(anyString(), anyString())).thenReturn(false);

        // When & Then
        assertThrows(InvalidPinException.class, () -> transactionService.topUp(testUserId, request));
    }

    @Test
    void testTransfer_Success() {
        // Given
        TransferRequest request = new TransferRequest();
        request.setRecipient("recipientUser");
        request.setAmount(new BigDecimal("100000"));
        request.setPin("123456");
        request.setDescription("Test transfer");

        User recipientUser = User.createNewUser("recipientUser", "recipient@test.com", "089876543210", "Recipient User", "password");
        Wallet recipientWallet = Wallet.createWallet(recipientUser);
        setField(recipientWallet, "id", UUID.randomUUID());

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(authService.verifyPin(anyString(), anyString())).thenReturn(true);
        when(walletRepository.findByUserId(testUserId)).thenReturn(Optional.of(testWallet));
        when(userRepository.findByUsername("recipientUser")).thenReturn(Optional.of(recipientUser));
        when(walletRepository.findByUserId(any())).thenReturn(Optional.of(recipientWallet));
        when(paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.WALLET_TRANSFER)).thenReturn(paymentProcessor);

        Transaction tx = Transaction.create(testWallet, recipientWallet, new BigDecimal("100000"),
                BigDecimal.ZERO, Transaction.Type.TRANSFER, "REF456", "Test transfer");
        tx.complete();

        when(paymentProcessor.process(any())).thenReturn(PaymentResult.success(tx));

        // When
        PaymentResult result = transactionService.transfer(testUserId, request);

        // Then
        assertTrue(result.isSuccess());
        verify(notificationService, times(2)).sendTransactionNotification(any(), anyString(), anyString());
    }

    @Test
    void testTransfer_InsufficientBalance() {
        // Given
        setField(testWallet, "balance", new BigDecimal("50000")); // Low balance

        TransferRequest request = new TransferRequest();
        request.setRecipient("recipientUser");
        request.setAmount(new BigDecimal("100000"));
        request.setPin("123456");

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(authService.verifyPin(anyString(), anyString())).thenReturn(true);
        when(walletRepository.findByUserId(testUserId)).thenReturn(Optional.of(testWallet));

        User recipientUser = User.createNewUser("recipientUser", "recipient@test.com", "089876543210", "Recipient User", "password");
        Wallet recipientWallet = Wallet.createWallet(recipientUser);
        setField(recipientWallet, "id", UUID.randomUUID());

        when(userRepository.findByUsername("recipientUser")).thenReturn(Optional.of(recipientUser));
        when(walletRepository.findByUserId(any())).thenReturn(Optional.of(recipientWallet));
        when(paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.WALLET_TRANSFER)).thenReturn(paymentProcessor);
        when(paymentProcessor.process(any())).thenReturn(PaymentResult.failure("INSUFFICIENT_BALANCE", "Insufficient balance"));

        // When
        PaymentResult result = transactionService.transfer(testUserId, request);

        // Then
        assertFalse(result.isSuccess());
    }

    @Test
    void testPayBill_Success() {
        // Given
        BillPaymentRequest request = new BillPaymentRequest();
        request.setBillId(UUID.randomUUID());
        request.setCustomerId("123456789");
        request.setAmount(new BigDecimal("150000"));
        request.setPin("123456");

        Bill bill = Bill.create("PLN Electricity", Bill.Category.ELECTRICITY, "bolt", null);
        setField(bill, "id", request.getBillId());

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(authService.verifyPin(anyString(), anyString())).thenReturn(true);
        when(walletRepository.findByUserId(testUserId)).thenReturn(Optional.of(testWallet));
        when(paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.BILL_PAYMENT)).thenReturn(paymentProcessor);

        Transaction tx = Transaction.create(testWallet, null, new BigDecimal("150000"),
                new BigDecimal("1500"), Transaction.Type.BILL_PAYMENT, "REF789", "PLN Electricity");
        tx.complete();

        when(paymentProcessor.process(any())).thenReturn(PaymentResult.success(tx));

        // When
        PaymentResult result = transactionService.payBill(testUserId, request);

        // Then
        assertTrue(result.isSuccess());
    }

    private void setField(Object object, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = object.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(object, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

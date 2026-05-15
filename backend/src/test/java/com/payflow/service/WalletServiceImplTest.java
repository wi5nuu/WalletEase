package com.payflow.service;

import com.payflow.entity.User;
import com.payflow.entity.Wallet;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.mapper.WalletMapper;
import com.payflow.repository.UserRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.service.impl.WalletServiceImpl;
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
import static org.mockito.Mockito.*;

/**
 * Unit tests for WalletServiceImpl.
 * Tests credit, debit, balance checks, and ownership verification.
 */
@ExtendWith(MockitoExtension.class)
class WalletServiceImplTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletMapper walletMapper;

    @InjectMocks
    private WalletServiceImpl walletService;

    private User testUser;
    private Wallet testWallet;
    private UUID testUserId;
    private UUID testWalletId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testWalletId = UUID.randomUUID();
        
        testUser = User.createNewUser("testuser", "test@test.com", "081234567890", "Test User", "password");
        testWallet = Wallet.createWallet(testUser);
        // Use reflection to set ID since it's normally generated
        setField(testWallet, "id", testWalletId);
    }

    @Test
    void testCredit_Success() {
        // Given
        BigDecimal initialBalance = testWallet.getBalance();
        BigDecimal creditAmount = new BigDecimal("100000");
        
        when(walletRepository.findByUserId(testUserId)).thenReturn(Optional.of(testWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        testWallet.credit(creditAmount);
        
        // Then
        assertEquals(initialBalance.add(creditAmount), testWallet.getBalance());
    }

    @Test
    void testDebit_Success() {
        // Given
        BigDecimal initialBalance = new BigDecimal("500000");
        setField(testWallet, "balance", initialBalance);
        BigDecimal debitAmount = new BigDecimal("100000");

        // When
        testWallet.debit(debitAmount);
        
        // Then
        assertEquals(initialBalance.subtract(debitAmount), testWallet.getBalance());
    }

    @Test
    void testDebit_InsufficientBalance() {
        // Given
        BigDecimal initialBalance = new BigDecimal("50000");
        setField(testWallet, "balance", initialBalance);
        BigDecimal debitAmount = new BigDecimal("100000");

        // When & Then
        assertThrows(IllegalStateException.class, () -> testWallet.debit(debitAmount));
    }

    @Test
    void testHasSufficientBalance_True() {
        // Given
        BigDecimal balance = new BigDecimal("500000");
        setField(testWallet, "balance", balance);
        
        // Then
        assertTrue(testWallet.hasSufficientBalance(new BigDecimal("400000")));
        assertTrue(testWallet.hasSufficientBalance(new BigDecimal("500000")));
    }

    @Test
    void testHasSufficientBalance_False() {
        // Given
        BigDecimal balance = new BigDecimal("500000");
        setField(testWallet, "balance", balance);
        
        // Then
        assertFalse(testWallet.hasSufficientBalance(new BigDecimal("600000")));
    }

    @Test
    void testGetBalance_WalletNotFound() {
        // Given
        when(walletRepository.findByUserId(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> walletService.getBalance(testUserId));
    }

    @Test
    void testCreateWallet_UserNotFound() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> walletService.createWallet(testUserId));
    }

    @Test
    void testCreateWallet_AlreadyExists() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(walletRepository.existsByUserId(testUserId)).thenReturn(true);

        // When & Then
        assertThrows(IllegalStateException.class, () -> walletService.createWallet(testUserId));
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

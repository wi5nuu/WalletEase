package com.payflow.service;

import com.payflow.dto.request.LoginRequest;
import com.payflow.dto.request.RegisterRequest;
import com.payflow.dto.request.SetPinRequest;
import com.payflow.dto.response.AuthResponse;
import com.payflow.entity.User;
import com.payflow.exception.DuplicateResourceException;
import com.payflow.exception.InvalidPinException;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.repository.RefreshTokenRepository;
import com.payflow.repository.UserRepository;
import com.payflow.security.JwtTokenProvider;
import com.payflow.service.impl.AuthServiceImpl;
import com.payflow.service.interfaces.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthServiceImpl.
 * Tests registration, login, refresh token rotation, and PIN management.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@test.com");
        registerRequest.setPhone("081234567890");
        registerRequest.setFullName("Test User");
        registerRequest.setPassword("Test@123");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Test@123");

        testUser = User.createNewUser("testuser", "test@test.com", "081234567890", "Test User", "encodedPassword");
    }

    @Test
    void testRegister_Success() {
        // Given
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refreshToken");
        when(jwtTokenProvider.getAccessTokenExpiryMs()).thenReturn(900000L);

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        assertEquals("Test User", response.getUser().getFullName());
        verify(walletService).createWallet(any());
    }

    @Test
    void testRegister_DuplicateUsername() {
        // Given
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(true);

        // When & Then
        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
    }

    @Test
    void testRegister_DuplicateEmail() {
        // Given
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // When & Then
        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
    }

    @Test
    void testLogin_Success() {
        // Given
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refreshToken");
        when(jwtTokenProvider.getAccessTokenExpiryMs()).thenReturn(900000L);

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        verify(refreshTokenRepository).revokeAllUserTokens(testUser);
    }

    @Test
    void testLogin_WrongPassword() {
        // Given
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void testSetupPin_Success() {
        // Given
        SetPinRequest pinRequest = new SetPinRequest();
        pinRequest.setPin("123456");
        pinRequest.setConfirmPin("123456");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("123456")).thenReturn("encodedPin");
        when(userRepository.save(any())).thenReturn(testUser);

        // When
        authService.setupPin("testuser", pinRequest);

        // Then
        assertTrue(testUser.hasTransactionPin());
    }

    @Test
    void testSetupPin_PinsDoNotMatch() {
        // Given
        SetPinRequest pinRequest = new SetPinRequest();
        pinRequest.setPin("123456");
        pinRequest.setConfirmPin("654321");

        // When & Then
        assertThrows(InvalidPinException.class, () -> authService.setupPin("testuser", pinRequest));
    }

    @Test
    void testVerifyPin_Success() {
        // Given
        testUser.setTransactionPin("encodedPin");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("123456", "encodedPin")).thenReturn(true);

        // When
        boolean valid = authService.verifyPin("testuser", "123456");

        // Then
        assertTrue(valid);
    }

    @Test
    void testVerifyPin_NotSet() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(InvalidPinException.class, () -> authService.verifyPin("testuser", "123456"));
    }

    @Test
    void testVerifyPin_InvalidPin() {
        // Given
        testUser.setTransactionPin("encodedPin");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("123456", "encodedPin")).thenReturn(false);

        // When
        boolean valid = authService.verifyPin("testuser", "123456");

        // Then
        assertFalse(valid);
    }
}

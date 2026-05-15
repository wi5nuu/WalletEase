package com.payflow.service.impl;

import com.payflow.dto.request.LoginRequest;
import com.payflow.dto.request.RefreshTokenRequest;
import com.payflow.dto.request.RegisterRequest;
import com.payflow.dto.request.SetPinRequest;
import com.payflow.dto.response.AuthResponse;
import com.payflow.entity.RefreshToken;
import com.payflow.entity.User;
import com.payflow.exception.DuplicateResourceException;
import com.payflow.exception.InvalidPinException;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.repository.RefreshTokenRepository;
import com.payflow.repository.UserRepository;
import com.payflow.security.JwtTokenProvider;
import com.payflow.service.interfaces.AuthService;
import com.payflow.service.interfaces.WalletService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

/**
 * AuthServiceImpl - Concrete implementation of AuthService.
 * 
 * ABSTRACTION: Implements AuthService interface.
 * Handles authentication, registration, and token management.
 */
@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WalletService walletService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder,
                           UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           WalletService walletService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.walletService = walletService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicates
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("User", "phone", request.getPhone());
        }

        // Create user using factory method (ENCAPSULATION)
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.createNewUser(
                request.getUsername(),
                request.getEmail(),
                request.getPhone(),
                request.getFullName(),
                encodedPassword
        );

        User savedUser = userRepository.save(user);

        // Create wallet for new user
        walletService.createWallet(savedUser.getId());

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        // Save refresh token
        saveRefreshToken(savedUser, refreshToken);

        return buildAuthResponse(accessToken, refreshToken, savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Generate tokens
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            // Revoke old tokens and save new one
            refreshTokenRepository.revokeAllUserTokens(user);
            saveRefreshToken(user, refreshToken);

            return buildAuthResponse(accessToken, refreshToken, user);

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        // Find valid token
        RefreshToken refreshToken = refreshTokenRepository.findValidToken(token)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        if (refreshToken.isExpired()) {
            refreshToken.revoke();
            refreshTokenRepository.save(refreshToken);
            throw new BadCredentialsException("Refresh token has expired");
        }

        User user = refreshToken.getUser();

        // Revoke old token
        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Save new refresh token
        saveRefreshToken(user, newRefreshToken);

        return buildAuthResponse(newAccessToken, newRefreshToken, user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.revokeToken(refreshToken);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("#username == authentication.principal.username")
    public void setupPin(String username, SetPinRequest request) {
        if (!request.pinsMatch()) {
            throw new InvalidPinException("PINs do not match");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (user.hasTransactionPin()) {
            throw new IllegalStateException("PIN is already set. Use change PIN instead.");
        }

        String encodedPin = passwordEncoder.encode(request.getPin());
        user.setTransactionPin(encodedPin);
        userRepository.save(user);
    }

    @Override
    public boolean verifyPin(String username, String pin) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!user.hasTransactionPin()) {
            throw new InvalidPinException("Transaction PIN not set");
        }

        return passwordEncoder.matches(pin, user.getTransactionPinHash());
    }

    @Override
    @Transactional
    @PreAuthorize("#username == authentication.principal.username")
    public void changePin(String username, SetPinRequest request) {
        if (!request.pinsMatch()) {
            throw new InvalidPinException("New PINs do not match");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!user.hasTransactionPin()) {
            throw new InvalidPinException("Transaction PIN not set");
        }

        String encodedPin = passwordEncoder.encode(request.getPin());
        user.changeTransactionPin(encodedPin);
        userRepository.save(user);
    }

    private void saveRefreshToken(User user, String token) {
        Instant expiryInstant = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiryMs());
        LocalDateTime expiresAt = LocalDateTime.ofInstant(expiryInstant, ZoneId.systemDefault());
        
        RefreshToken refreshToken = RefreshToken.create(user, token, expiresAt);
        refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        AuthResponse.UserSummary userSummary = new AuthResponse.UserSummary(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.hasTransactionPin()
        );

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiryMs() / 1000,
                userSummary
        );
    }
}

package com.payflow.controller;

import com.payflow.dto.request.*;
import com.payflow.dto.response.AuthResponse;
import com.payflow.response.BaseResponse;
import com.payflow.exception.RateLimitExceededException;
import com.payflow.response.SuccessResponse;
import com.payflow.service.interfaces.AuthService;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Authentication Controller.
 * 
 * Handles user registration, login, token refresh, logout, and PIN management.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    
    // Rate limiting cache: IP -> attempt count
    private final Cache<String, AtomicInteger> loginAttempts = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(10000)
            .build();

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<BaseResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(SuccessResponse.of(response, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        
        // Rate limiting check
        String clientIp = getClientIp(httpRequest);
        AtomicInteger attempts = loginAttempts.get(clientIp, k -> new AtomicInteger(0));
        
        if (attempts.incrementAndGet() > 5) {
            throw new RateLimitExceededException(60);
        }
        
        AuthResponse response = authService.login(request);
        
        // Reset attempts on successful login
        loginAttempts.invalidate(clientIp);
        
        return ResponseEntity.ok(SuccessResponse.of(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<BaseResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(SuccessResponse.of(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(@RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok(SuccessResponse.of(null, "Logout successful"));
    }

    @PostMapping("/setup-pin")
    public ResponseEntity<BaseResponse<Void>> setupPin(
            @RequestHeader("X-Username") String username,
            @Valid @RequestBody SetPinRequest request) {
        authService.setupPin(username, request);
        return ResponseEntity.ok(SuccessResponse.of(null, "PIN setup successful"));
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<BaseResponse<Boolean>> verifyPin(
            @RequestHeader("X-Username") String username,
            @Valid @RequestBody VerifyPinRequest request) {
        boolean valid = authService.verifyPin(username, request.getPin());
        return ResponseEntity.ok(SuccessResponse.of(valid, valid ? "PIN valid" : "PIN invalid"));
    }

    @PostMapping("/change-pin")
    public ResponseEntity<BaseResponse<Void>> changePin(
            @RequestHeader("X-Username") String username,
            @Valid @RequestBody SetPinRequest request) {
        authService.changePin(username, request);
        return ResponseEntity.ok(SuccessResponse.of(null, "PIN changed successfully"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

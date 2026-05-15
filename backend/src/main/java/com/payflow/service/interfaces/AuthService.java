package com.payflow.service.interfaces;

import com.payflow.dto.request.LoginRequest;
import com.payflow.dto.request.RefreshTokenRequest;
import com.payflow.dto.request.RegisterRequest;
import com.payflow.dto.request.SetPinRequest;
import com.payflow.dto.response.AuthResponse;

/**
 * AuthService interface - ABSTRACTION for authentication operations.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

    void setupPin(String username, SetPinRequest request);

    boolean verifyPin(String username, String pin);

    void changePin(String username, SetPinRequest request);
}

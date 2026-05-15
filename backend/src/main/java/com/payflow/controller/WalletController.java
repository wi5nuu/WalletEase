package com.payflow.controller;

import com.payflow.response.BaseResponse;
import com.payflow.dto.response.WalletResponse;
import com.payflow.entity.User;
import com.payflow.repository.UserRepository;
import com.payflow.response.SuccessResponse;
import com.payflow.security.JwtTokenProvider;
import com.payflow.service.interfaces.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Wallet Controller.
 * 
 * Handles wallet balance queries and QR code generation.
 */
@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public WalletController(WalletService walletService, JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.walletService = walletService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @GetMapping("/balance")
    public ResponseEntity<BaseResponse<BigDecimal>> getBalance(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        BigDecimal balance = walletService.getBalance(userId);
        return ResponseEntity.ok(SuccessResponse.of(balance, "Balance retrieved successfully"));
    }

    @GetMapping("/details")
    public ResponseEntity<BaseResponse<WalletResponse>> getWalletDetails(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        WalletResponse wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(SuccessResponse.of(wallet, "Wallet details retrieved successfully"));
    }

    @GetMapping("/qr-code")
    public ResponseEntity<BaseResponse<String>> getQrCode(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = extractUserId(userDetails);
        String qrCode = walletService.generateQrCode(userId);
        return ResponseEntity.ok(SuccessResponse.of(qrCode, "QR code generated successfully"));
    }

    private UUID extractUserId(UserDetails userDetails) {
        // ABSTRACTION: Look up user by username to get UUID
        // This ensures proper user identification from JWT token
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

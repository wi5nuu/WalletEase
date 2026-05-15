package com.integration.controller;

import com.integration.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Gateway Controller - External payment gateway simulator.
 * 
 * Simulates realistic behavior:
 * - Random 5% chance of FAILED status
 * - 200-800ms artificial delay
 * - Returns gateway reference ID
 */
@RestController
@RequestMapping("/gateway")
public class GatewayController {

    private static final Logger logger = LoggerFactory.getLogger(GatewayController.class);
    private final Random random = new Random();

    @Value("${internal.api.key:internal-secret-key}")
    private String expectedApiKey;

    @PostMapping("/topup")
    public ResponseEntity<GatewayResponse> processTopUp(
            @RequestHeader(value = "X-Internal-Key", required = false) String apiKey,
            @RequestBody GatewayRequest request) {
        
        validateApiKey(apiKey);
        
        // Simulate network latency (200-800ms)
        simulateDelay();

        // Simulate 5% failure rate
        if (shouldFail()) {
            logger.warn("Simulated gateway failure for top-up request: {}", request.getIdempotencyKey());
            return ResponseEntity.ok(GatewayResponse.failed(
                    "GATEWAY_ERROR",
                    "Payment gateway temporarily unavailable"
            ));
        }

        String referenceId = generateReferenceId();
        logger.info("Top-up processed: wallet={}, amount={}, ref={}", 
                request.getWalletId(), request.getAmount(), referenceId);

        return ResponseEntity.ok(GatewayResponse.success(
                referenceId,
                request.getAmount(),
                request.getCurrency()
        ));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<GatewayResponse> processWithdraw(
            @RequestHeader(value = "X-Internal-Key", required = false) String apiKey,
            @RequestBody WithdrawRequest request) {
        
        validateApiKey(apiKey);
        
        simulateDelay();

        if (shouldFail()) {
            logger.warn("Simulated gateway failure for withdraw request: {}", request.getIdempotencyKey());
            return ResponseEntity.ok(GatewayResponse.failed(
                    "GATEWAY_ERROR",
                    "Withdrawal processing failed"
            ));
        }

        String referenceId = generateReferenceId();
        logger.info("Withdrawal processed: wallet={}, amount={}, ref={}", 
                request.getWalletId(), request.getAmount(), referenceId);

        return ResponseEntity.ok(GatewayResponse.success(
                referenceId,
                request.getAmount(),
                request.getCurrency()
        ));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<GatewayResponse> verifyPayment(
            @RequestHeader(value = "X-Internal-Key", required = false) String apiKey,
            @RequestBody VerifyRequest request) {
        
        validateApiKey(apiKey);
        
        simulateDelay(100, 300); // Faster for verification

        if (shouldFail()) {
            return ResponseEntity.ok(GatewayResponse.failed(
                    "VERIFICATION_FAILED",
                    "Payment verification failed"
            ));
        }

        String referenceId = generateReferenceId();
        logger.info("Payment verified: wallet={}, amount={}", 
                request.getWalletId(), request.getAmount());

        return ResponseEntity.ok(GatewayResponse.success(
                referenceId,
                request.getAmount(),
                request.getCurrency()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("UP");
    }

    private void validateApiKey(String apiKey) {
        if (apiKey == null || !apiKey.equals(expectedApiKey)) {
            throw new SecurityException("Invalid or missing API key");
        }
    }

    private void simulateDelay() {
        simulateDelay(200, 800);
    }

    private void simulateDelay(int minMs, int maxMs) {
        try {
            int delay = minMs + random.nextInt(maxMs - minMs);
            TimeUnit.MILLISECONDS.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private boolean shouldFail() {
        // 5% failure rate
        return random.nextInt(100) < 5;
    }

    private String generateReferenceId() {
        return "GW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

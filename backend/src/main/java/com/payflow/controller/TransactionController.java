package com.payflow.controller;

import com.payflow.dto.request.*;
import com.payflow.response.BaseResponse;
import com.payflow.dto.response.PageResponse;
import com.payflow.dto.response.PaymentResult;
import com.payflow.dto.response.TransactionResponse;
import com.payflow.entity.User;
import com.payflow.repository.UserRepository;
import com.payflow.response.SuccessResponse;
import com.payflow.service.interfaces.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Transaction Controller.
 * 
 * Handles all transaction operations: top-up, transfer, bill payment, QR payment,
 * and transaction history queries.
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/topup")
    public ResponseEntity<BaseResponse<PaymentResult>> topUp(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TopUpRequest request) {
        UUID userId = getUserId(userDetails);
        PaymentResult result = transactionService.topUp(userId, request);
        return ResponseEntity.ok(SuccessResponse.of(result, result.getMessage()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<BaseResponse<PaymentResult>> transfer(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransferRequest request) {
        UUID userId = getUserId(userDetails);
        PaymentResult result = transactionService.transfer(userId, request);
        return ResponseEntity.ok(SuccessResponse.of(result, result.getMessage()));
    }

    @PostMapping("/pay-bill")
    public ResponseEntity<BaseResponse<PaymentResult>> payBill(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BillPaymentRequest request) {
        UUID userId = getUserId(userDetails);
        PaymentResult result = transactionService.payBill(userId, request);
        return ResponseEntity.ok(SuccessResponse.of(result, result.getMessage()));
    }

    @PostMapping("/scan-qr")
    public ResponseEntity<BaseResponse<PaymentResult>> scanQr(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody QrPaymentRequest request) {
        UUID userId = getUserId(userDetails);
        PaymentResult result = transactionService.scanQrPayment(userId, request);
        return ResponseEntity.ok(SuccessResponse.of(result, result.getMessage()));
    }

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<TransactionResponse>>> getTransactionHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = getUserId(userDetails);
        PageResponse<TransactionResponse> history = transactionService.getTransactionHistory(
                userId, page, size, type, startDate, endDate);
        return ResponseEntity.ok(SuccessResponse.of(history, "Transaction history retrieved"));
    }

    @GetMapping("/recent")
    public ResponseEntity<BaseResponse<List<TransactionResponse>>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getUserId(userDetails);
        List<TransactionResponse> transactions = transactionService.getRecentTransactions(userId, limit);
        return ResponseEntity.ok(SuccessResponse.of(transactions, "Recent transactions retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<TransactionResponse>> getTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        UUID userId = getUserId(userDetails);
        TransactionResponse transaction = transactionService.getTransaction(userId, id);
        return ResponseEntity.ok(SuccessResponse.of(transaction, "Transaction retrieved"));
    }

    private UUID getUserId(UserDetails userDetails) {
        // ABSTRACTION: Look up user by username to get UUID
        // This ensures proper user identification from JWT token
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

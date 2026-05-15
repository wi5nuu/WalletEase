package com.payflow.controller.admin;

import com.payflow.dto.response.*;
import com.payflow.response.BaseResponse;
import com.payflow.entity.Transaction;
import com.payflow.repository.TransactionRepository;
import com.payflow.response.SuccessResponse;
import com.payflow.service.interfaces.UserService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin Controller.
 * 
 * Handles administrative endpoints for user management, transaction monitoring,
 * and analytics.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final TransactionRepository transactionRepository;

    public AdminController(UserService userService, TransactionRepository transactionRepository) {
        this.userService = userService;
        this.transactionRepository = transactionRepository;
    }

    private static final int MAX_PAGE_SIZE = 100;

    @GetMapping("/users")
    public ResponseEntity<BaseResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // Validate and cap page size to prevent abuse
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        org.springframework.data.domain.Page<UserResponse> usersPage = userService.searchUsers(search,
                org.springframework.data.domain.PageRequest.of(page, safeSize));
        PageResponse<UserResponse> users = new PageResponse<>(usersPage.getContent(), page, safeSize, usersPage.getTotalElements());
        return ResponseEntity.ok(SuccessResponse.of(users, "Users retrieved"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<BaseResponse<PageResponse<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, safeSize,
                        org.springframework.data.domain.Sort.by("createdAt").descending());
        
        org.springframework.data.domain.Page<Transaction> transactions;
        if (status != null && !status.isBlank()) {
            transactions = transactionRepository.findByStatus(Transaction.Status.valueOf(status.toUpperCase()), pageable);
        } else {
            transactions = transactionRepository.findAll(pageable);
        }
        
        // Simple mapping without wallet context
        List<TransactionResponse> responses = transactions.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        PageResponse<TransactionResponse> pageResponse = new PageResponse<>(
                responses, page, size, transactions.getTotalElements());
        
        return ResponseEntity.ok(SuccessResponse.of(pageResponse, "Transactions retrieved"));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getAnalyticsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        long totalUsers = userService.count();
        long totalTransactions = transactionRepository.countCompletedTransactions();
        
        BigDecimal totalVolume = transactionRepository.getTotalVolumeSince(
                LocalDateTime.now().minusYears(10));
        
        BigDecimal todayVolume = transactionRepository.getVolumeForDay(
                LocalDateTime.now().withHour(0).withMinute(0),
                LocalDateTime.now().plusDays(1).withHour(0).withMinute(0));
        
        summary.put("totalUsers", totalUsers);
        summary.put("totalTransactions", totalTransactions);
        summary.put("totalVolume", totalVolume);
        summary.put("todayVolume", todayVolume);
        
        return ResponseEntity.ok(SuccessResponse.of(summary, "Analytics summary retrieved"));
    }

    @GetMapping("/analytics/daily-volume")
    public ResponseEntity<BaseResponse<List<Map<String, Object>>>> getDailyVolume(
            @RequestParam(defaultValue = "30") int days) {
        List<Map<String, Object>> dailyVolumes = new java.util.ArrayList<>();
        
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            BigDecimal volume = transactionRepository.getVolumeForDay(startOfDay, endOfDay);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("volume", volume);
            dayData.put("count", transactionRepository.countByStatusAndDateRange(Transaction.Status.COMPLETED, startOfDay, endOfDay));
            
            dailyVolumes.add(dayData);
        }
        
        return ResponseEntity.ok(SuccessResponse.of(dailyVolumes, "Daily volume retrieved"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setAmount(transaction.getAmount());
        response.setFee(transaction.getFee());
        response.setTotalAmount(transaction.getTotalAmount());
        response.setType(transaction.getType().name());
        response.setStatus(transaction.getStatus().name());
        response.setReferenceCode(transaction.getReferenceCode());
        response.setDescription(transaction.getDescription());
        response.setCreatedAt(transaction.getCreatedAt());
        
        if (transaction.getSenderWallet() != null && transaction.getSenderWallet().getUser() != null) {
            TransactionResponse.PartyInfo sender = new TransactionResponse.PartyInfo();
            sender.setWalletId(transaction.getSenderWallet().getId());
            sender.setUsername(transaction.getSenderWallet().getUser().getUsername());
            sender.setFullName(transaction.getSenderWallet().getUser().getFullName());
            response.setSender(sender);
        }
        
        if (transaction.getReceiverWallet() != null && transaction.getReceiverWallet().getUser() != null) {
            TransactionResponse.PartyInfo receiver = new TransactionResponse.PartyInfo();
            receiver.setWalletId(transaction.getReceiverWallet().getId());
            receiver.setUsername(transaction.getReceiverWallet().getUser().getUsername());
            receiver.setFullName(transaction.getReceiverWallet().getUser().getFullName());
            response.setReceiver(receiver);
        }
        
        return response;
    }
}

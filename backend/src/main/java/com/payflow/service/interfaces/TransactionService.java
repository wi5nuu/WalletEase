package com.payflow.service.interfaces;

import com.payflow.dto.request.*;
import com.payflow.dto.response.PageResponse;
import com.payflow.dto.response.PaymentResult;
import com.payflow.dto.response.TransactionResponse;
import com.payflow.entity.Transaction;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * TransactionService interface - ABSTRACTION for transaction operations.
 */
public interface TransactionService extends BaseService<Transaction, UUID> {

    PaymentResult topUp(UUID userId, TopUpRequest request);

    PaymentResult transfer(UUID userId, TransferRequest request);

    PaymentResult payBill(UUID userId, BillPaymentRequest request);

    PaymentResult scanQrPayment(UUID userId, QrPaymentRequest request);

    PageResponse<TransactionResponse> getTransactionHistory(UUID userId, int page, int size, 
                                                               String type, LocalDate startDate, LocalDate endDate);

    List<TransactionResponse> getRecentTransactions(UUID userId, int limit);

    TransactionResponse getTransaction(UUID userId, UUID transactionId);

    Optional<Transaction> findByReferenceCode(String referenceCode);
}

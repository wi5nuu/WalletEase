package com.payflow.service.impl;

import com.payflow.dto.request.*;
import com.payflow.dto.response.PageResponse;
import com.payflow.dto.response.PaymentResult;
import com.payflow.dto.response.TransactionResponse;
import com.payflow.entity.Transaction;
import com.payflow.entity.User;
import com.payflow.entity.Wallet;
import com.payflow.exception.InvalidPinException;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.exception.UnauthorizedAccessException;
import com.payflow.mapper.TransactionMapper;
import com.payflow.payment.PaymentProcessor;
import com.payflow.payment.PaymentProcessorFactory;
import com.payflow.repository.TransactionRepository;
import com.payflow.repository.UserRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.service.interfaces.AuthService;
import com.payflow.service.interfaces.NotificationService;
import com.payflow.service.interfaces.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * TransactionServiceImpl - Concrete implementation of TransactionService.
 * 
 * ABSTRACTION: Implements TransactionService interface.
 * POLYMORPHISM: Uses PaymentProcessorFactory to get correct processor.
 */
@Service
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final NotificationService notificationService;
    private final PaymentProcessorFactory paymentProcessorFactory;
    private final TransactionMapper transactionMapper;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                   WalletRepository walletRepository,
                                   UserRepository userRepository,
                                   AuthService authService,
                                   NotificationService notificationService,
                                   PaymentProcessorFactory paymentProcessorFactory,
                                   TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.notificationService = notificationService;
        this.paymentProcessorFactory = paymentProcessorFactory;
        this.transactionMapper = transactionMapper;
    }

    @Override
    public Optional<Transaction> findById(UUID id) {
        return transactionRepository.findById(id);
    }

    @Override
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    @Override
    @Transactional
    public Transaction save(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        transactionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return transactionRepository.existsById(id);
    }

    @Override
    public long count() {
        return transactionRepository.count();
    }

    @Override
    @Transactional
    @PreAuthorize("#userId == authentication.principal.username")
    public PaymentResult topUp(UUID userId, TopUpRequest request) {
        // Verify PIN
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        verifyPin(user, request.getPin());

        // Get wallet
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        // Build payment request
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setType(PaymentProcessor.PaymentType.TOP_UP);
        paymentRequest.setSenderWalletId(wallet.getId());
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setIdempotencyKey(request.getIdempotencyKey());

        // Get processor and execute
        PaymentProcessor processor = paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.TOP_UP);
        PaymentResult result = processor.process(paymentRequest);

        // Send notification if successful
        if (result.isSuccess()) {
            String message = String.format("Your wallet has been topped up with Rp %, .2f", request.getAmount());
            notificationService.sendTransactionNotification(userId, "Top-up Successful", message);
        }

        return result;
    }

    @Override
    @Transactional
    @PreAuthorize("#userId == authentication.principal.username")
    public PaymentResult transfer(UUID userId, TransferRequest request) {
        // Verify PIN
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        verifyPin(user, request.getPin());

        // Get sender wallet
        Wallet senderWallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        // Find recipient wallet by username, phone, or wallet ID
        Wallet receiverWallet = findRecipientWallet(request.getRecipient());

        // Build payment request
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setType(PaymentProcessor.PaymentType.WALLET_TRANSFER);
        paymentRequest.setSenderWalletId(senderWallet.getId());
        paymentRequest.setReceiverWalletId(receiverWallet.getId());
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setDescription(request.getDescription());
        paymentRequest.setIdempotencyKey(request.getIdempotencyKey());

        // Get processor and execute
        PaymentProcessor processor = paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.WALLET_TRANSFER);
        PaymentResult result = processor.process(paymentRequest);

        // Send notifications if successful
        if (result.isSuccess()) {
            // Notify sender
            String senderMessage = String.format("You sent Rp %, .2f to %s", 
                    request.getAmount(), receiverWallet.getUser().getFullName());
            notificationService.sendTransactionNotification(userId, "Transfer Sent", senderMessage);

            // Notify receiver
            String receiverMessage = String.format("You received Rp %, .2f from %s",
                    request.getAmount(), user.getFullName());
            notificationService.sendTransactionNotification(
                    receiverWallet.getUser().getId(), 
                    "Transfer Received", 
                    receiverMessage
            );
        }

        return result;
    }

    @Override
    @Transactional
    @PreAuthorize("#userId == authentication.principal.username")
    public PaymentResult payBill(UUID userId, BillPaymentRequest request) {
        // Verify PIN
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        verifyPin(user, request.getPin());

        // Get wallet
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        // Build payment request
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setType(PaymentProcessor.PaymentType.BILL_PAYMENT);
        paymentRequest.setSenderWalletId(wallet.getId());
        paymentRequest.setBillId(request.getBillId());
        paymentRequest.setCustomerId(request.getCustomerId());
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setIdempotencyKey(request.getIdempotencyKey());

        // Get processor and execute
        PaymentProcessor processor = paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.BILL_PAYMENT);
        PaymentResult result = processor.process(paymentRequest);

        // Send notification if successful
        if (result.isSuccess()) {
            String message = String.format("Bill payment of Rp %, .2f was successful", request.getAmount());
            notificationService.sendTransactionNotification(userId, "Bill Payment Successful", message);
        }

        return result;
    }

    @Override
    @Transactional
    @PreAuthorize("#userId == authentication.principal.username")
    public PaymentResult scanQrPayment(UUID userId, QrPaymentRequest request) {
        // Verify PIN
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        verifyPin(user, request.getPin());

        // Get sender wallet
        Wallet senderWallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        // Get receiver wallet
        Wallet receiverWallet = walletRepository.findById(request.getRecipientWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", request.getRecipientWalletId()));

        // Build payment request
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setType(PaymentProcessor.PaymentType.QR_PAYMENT);
        paymentRequest.setSenderWalletId(senderWallet.getId());
        paymentRequest.setReceiverWalletId(receiverWallet.getId());
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setDescription(request.getDescription());
        paymentRequest.setIdempotencyKey(request.getIdempotencyKey());

        // Get processor and execute
        PaymentProcessor processor = paymentProcessorFactory.getProcessor(PaymentProcessor.PaymentType.QR_PAYMENT);
        PaymentResult result = processor.process(paymentRequest);

        // Send notifications if successful
        if (result.isSuccess()) {
            String senderMessage = String.format("QR Payment of Rp %, .2f sent to %s", 
                    request.getAmount(), receiverWallet.getUser().getFullName());
            notificationService.sendTransactionNotification(userId, "QR Payment Sent", senderMessage);

            String receiverMessage = String.format("QR Payment received: Rp %, .2f from %s",
                    request.getAmount(), user.getFullName());
            notificationService.sendTransactionNotification(
                    receiverWallet.getUser().getId(), 
                    "QR Payment Received", 
                    receiverMessage
            );
        }

        return result;
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public PageResponse<TransactionResponse> getTransactionHistory(UUID userId, int page, int size,
                                                                      String type, LocalDate startDate, LocalDate endDate) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Transaction> transactions;

        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(23, 59, 59);
            transactions = transactionRepository.findByWalletIdAndDateRange(wallet.getId(), start, end, pageable);
        } else if (type != null && !type.isBlank()) {
            try {
                Transaction.Type txType = Transaction.Type.valueOf(type.toUpperCase());
                transactions = transactionRepository.findByWalletIdAndType(wallet.getId(), txType, pageable);
            } catch (IllegalArgumentException e) {
                transactions = transactionRepository.findByWalletId(wallet.getId(), pageable);
            }
        } else {
            transactions = transactionRepository.findByWalletId(wallet.getId(), pageable);
        }

        List<TransactionResponse> responses = transactions.getContent().stream()
                .map(tx -> transactionMapper.toResponse(tx, wallet.getId()))
                .collect(Collectors.toList());

        return new PageResponse<>(responses, page, size, transactions.getTotalElements());
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public List<TransactionResponse> getRecentTransactions(UUID userId, int limit) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        List<Transaction> transactions = transactionRepository
                .findTop5BySenderWalletIdOrReceiverWalletIdOrderByCreatedAtDesc(
                        wallet.getId(), wallet.getId());

        return transactions.stream()
                .map(tx -> transactionMapper.toResponse(tx, wallet.getId()))
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public TransactionResponse getTransaction(UUID userId, UUID transactionId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", transactionId));

        // Verify ownership
        boolean isOwner = transaction.getSenderWallet() != null && 
                         transaction.getSenderWallet().getId().equals(wallet.getId()) ||
                         transaction.getReceiverWallet() != null && 
                         transaction.getReceiverWallet().getId().equals(wallet.getId());

        if (!isOwner) {
            throw new UnauthorizedAccessException("You don't have access to this transaction");
        }

        return transactionMapper.toResponse(transaction, wallet.getId());
    }

    @Override
    public Optional<Transaction> findByReferenceCode(String referenceCode) {
        return transactionRepository.findByReferenceCode(referenceCode);
    }

    private void verifyPin(User user, String pin) {
        if (!authService.verifyPin(user.getUsername(), pin)) {
            throw new InvalidPinException();
        }
    }

    private Wallet findRecipientWallet(String identifier) {
        // Try to find by username
        Optional<User> user = userRepository.findByUsername(identifier);
        if (user.isPresent()) {
            return walletRepository.findByUserId(user.get().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "username", identifier));
        }

        // Try to find by phone
        user = userRepository.findByPhone(identifier);
        if (user.isPresent()) {
            return walletRepository.findByUserId(user.get().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "phone", identifier));
        }

        // Try to find by wallet ID (UUID)
        try {
            UUID walletId = UUID.fromString(identifier);
            return walletRepository.findById(walletId)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", identifier));
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Recipient", "identifier", identifier);
        }
    }
}

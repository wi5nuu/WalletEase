package com.payflow.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Wallet Audit Trail - Immutable record of every balance change.
 *
 * This table provides a complete, tamper-proof history of all wallet
 * balance modifications. Each credit, debit, top-up, and fee deduction
 * creates an audit record.
 *
 * IMPORTANT: This table should NEVER have UPDATE or DELETE operations.
 * Records are append-only for financial audit compliance.
 */
@Entity
@Table(name = "wallet_audit", indexes = {
    @Index(name = "idx_audit_wallet_id", columnList = "walletId"),
    @Index(name = "idx_audit_transaction_id", columnList = "transactionId"),
    @Index(name = "idx_audit_created_at", columnList = "createdAt")
})
public class WalletAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "wallet_id", nullable = false)
    private UUID walletId;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "operation_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private OperationType operationType;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_before", nullable = false, precision = 18, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", nullable = false, precision = 18, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum OperationType {
        CREDIT,         // Money added to wallet
        DEBIT,          // Money removed from wallet
        TOP_UP,         // External top-up
        TRANSFER_IN,    // Received transfer
        TRANSFER_OUT,   // Sent transfer
        BILL_PAYMENT,   // Bill payment deduction
        FEE,            // Transaction fee
        REFUND          // Refund credit
    }

    protected WalletAudit() {
    }

    public static WalletAudit record(UUID walletId, WalletAudit.OperationType type,
                                      BigDecimal amount, BigDecimal balanceBefore,
                                      BigDecimal balanceAfter, String description) {
        WalletAudit audit = new WalletAudit();
        audit.walletId = walletId;
        audit.operationType = type;
        audit.amount = amount;
        audit.balanceBefore = balanceBefore;
        audit.balanceAfter = balanceAfter;
        audit.description = description;
        audit.createdAt = LocalDateTime.now();
        return audit;
    }

    public static WalletAudit record(UUID walletId, UUID transactionId,
                                      WalletAudit.OperationType type,
                                      BigDecimal amount, BigDecimal balanceBefore,
                                      BigDecimal balanceAfter, String description) {
        WalletAudit audit = record(walletId, type, amount, balanceBefore, balanceAfter, description);
        audit.transactionId = transactionId;
        return audit;
    }

    // Getters only - immutable after creation
    public UUID getId() { return id; }
    public UUID getWalletId() { return walletId; }
    public UUID getTransactionId() { return transactionId; }
    public OperationType getOperationType() { return operationType; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

package com.payflow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Transaction entity representing all financial movements.
 * 
 * INHERITANCE: Extends BaseEntity for common audit fields.
 * 
 * This entity is immutable after creation (except status updates) to ensure
 * financial audit trail integrity.
 */
@Entity
@Table(name = "transactions")
public class Transaction extends BaseEntity {

    public enum Type {
        TOP_UP,
        TRANSFER,
        BILL_PAYMENT,
        QR_PAYMENT,
        REFUND
    }

    public enum Status {
        PENDING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    // Sender (nullable for top-ups from external sources)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_wallet_id")
    private Wallet senderWallet;

    // Receiver (nullable for bill payments that leave the system)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_wallet_id")
    private Wallet receiverWallet;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(name = "type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private Type type;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(name = "reference_code", unique = true, nullable = false, length = 50)
    private String referenceCode;

    @Column(name = "description", length = 255)
    private String description;

    // Store additional data as JSONB
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    // Transient field for parsed metadata
    @Transient
    private Map<String, Object> metadataMap = new HashMap<>();

    // Default constructor (required by JPA)
    protected Transaction() {
    }

    // Factory method for creating transactions
    public static Transaction create(
            Wallet senderWallet,
            Wallet receiverWallet,
            BigDecimal amount,
            BigDecimal fee,
            Type type,
            String referenceCode,
            String description) {
        
        Transaction tx = new Transaction();
        tx.senderWallet = senderWallet;
        tx.receiverWallet = receiverWallet;
        tx.amount = amount;
        tx.fee = fee != null ? fee : BigDecimal.ZERO;
        tx.type = type;
        tx.referenceCode = referenceCode;
        tx.description = description;
        tx.status = Status.PENDING;
        return tx;
    }

    // Getters - all fields are read-only after creation
    public Wallet getSenderWallet() {
        return senderWallet;
    }

    public Wallet getReceiverWallet() {
        return receiverWallet;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public BigDecimal getTotalAmount() {
        return amount.add(fee);
    }

    public Type getType() {
        return type;
    }

    public Status getStatus() {
        return status;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public String getDescription() {
        return description;
    }

    public String getMetadata() {
        return metadata;
    }

    // Status can be updated (the only mutable field)
    public void complete() {
        if (this.status != Status.PENDING) {
            throw new IllegalStateException("Only pending transactions can be completed");
        }
        this.status = Status.COMPLETED;
    }

    public void fail() {
        if (this.status != Status.PENDING) {
            throw new IllegalStateException("Only pending transactions can be marked as failed");
        }
        this.status = Status.FAILED;
    }

    public void cancel() {
        if (this.status != Status.PENDING) {
            throw new IllegalStateException("Only pending transactions can be cancelled");
        }
        this.status = Status.CANCELLED;
    }

    // Metadata methods
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public void addMetadata(String key, Object value) {
        metadataMap.put(key, value);
    }

    public Object getMetadataValue(String key) {
        return metadataMap.get(key);
    }

    // Helper methods
    public boolean isIncomingFor(Wallet wallet) {
        return receiverWallet != null && receiverWallet.equals(wallet);
    }

    public boolean isOutgoingFrom(Wallet wallet) {
        return senderWallet != null && senderWallet.equals(wallet);
    }

    public boolean isCompleted() {
        return status == Status.COMPLETED;
    }

    public boolean isPending() {
        return status == Status.PENDING;
    }

    public boolean isFailed() {
        return status == Status.FAILED;
    }
}

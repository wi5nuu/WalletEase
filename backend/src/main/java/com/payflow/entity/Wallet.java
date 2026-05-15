package com.payflow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Wallet entity demonstrating ENCAPSULATION (OOP Pillar #1)
 * Balance is a CRITICAL financial field - it can ONLY be modified via
 * domain methods credit() and debit() - NEVER via setter.
 * 
 * INHERITANCE: Extends BaseEntity for common audit fields.
 */
@Entity
@Table(name = "wallets")
public class Wallet extends BaseEntity {

    // ENCAPSULATION: All fields private
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ENCAPSULATION: balance has NO setter - MUST use credit() or debit() methods
    @Column(name = "balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "IDR";

    // One-to-Many: Transactions where this wallet is the sender
    @OneToMany(mappedBy = "senderWallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> sentTransactions = new ArrayList<>();

    // One-to-Many: Transactions where this wallet is the receiver
    @OneToMany(mappedBy = "receiverWallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> receivedTransactions = new ArrayList<>();

    // Default constructor (required by JPA)
    protected Wallet() {
    }

    // Factory method for creating wallets
    public static Wallet createWallet(User user) {
        Wallet wallet = new Wallet();
        wallet.user = user;
        wallet.balance = BigDecimal.ZERO;
        wallet.currency = "IDR";
        return wallet;
    }

    // ENCAPSULATION: Public getters
    public User getUser() {
        return user;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getCurrency() {
        return currency;
    }

    public List<Transaction> getSentTransactions() {
        return sentTransactions;
    }

    public List<Transaction> getReceivedTransactions() {
        return receivedTransactions;
    }

    // ENCAPSULATION: NO public setter for balance - domain methods only

    /**
     * ENCAPSULATION: Domain method to credit (add) money to wallet.
     * This is the ONLY way to increase balance.
     * 
     * @param amount Must be positive
     * @throws IllegalArgumentException if amount is null, negative, or zero
     */
    public void credit(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        // Check for maximum balance limit (Rp 500 billion)
        BigDecimal maxLimit = new BigDecimal("500000000000");
        if (this.balance.add(amount).compareTo(maxLimit) > 0) {
            throw new IllegalArgumentException("Wallet balance cannot exceed Rp 500,000,000,000");
        }
        this.balance = this.balance.add(amount);
    }

    /**
     * ENCAPSULATION: Domain method to debit (subtract) money from wallet.
     * This is the ONLY way to decrease balance.
     * 
     * @param amount Must be positive and not exceed current balance
     * @throws IllegalArgumentException if amount is null, negative, zero, or exceeds balance
     */
    public void debit(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (amount.compareTo(this.balance) > 0) {
            throw new IllegalStateException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
    }

    /**
     * Check if wallet has sufficient balance for a transaction.
     * 
     * @param amount The amount to check
     * @return true if balance >= amount
     */
    public boolean hasSufficientBalance(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        return this.balance.compareTo(amount) >= 0;
    }

    /**
     * Get all transactions (both sent and received) for this wallet.
     * Returns a new list to prevent external modification.
     * 
     * @return Combined list of all transactions
     */
    public List<Transaction> getAllTransactions() {
        List<Transaction> all = new ArrayList<>();
        all.addAll(sentTransactions);
        all.addAll(receivedTransactions);
        return all;
    }
}

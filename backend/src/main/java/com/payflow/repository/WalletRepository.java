package com.payflow.repository;

import com.payflow.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Wallet entity.
 * Extends JpaRepository for basic CRUD operations.
 *
 * PESSIMISTIC LOCKING: findByIdWithLock() uses SELECT ... FOR UPDATE
 * to prevent race conditions during concurrent transfers.
 */
@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    Optional<Wallet> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    @Query("SELECT w.balance FROM Wallet w WHERE w.id = :walletId")
    Optional<BigDecimal> findBalanceById(@Param("walletId") UUID walletId);

    @Query("SELECT SUM(w.balance) FROM Wallet w")
    BigDecimal getTotalBalance();

    @Modifying
    @Query("UPDATE Wallet w SET w.balance = :balance WHERE w.id = :walletId")
    int updateBalance(@Param("walletId") UUID walletId, @Param("balance") BigDecimal balance);

    /**
     * PESSIMISTIC LOCKING: Acquires a database-level row lock (SELECT ... FOR UPDATE).
     * MUST be called within a @Transactional method.
     * This prevents concurrent transactions from reading/writing the same wallet
     * until the current transaction commits.
     *
     * Usage: Always lock BOTH sender and receiver wallets in consistent order
     * (e.g., by UUID comparison) to prevent deadlocks.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :walletId")
    Optional<Wallet> findByIdWithLock(@Param("walletId") UUID walletId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserIdWithLock(@Param("userId") UUID userId);
}

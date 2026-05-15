package com.payflow.repository;

import com.payflow.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Transaction entity.
 * Extends JpaRepository for basic CRUD operations.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t WHERE t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId")
    Page<Transaction> findByWalletId(@Param("walletId") UUID walletId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId")
    List<Transaction> findByWalletId(@Param("walletId") UUID walletId);

    @Query("SELECT t FROM Transaction t WHERE (t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId) " +
           "AND t.type = :type")
    Page<Transaction> findByWalletIdAndType(@Param("walletId") UUID walletId, 
                                              @Param("type") Transaction.Type type, 
                                              Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.senderWallet.id = :walletId OR t.receiverWallet.id = :walletId) " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    Page<Transaction> findByWalletIdAndDateRange(@Param("walletId") UUID walletId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate,
                                                   Pageable pageable);

    Optional<Transaction> findByReferenceCode(String referenceCode);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'COMPLETED' AND t.createdAt >= :since")
    BigDecimal getTotalVolumeSince(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'COMPLETED' " +
           "AND t.createdAt >= :startDate AND t.createdAt < :endDate")
    BigDecimal getVolumeForDay(@Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'COMPLETED'")
    long countCompletedTransactions();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = :status")
    long countByStatus(@Param("status") Transaction.Status status);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = :status " +
           "AND t.createdAt >= :startDate AND t.createdAt < :endDate")
    long countByStatusAndDateRange(@Param("status") Transaction.Status status,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status")
    Page<Transaction> findByStatus(@Param("status") Transaction.Status status, Pageable pageable);

    List<Transaction> findTop5BySenderWalletIdOrReceiverWalletIdOrderByCreatedAtDesc(
            UUID senderWalletId, UUID receiverWalletId);
}

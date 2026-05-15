package com.payflow.repository;

import com.payflow.entity.WalletAudit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for WalletAudit entity.
 * Append-only - no update or delete operations.
 */
@Repository
public interface WalletAuditRepository extends JpaRepository<WalletAudit, UUID> {

    List<WalletAudit> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    List<WalletAudit> findByTransactionId(UUID transactionId);
}

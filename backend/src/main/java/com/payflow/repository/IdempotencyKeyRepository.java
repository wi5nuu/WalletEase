package com.payflow.repository;

import com.payflow.entity.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for IdempotencyKey entity.
 * Used to prevent duplicate payment processing.
 */
@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, java.util.UUID> {

    Optional<IdempotencyKey> findByKeyValue(String keyValue);

    boolean existsByKeyValue(String keyValue);

    @Modifying
    @Query("DELETE FROM IdempotencyKey k WHERE k.expiresAt < :now")
    int deleteExpiredKeys(@Param("now") LocalDateTime now);
}

package com.payflow.config;

import com.payflow.repository.IdempotencyKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduled task to clean up expired idempotency keys.
 * Runs every hour to remove keys older than 24 hours.
 */
@Component
public class IdempotencyCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(IdempotencyCleanupTask.class);

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    public IdempotencyCleanupTask(IdempotencyKeyRepository idempotencyKeyRepository) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
    }

    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void cleanupExpiredKeys() {
        int deleted = idempotencyKeyRepository.deleteExpiredKeys(LocalDateTime.now());
        if (deleted > 0) {
            logger.info("Cleaned up {} expired idempotency keys", deleted);
        }
    }
}

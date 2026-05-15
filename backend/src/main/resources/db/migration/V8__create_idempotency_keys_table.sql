-- V8: Create idempotency_keys table
-- Prevents duplicate payment processing on network retries

CREATE TABLE idempotency_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_value       VARCHAR(100) NOT NULL UNIQUE,
    request_type    VARCHAR(30) NOT NULL,
    wallet_id       UUID,
    response_status VARCHAR(20),
    response_body   TEXT,
    transaction_id  UUID,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by key value
CREATE INDEX idx_idempotency_key_value ON idempotency_keys(key_value);

-- Index for cleanup of expired keys
CREATE INDEX idx_idempotency_expires_at ON idempotency_keys(expires_at);

-- Index for wallet-based queries
CREATE INDEX idx_idempotency_wallet_id ON idempotency_keys(wallet_id);

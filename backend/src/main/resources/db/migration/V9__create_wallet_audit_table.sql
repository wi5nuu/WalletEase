-- V9: Create wallet_audit table
-- Immutable append-only audit trail for all balance changes

CREATE TABLE wallet_audit (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID NOT NULL,
    transaction_id  UUID,
    operation_type  VARCHAR(20) NOT NULL,
    amount          DECIMAL(18,2) NOT NULL,
    balance_before  DECIMAL(18,2) NOT NULL,
    balance_after   DECIMAL(18,2) NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for wallet history lookups
CREATE INDEX idx_audit_wallet_id ON wallet_audit(wallet_id);

-- Index for transaction-based lookups
CREATE INDEX idx_audit_transaction_id ON wallet_audit(transaction_id);

-- Index for chronological queries
CREATE INDEX idx_audit_created_at ON wallet_audit(created_at);

-- Index for operation type filtering
CREATE INDEX idx_audit_operation_type ON wallet_audit(operation_type);

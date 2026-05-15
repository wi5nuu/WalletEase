-- V4: Create refresh_tokens table
-- Stores JWT refresh tokens for secure token rotation

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(512) UNIQUE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Auto-cleanup of expired tokens
-- Note: In production, consider a scheduled job to clean expired tokens
CREATE INDEX idx_refresh_tokens_cleanup ON refresh_tokens(expires_at) WHERE expires_at < now();

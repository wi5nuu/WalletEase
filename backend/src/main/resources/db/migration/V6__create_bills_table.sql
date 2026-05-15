-- V6: Create bills table
-- Stores available bill types and providers

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon_code VARCHAR(50),
    fixed_amount DECIMAL(18,2),
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_bills_category ON bills(category);
CREATE INDEX idx_bills_is_active ON bills(is_active);

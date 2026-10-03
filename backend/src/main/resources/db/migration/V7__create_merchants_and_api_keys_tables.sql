CREATE TABLE IF NOT EXISTS merchants (
    id BIGSERIAL PRIMARY KEY,
    merchant_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    merchant_type VARCHAR(50) NOT NULL DEFAULT 'BUSINESS',
    account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    verification_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    settlement_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_merchant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_merchant_id ON merchants(merchant_id);

CREATE TABLE IF NOT EXISTS merchant_api_keys (
    id BIGSERIAL PRIMARY KEY,
    key_id VARCHAR(50) NOT NULL UNIQUE,
    merchant_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    prefix VARCHAR(50) NOT NULL,
    hashed_key VARCHAR(64) NOT NULL,
    environment VARCHAR(20) NOT NULL DEFAULT 'TEST',
    scopes VARCHAR(255) NOT NULL DEFAULT 'payments:read,payments:create',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_used_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_api_key_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    CONSTRAINT chk_api_key_status CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    CONSTRAINT chk_api_key_env CHECK (environment IN ('TEST', 'LIVE'))
);

CREATE INDEX IF NOT EXISTS idx_api_keys_merchant_id ON merchant_api_keys(merchant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON merchant_api_keys(prefix);

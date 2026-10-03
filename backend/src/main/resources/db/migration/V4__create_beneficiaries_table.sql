CREATE TABLE IF NOT EXISTS beneficiaries (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_last_four VARCHAR(4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_beneficiary_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_beneficiary_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT uk_beneficiary_owner_recipient UNIQUE (owner_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_owner_id ON beneficiaries(owner_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_recipient_id ON beneficiaries(recipient_id);

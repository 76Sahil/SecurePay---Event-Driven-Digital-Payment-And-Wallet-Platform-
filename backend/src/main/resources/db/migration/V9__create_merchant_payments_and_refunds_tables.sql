CREATE TABLE IF NOT EXISTS merchant_payments (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    reference VARCHAR(64) NOT NULL UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(120) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    method VARCHAR(30) NOT NULL DEFAULT 'UPI',
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    description VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT,
    CONSTRAINT chk_payment_status CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_payment_method CHECK (method IN ('UPI', 'CARD', 'NET_BANKING', 'WALLET'))
);

CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON merchant_payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON merchant_payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON merchant_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON merchant_payments(created_at);

CREATE TABLE IF NOT EXISTS merchant_refunds (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    payment_id BIGINT NOT NULL,
    reference VARCHAR(64) NOT NULL UNIQUE,
    payment_reference VARCHAR(64) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refund_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES merchant_payments(id) ON DELETE CASCADE,
    CONSTRAINT chk_refund_status CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_refunds_merchant_id ON merchant_refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON merchant_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_reference ON merchant_refunds(reference);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON merchant_refunds(created_at);

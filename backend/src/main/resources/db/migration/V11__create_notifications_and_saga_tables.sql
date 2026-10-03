CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    title VARCHAR(150) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    transaction_id VARCHAR(50),
    payment_id VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_notification_type CHECK (type IN ('TRANSACTION', 'PAYMENT', 'SECURITY', 'SYSTEM')),
    CONSTRAINT chk_notification_status CHECK (status IN ('UNREAD', 'READ'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE TABLE IF NOT EXISTS saga_instances (
    id BIGSERIAL PRIMARY KEY,
    saga_id VARCHAR(100) NOT NULL UNIQUE,
    saga_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_SETTLEMENT',
    user_id BIGINT NOT NULL,
    current_step VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'STARTED',
    payload TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saga_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_saga_status CHECK (status IN ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'COMPENSATED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_saga_instances_saga_id ON saga_instances(saga_id);
CREATE INDEX IF NOT EXISTS idx_saga_instances_user_id ON saga_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_saga_instances_status ON saga_instances(status);

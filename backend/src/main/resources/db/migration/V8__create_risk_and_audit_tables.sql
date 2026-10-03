CREATE TABLE IF NOT EXISTS risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    transaction_id BIGINT,
    risk_score INT NOT NULL,
    decision VARCHAR(20) NOT NULL,
    reasons VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_risk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_risk_decision CHECK (decision IN ('ALLOWED', 'FLAGGED', 'BLOCKED'))
);

CREATE INDEX IF NOT EXISTS idx_risk_user_id ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_created_at ON risk_assessments(created_at);

CREATE TABLE IF NOT EXISTS security_audit_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id BIGINT,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    details VARCHAR(1000),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_audit_severity CHECK (severity IN ('INFO', 'WARN', 'CRITICAL'))
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON security_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON security_audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON security_audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON security_audit_events(severity);

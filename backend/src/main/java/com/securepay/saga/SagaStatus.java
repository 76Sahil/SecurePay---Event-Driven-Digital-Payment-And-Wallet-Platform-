package com.securepay.saga;

public enum SagaStatus {
    STARTED,
    IN_PROGRESS,
    COMPLETED,
    COMPENSATED,
    FAILED
}

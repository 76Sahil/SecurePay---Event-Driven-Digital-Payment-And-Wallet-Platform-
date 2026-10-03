package com.securepay.saga.dto;

import java.util.List;

public record SagaExecutionResponse(
        String sagaId,
        String status,
        List<String> executedSteps,
        boolean compensated,
        String compensationReason,
        String message
) {}

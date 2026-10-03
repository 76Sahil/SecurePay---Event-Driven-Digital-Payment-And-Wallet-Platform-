package com.securepay.gateway.dto;

import java.math.BigDecimal;

public record CreateOrderRequest(
        BigDecimal amount,
        String currency,
        String receipt
) {}

package com.securepay.gateway.dto;

import java.math.BigDecimal;

public record GatewayOrderResponse(
        String orderId,
        BigDecimal amount,
        String currency,
        String receipt,
        String status,
        String keyId,
        String provider
) {}

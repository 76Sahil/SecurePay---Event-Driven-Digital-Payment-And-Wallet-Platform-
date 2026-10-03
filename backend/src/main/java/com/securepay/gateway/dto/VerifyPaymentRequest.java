package com.securepay.gateway.dto;

public record VerifyPaymentRequest(
        String orderId,
        String paymentId,
        String signature
) {}

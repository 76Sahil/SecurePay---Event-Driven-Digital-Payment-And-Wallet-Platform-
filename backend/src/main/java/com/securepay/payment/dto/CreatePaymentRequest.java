package com.securepay.payment.dto;

import java.math.BigDecimal;

public record CreatePaymentRequest(
        BigDecimal amount,
        String currency,
        String customerName,
        String customerEmail,
        String method,
        String description
) {
    public CreatePaymentRequest {
        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }
        if (method == null || method.isBlank()) {
            method = "UPI";
        }
    }
}

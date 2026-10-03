package com.securepay.payment.dto;

import com.securepay.payment.MerchantPayment;

import java.math.BigDecimal;

public record MerchantPaymentResponse(
        String id,
        String reference,
        String customerName,
        String customerEmail,
        BigDecimal amount,
        String currency,
        String method,
        String status,
        String description,
        String createdAt
) {
    public static MerchantPaymentResponse from(MerchantPayment p) {
        return new MerchantPaymentResponse(
                String.valueOf(p.getId()),
                p.getReference(),
                p.getCustomerName(),
                p.getCustomerEmail(),
                p.getAmount(),
                p.getCurrency(),
                p.getMethod(),
                p.getStatus(),
                p.getDescription(),
                p.getCreatedAt().toString()
        );
    }
}

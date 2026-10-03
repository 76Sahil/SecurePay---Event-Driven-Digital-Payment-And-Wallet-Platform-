package com.securepay.payment.dto;

import com.securepay.payment.MerchantRefund;

import java.math.BigDecimal;

public record MerchantRefundResponse(
        String id,
        String reference,
        String paymentReference,
        String customerName,
        BigDecimal amount,
        String currency,
        String reason,
        String status,
        String createdAt
) {
    public static MerchantRefundResponse from(MerchantRefund r) {
        return new MerchantRefundResponse(
                String.valueOf(r.getId()),
                r.getReference(),
                r.getPaymentReference(),
                r.getCustomerName(),
                r.getAmount(),
                r.getCurrency(),
                r.getReason(),
                r.getStatus(),
                r.getCreatedAt().toString()
        );
    }
}

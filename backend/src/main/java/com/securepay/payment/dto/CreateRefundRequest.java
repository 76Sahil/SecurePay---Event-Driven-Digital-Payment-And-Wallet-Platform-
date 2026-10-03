package com.securepay.payment.dto;

import java.math.BigDecimal;

public record CreateRefundRequest(
        String paymentReference,
        BigDecimal amount,
        String reason
) {}

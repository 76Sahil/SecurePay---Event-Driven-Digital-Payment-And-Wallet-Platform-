
package com.securepay.transaction.dto;

import com.securepay.transaction.TransactionStatus;
import com.securepay.transaction.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
        Long id,
        TransactionType type,
        TransactionStatus status,
        BigDecimal amount,
        Instant createdAt
) {}
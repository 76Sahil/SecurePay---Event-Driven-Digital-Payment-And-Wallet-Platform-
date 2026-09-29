
package com.securepay.wallet.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record WalletResponse(
        Long walletId,
        Long userId,
        BigDecimal balance,
        Instant createdAt
) {}
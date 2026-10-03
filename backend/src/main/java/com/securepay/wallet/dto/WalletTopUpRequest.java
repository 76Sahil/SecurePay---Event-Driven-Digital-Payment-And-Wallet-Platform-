package com.securepay.wallet.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WalletTopUpRequest {

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "1.00", message = "Minimum top-up amount is INR 1.00.")
    @DecimalMax(value = "100000.00", message = "Maximum top-up amount is INR 100,000.00.")
    @Digits(integer = 6, fraction = 2, message = "Amount can have up to 2 decimal places.")
    private BigDecimal amount;

    public WalletTopUpRequest() {}

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}

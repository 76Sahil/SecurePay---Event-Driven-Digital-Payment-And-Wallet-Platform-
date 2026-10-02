
package com.securepay.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WalletTopUpRequest {

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "1.00", message = "Minimum top-up amount is INR 1.")
    @DecimalMax(value = "100000.00", message = "Maximum demo top-up amount is INR 100000.")
    private BigDecimal amount;

    public WalletTopUpRequest() {}

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
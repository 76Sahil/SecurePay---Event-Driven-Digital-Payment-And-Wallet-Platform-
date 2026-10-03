package com.securepay.transaction.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class WalletTransferRequest {

    @NotBlank(message = "Recipient email is required.")
    @Email(message = "Enter a valid recipient email address.")
    private String recipientEmail;

    @NotNull(message = "Transfer amount is required.")
    @DecimalMin(value = "1.00", message = "Minimum transfer amount is INR 1.00.")
    @DecimalMax(value = "100000.00", message = "Maximum transfer amount is INR 100,000.00.")
    @Digits(integer = 6, fraction = 2, message = "Amount can have up to 2 decimal places.")
    private BigDecimal amount;

    public WalletTransferRequest() {}

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}

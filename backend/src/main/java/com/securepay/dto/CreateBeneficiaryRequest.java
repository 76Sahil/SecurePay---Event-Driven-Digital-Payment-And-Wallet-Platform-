package com.securepay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreateBeneficiaryRequest {

    @NotBlank(message = "Beneficiary name is required.")
    private String name;

    @NotBlank(message = "Bank name is required.")
    private String bankName;

    @NotBlank(message = "Account number is required.")
    @Pattern(regexp = "\\d{9,18}", message = "Account number must contain 9 to 18 digits.")
    private String accountNumber;

    @NotBlank(message = "Registered SecurePay email is required.")
    @Email(message = "Enter a valid registered SecurePay email.")
    private String recipientEmail;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
}

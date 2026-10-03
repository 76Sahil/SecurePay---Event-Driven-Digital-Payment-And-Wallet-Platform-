package com.securepay.beneficiary.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateBeneficiaryRequest {

    @NotBlank(message = "Beneficiary name is required.")
    @Size(max = 100, message = "Name cannot exceed 100 characters.")
    private String name;

    @NotBlank(message = "Bank name is required.")
    @Size(max = 100, message = "Bank name cannot exceed 100 characters.")
    private String bankName;

    @NotBlank(message = "Account number is required.")
    @Pattern(regexp = "^[0-9]{9,18}$", message = "Enter a valid account number between 9 and 18 digits.")
    private String accountNumber;

    @NotBlank(message = "Recipient email is required.")
    @Email(message = "Enter a valid email address.")
    private String recipientEmail;

    public CreateBeneficiaryRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
}

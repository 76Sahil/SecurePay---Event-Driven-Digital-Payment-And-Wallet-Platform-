package com.securepay.merchant.dto;

import com.securepay.merchant.Merchant;

public record MerchantProfileResponse(
        String id,
        String businessName,
        String legalName,
        String email,
        String phone,
        String merchantType,
        String memberSince,
        String accountStatus,
        String verificationStatus,
        String settlementCurrency,
        String webhookUrl
) {
    public static MerchantProfileResponse from(Merchant merchant) {
        return new MerchantProfileResponse(
                merchant.getMerchantId(),
                merchant.getBusinessName(),
                merchant.getLegalName(),
                merchant.getEmail(),
                merchant.getPhone(),
                merchant.getMerchantType(),
                merchant.getCreatedAt().getMonth().name() + " " + merchant.getCreatedAt().getYear(),
                merchant.getAccountStatus(),
                merchant.getVerificationStatus(),
                merchant.getSettlementCurrency(),
                merchant.getWebhookUrl()
        );
    }
}

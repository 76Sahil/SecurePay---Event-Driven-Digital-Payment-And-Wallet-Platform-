package com.securepay.merchant.dto;

import com.securepay.merchant.MerchantApiKey;

import java.util.Arrays;
import java.util.List;

public record ApiKeyResponse(
        String id,
        String name,
        String prefix,
        String environment,
        List<String> scopes,
        String status,
        String createdAt,
        String lastUsedAt,
        String secretKey // only populated on creation
) {
    public static ApiKeyResponse from(MerchantApiKey apiKey, String plainSecret) {
        List<String> scopesList = apiKey.getScopes() != null
                ? Arrays.asList(apiKey.getScopes().split(","))
                : List.of("payments:read", "payments:create");

        return new ApiKeyResponse(
                apiKey.getKeyId(),
                apiKey.getName(),
                apiKey.getPrefix(),
                apiKey.getEnvironment(),
                scopesList,
                apiKey.getStatus(),
                apiKey.getCreatedAt().toString(),
                apiKey.getLastUsedAt() != null ? apiKey.getLastUsedAt().toString() : null,
                plainSecret
        );
    }
}

package com.securepay.merchant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateApiKeyRequest(
        @NotBlank(message = "API key name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        String environment,

        List<String> scopes
) {}

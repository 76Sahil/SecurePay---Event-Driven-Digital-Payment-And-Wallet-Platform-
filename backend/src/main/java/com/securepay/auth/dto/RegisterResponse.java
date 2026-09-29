package com.securepay.auth.dto;

import com.securepay.user.UserRole;

import java.time.Instant;

public record RegisterResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        Instant createdAt
) {
}
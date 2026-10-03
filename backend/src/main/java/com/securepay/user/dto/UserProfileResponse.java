package com.securepay.user.dto;

import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String accountType,
        String memberSince,
        String accountStatus,
        String kycStatus,
        int failedLoginAttempts,
        String lastLoginAt,
        String updatedAt
) {
    public static UserProfileResponse from(com.securepay.user.User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAccountType(),
                user.getCreatedAt().toString(),
                user.getStatus(),
                user.getKycStatus(),
                user.getFailedLoginAttempts(),
                user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null,
                user.getUpdatedAt().toString()
        );
    }
}

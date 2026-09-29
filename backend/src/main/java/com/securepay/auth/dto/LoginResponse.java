
package com.securepay.auth.dto;

import com.securepay.user.UserRole;

public record LoginResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        String accessToken,
        String tokenType,
        long expiresIn
) {}
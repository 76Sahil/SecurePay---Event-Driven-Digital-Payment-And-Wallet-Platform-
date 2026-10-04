package com.securepay.auth;

import com.securepay.audit.SecurityAuditService;
import com.securepay.audit.SecurityAuditSeverity;
import com.securepay.email.EmailService;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int EXPIRATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final KeycloakRegistrationService keycloakRegistrationService;
    private final SecurityAuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            EmailService emailService,
            KeycloakRegistrationService keycloakRegistrationService,
            SecurityAuditService auditService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.keycloakRegistrationService = keycloakRegistrationService;
        this.auditService = auditService;
    }

    @Transactional
    public Map<String, Object> requestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Invalidate any existing unused tokens for this user
            tokenRepository.invalidateTokensForUser(user);

            // Generate high-entropy 256-bit random token
            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);
            String rawToken = HexFormat.of().formatHex(randomBytes);

            String tokenHash = hashToken(rawToken);

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setTokenHash(tokenHash);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));
            resetToken.setUsed(false);
            tokenRepository.save(resetToken);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), rawToken);
            } catch (Exception ex) {
                log.error("Failed to send password reset email to {}: {}", user.getEmail(), ex.getMessage());
                throw new IllegalStateException("Failed to deliver password reset email. Please try again later.");
            }

            auditService.recordEvent(
                    "PASSWORD_RESET_REQUESTED",
                    user,
                    SecurityAuditSeverity.INFO,
                    null,
                    null,
                    "Password reset requested for " + user.getEmail()
            );
        } else {
            log.info("Password reset requested for non-existent email: {}", normalizedEmail);
        }

        // Return safe message avoiding account enumeration
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "If an account exists with that email, a password reset link has been sent.");
        return response;
    }

    @Transactional
    public Map<String, Object> resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Reset token is required.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long.");
        }

        String tokenHash = hashToken(rawToken.trim());
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This password reset link has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This password reset link has expired.");
        }

        // Single-use token invalidation
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        User user = resetToken.getUser();

        // Update credentials in Keycloak identity provider
        keycloakRegistrationService.resetUserPassword(user.getKeycloakUserId(), newPassword);

        auditService.recordEvent(
                "PASSWORD_RESET_COMPLETED",
                user,
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Password reset completed for " + user.getEmail()
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Password reset successfully. You may now log in with your new password.");
        return response;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}

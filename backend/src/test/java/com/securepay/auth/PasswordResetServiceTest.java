package com.securepay.auth;

import com.securepay.audit.SecurityAuditService;
import com.securepay.email.EmailService;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private KeycloakRegistrationService keycloakRegistrationService;

    @Mock
    private SecurityAuditService auditService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("user@example.com");
        sampleUser.setFullName("Test User");
        sampleUser.setKeycloakUserId("kc-uuid-10");
        sampleUser.setAccountType("CUSTOMER");
    }

    @Test
    @DisplayName("requestPasswordReset should send email and return success message when user exists")
    void shouldSendPasswordResetEmailWhenUserExists() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(sampleUser));

        Map<String, Object> result = passwordResetService.requestPasswordReset("user@example.com");

        assertThat(result.get("status")).isEqualTo("SUCCESS");
        assertThat(result.get("message")).isEqualTo("If an account exists with that email, a password reset link has been sent.");

        verify(tokenRepository).invalidateTokensForUser(sampleUser);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq("user@example.com"), eq("Test User"), anyString());
    }

    @Test
    @DisplayName("requestPasswordReset should not fail or send email when user does not exist")
    void shouldReturnSafeSuccessMessageWhenUserDoesNotExist() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        Map<String, Object> result = passwordResetService.requestPasswordReset("ghost@example.com");

        assertThat(result.get("status")).isEqualTo("SUCCESS");
        verify(emailService, never()).sendPasswordResetEmail(any(), any(), any());
        verify(tokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword should update Keycloak credentials and invalidate token")
    void shouldResetPasswordSuccessfullyWithValidToken() {
        String rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(sampleUser);
        token.setTokenHash("dummy");
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        Map<String, Object> result = passwordResetService.resetPassword(rawToken, "NewSecurePassword123!");

        assertThat(result.get("status")).isEqualTo("SUCCESS");
        assertThat(token.isUsed()).isTrue();
        verify(tokenRepository).save(token);
        verify(keycloakRegistrationService).resetUserPassword("kc-uuid-10", "NewSecurePassword123!");
    }

    @Test
    @DisplayName("resetPassword should reject expired token")
    void shouldRejectExpiredResetToken() {
        String rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(sampleUser);
        token.setTokenHash("dummy");
        token.setExpiresAt(LocalDateTime.now().minusMinutes(5));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.resetPassword(rawToken, "NewSecurePassword123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("resetPassword should reject already used token")
    void shouldRejectAlreadyUsedResetToken() {
        String rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(sampleUser);
        token.setTokenHash("dummy");
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setUsed(true);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.resetPassword(rawToken, "NewSecurePassword123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already been used");
    }
}

package com.securepay.user;

import com.securepay.user.dto.UpdateProfileRequest;
import com.securepay.user.dto.UserProfileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setFullName("John Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setAccountType("CUSTOMER");
        testUser.setKeycloakUserId("kc-user-123");
        testUser.setStatus("ACTIVE");
        testUser.setKycStatus("KYC_PENDING");
    }

    @Test
    void shouldReturnUserProfile() {
        when(userRepository.findByKeycloakUserId("kc-user-123")).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.getProfileByKeycloakUserId("kc-user-123");

        assertThat(response).isNotNull();
        assertThat(response.fullName()).isEqualTo("John Doe");
        assertThat(response.email()).isEqualTo("john.doe@example.com");
        assertThat(response.accountStatus()).isEqualTo("ACTIVE");
        assertThat(response.kycStatus()).isEqualTo("KYC_PENDING");
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByKeycloakUserId("unknown-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfileByKeycloakUserId("unknown-id"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void shouldUpdateUserProfile() {
        when(userRepository.findByKeycloakUserId("kc-user-123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest("John Updated", "+919876543210");
        UserProfileResponse updated = userService.updateProfile("kc-user-123", request);

        assertThat(updated.fullName()).isEqualTo("John Updated");
        assertThat(updated.phone()).isEqualTo("+919876543210");
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldLockAccountAfterMaxFailedAttempts() {
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testUser));

        testUser.setFailedLoginAttempts(4);
        userService.recordFailedLogin("john.doe@example.com");

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(testUser.getStatus()).isEqualTo("LOCKED");
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldResetFailedAttemptsOnSuccessfulLogin() {
        when(userRepository.findByKeycloakUserId("kc-user-123")).thenReturn(Optional.of(testUser));

        testUser.setFailedLoginAttempts(3);
        userService.recordSuccessfulLogin("kc-user-123");

        assertThat(testUser.getFailedLoginAttempts()).isEqualTo(0);
        assertThat(testUser.getLastLoginAt()).isNotNull();
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldReturnExistingUserInGetOrCreateUser() {
        when(userRepository.findByKeycloakUserId("kc-user-123")).thenReturn(Optional.of(testUser));

        User result = userService.getOrCreateUser("kc-user-123", "john.doe@example.com", "John Doe", "CUSTOMER");

        assertThat(result).isSameAs(testUser);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldLinkExistingUserByEmailInGetOrCreateUser() {
        when(userRepository.findByKeycloakUserId("kc-user-new")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.getOrCreateUser("kc-user-new", "john.doe@example.com", "John Doe", "CUSTOMER");

        assertThat(result.getKeycloakUserId()).isEqualTo("kc-user-new");
        verify(userRepository).save(testUser);
    }

    @Test
    void shouldProvisionNewUserInGetOrCreateUser() {
        when(userRepository.findByKeycloakUserId("kc-user-new")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("new.user@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.getOrCreateUser("kc-user-new", "new.user@example.com", "New User", "CUSTOMER");

        assertThat(result.getKeycloakUserId()).isEqualTo("kc-user-new");
        assertThat(result.getEmail()).isEqualTo("new.user@example.com");
        assertThat(result.getFullName()).isEqualTo("New User");
        assertThat(result.getAccountType()).isEqualTo("CUSTOMER");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        verify(userRepository).save(any(User.class));
    }
}

package com.securepay.user;

import com.securepay.user.dto.UpdateProfileRequest;
import com.securepay.user.dto.UserProfileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private Jwt jwt;

    @BeforeEach
    void setUp() {
        jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", "kc-user-sub", "email", "test@securepay.local")
        );
    }

    @Test
    void shouldReturnUserProfileWhenAuthenticated() {
        UserProfileResponse mockResponse = new UserProfileResponse(
                1L, "Test User", "test@securepay.local", "+919876543210",
                "CUSTOMER", "2026-10-01T10:00:00", "ACTIVE", "KYC_VERIFIED",
                0, null, "2026-10-01T10:00:00"
        );

        when(userService.getProfileByKeycloakUserId("kc-user-sub")).thenReturn(mockResponse);

        ResponseEntity<UserProfileResponse> response = userController.getCurrentUserProfile(jwt);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().fullName()).isEqualTo("Test User");
        assertThat(response.getBody().email()).isEqualTo("test@securepay.local");
        assertThat(response.getBody().kycStatus()).isEqualTo("KYC_VERIFIED");
    }

    @Test
    void shouldUpdateUserProfileSuccessfully() {
        UpdateProfileRequest request = new UpdateProfileRequest("Updated Name", "+919999888877");
        UserProfileResponse updatedResponse = new UserProfileResponse(
                1L, "Updated Name", "test@securepay.local", "+919999888877",
                "CUSTOMER", "2026-10-01T10:00:00", "ACTIVE", "KYC_VERIFIED",
                0, null, "2026-10-03T17:00:00"
        );

        when(userService.updateProfile(eq("kc-user-sub"), eq(request))).thenReturn(updatedResponse);

        ResponseEntity<UserProfileResponse> response = userController.updateCurrentUserProfile(jwt, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().fullName()).isEqualTo("Updated Name");
        assertThat(response.getBody().phone()).isEqualTo("+919999888877");
    }
}

package com.securepay.user;

import com.securepay.user.dto.UpdateProfileRequest;
import com.securepay.user.dto.UserProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByKeycloakUserId(String keycloakUserId) {
        User user = getUserByKeycloakUserId(keycloakUserId);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String keycloakUserId, UpdateProfileRequest request) {
        User user = getUserByKeycloakUserId(keycloakUserId);

        user.setFullName(request.fullName().trim());
        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
            user.setPhoneNumber(request.phoneNumber().trim());
        }
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return UserProfileResponse.from(updatedUser);
    }

    @Transactional(readOnly = true)
    public User getUserByKeycloakUserId(String keycloakUserId) {
        return userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found for Keycloak identity: " + keycloakUserId
                ));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found with id: " + id
                ));
    }

    @Transactional
    public void recordSuccessfulLogin(String keycloakUserId) {
        userRepository.findByKeycloakUserId(keycloakUserId).ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Transactional
    public void recordFailedLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            int newCount = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newCount);
            if (newCount >= MAX_FAILED_ATTEMPTS) {
                user.setStatus("LOCKED");
            }
            userRepository.save(user);
        });
    }

    @Transactional
    public void updateKycStatus(String keycloakUserId, String kycStatus) {
        User user = getUserByKeycloakUserId(keycloakUserId);
        user.setKycStatus(kycStatus);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}

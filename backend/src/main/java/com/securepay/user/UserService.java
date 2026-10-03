package com.securepay.user;

import com.securepay.user.dto.UpdateProfileRequest;
import com.securepay.user.dto.UserProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User getOrCreateUser(String keycloakUserId, String email, String fullName, String accountType) {
        if (keycloakUserId == null || keycloakUserId.isBlank()) {
            throw new IllegalArgumentException("Keycloak user ID must not be blank.");
        }

        java.util.Optional<User> byKeycloak = userRepository.findByKeycloakUserId(keycloakUserId);
        if (byKeycloak.isPresent()) {
            return byKeycloak.get();
        }

        String safeEmail = (email != null && !email.isBlank())
                ? email.trim().toLowerCase(java.util.Locale.ROOT)
                : (keycloakUserId.contains("@") ? keycloakUserId.trim().toLowerCase(java.util.Locale.ROOT) : null);

        if (safeEmail != null) {
            java.util.Optional<User> byEmail = userRepository.findByEmail(safeEmail);
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                existing.setKeycloakUserId(keycloakUserId);
                existing.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existing);
            }
        }

        User newUser = new User();
        newUser.setKeycloakUserId(keycloakUserId);
        newUser.setEmail(safeEmail != null ? safeEmail : keycloakUserId + "@securepay.local");
        String name = (fullName != null && !fullName.isBlank())
                ? fullName.trim()
                : (safeEmail != null ? safeEmail.split("@")[0] : "Customer");
        newUser.setFullName(name);
        newUser.setAccountType(accountType != null && !accountType.isBlank()
                ? accountType.toUpperCase(java.util.Locale.ROOT)
                : "CUSTOMER");
        newUser.setStatus("ACTIVE");
        newUser.setKycStatus("VERIFIED");
        newUser.setUpdatedAt(LocalDateTime.now());
        try {
            return userRepository.save(newUser);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return userRepository.findByKeycloakUserId(keycloakUserId)
                    .or(() -> safeEmail != null ? userRepository.findByEmail(safeEmail) : java.util.Optional.empty())
                    .orElseThrow(() -> e);
        }
    }

    @Transactional
    public UserProfileResponse getProfile(String keycloakUserId, String email, String fullName) {
        User user = getOrCreateUser(keycloakUserId, email, fullName, "CUSTOMER");
        return UserProfileResponse.from(user);
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

    @Transactional
    public void lockUser(Long userId) {
        User user = getUserById(userId);
        user.setStatus("LOCKED");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void unlockUser(Long userId) {
        User user = getUserById(userId);
        user.setStatus("ACTIVE");
        user.setFailedLoginAttempts(0);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}

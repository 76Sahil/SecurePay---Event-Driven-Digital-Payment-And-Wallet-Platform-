
package com.securepay.service;

import com.securepay.dto.RegisterRequest;
import com.securepay.entity.User;
import com.securepay.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final KeycloakRegistrationService keycloakService;

    public RegistrationService(
            UserRepository userRepository,
            KeycloakRegistrationService keycloakService) {
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
    }

    public void register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        String accountType = request.getAccountType()
                .trim().toUpperCase(Locale.ROOT);

        if (!accountType.equals("CUSTOMER")
                && !accountType.equals("MERCHANT")) {
            throw new IllegalArgumentException(
                    "Invalid account type");
        }

        String keycloakUserId = keycloakService.createUser(
                request.getFullName(),
                email,
                request.getPassword()
        );

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setAccountType(accountType);
        user.setKeycloakUserId(keycloakUserId);

        userRepository.save(user);
    }
}
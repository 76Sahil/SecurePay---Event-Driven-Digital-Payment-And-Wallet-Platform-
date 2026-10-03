package com.securepay.auth;

import com.securepay.auth.dto.RegisterRequest;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegistrationService registrationService;
    private final UserRepository userRepository;

    public AuthController(
            RegistrationService registrationService,
            UserRepository userRepository) {
        this.registrationService = registrationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request) {

        registrationService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "message",
                        "Registration successful. Please verify your email."
                ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getCurrentUser(
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                Map.of(
                        "userId", jwt.getSubject(),
                        "email", jwt.getClaimAsString("email") == null
                                ? ""
                                : jwt.getClaimAsString("email"),
                        "issuer", jwt.getIssuer().toString()
                )
        );
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @AuthenticationPrincipal Jwt jwt) {

        String keycloakUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .or(() -> (email != null && !email.isBlank())
                        ? userRepository.findByEmail(email.trim().toLowerCase(java.util.Locale.ROOT))
                        : java.util.Optional.empty())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setKeycloakUserId(keycloakUserId);
                    newUser.setEmail(email != null ? email.trim().toLowerCase(java.util.Locale.ROOT) : keycloakUserId + "@securepay.local");
                    newUser.setFullName(name != null && !name.isBlank() ? name.trim() : newUser.getEmail().split("@")[0]);
                    newUser.setAccountType("CUSTOMER");
                    newUser.setStatus("ACTIVE");
                    newUser.setKycStatus("VERIFIED");
                    newUser.setUpdatedAt(java.time.LocalDateTime.now());
                    return userRepository.save(newUser);
                });

        if (!keycloakUserId.equals(user.getKeycloakUserId())) {
            user.setKeycloakUserId(keycloakUserId);
            user.setUpdatedAt(java.time.LocalDateTime.now());
            user = userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId().toString(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "accountType", user.getAccountType(),
                "memberSince", user.getCreatedAt().toString(),
                "accountStatus", user.getStatus()
        ));
    }
}


package com.securepay.controller;

import com.securepay.dto.RegisterRequest;
import com.securepay.entity.User;
import com.securepay.repository.UserRepository;
import com.securepay.service.RegistrationService;
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

        return userRepository
                .findByKeycloakUserId(jwt.getSubject())
                .<ResponseEntity<?>>map(user ->
                        ResponseEntity.ok(Map.of(
                                "id", user.getId().toString(),
                                "fullName", user.getFullName(),
                                "email", user.getEmail(),
                                "accountType", user.getAccountType(),
                                "memberSince", user.getCreatedAt().toString(),
                                "accountStatus", "ACTIVE"
                        ))
                )
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of(
                                        "message",
                                        "User profile not found in SecurePay database."
                                ))
                );
    }
}
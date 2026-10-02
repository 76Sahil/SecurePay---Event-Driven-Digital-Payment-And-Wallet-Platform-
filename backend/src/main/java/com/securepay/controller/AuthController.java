
package com.securepay.controller;

import com.securepay.dto.RegisterRequest;
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

    public AuthController(RegistrationService registrationService) {
        this.registrationService = registrationService;
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
}
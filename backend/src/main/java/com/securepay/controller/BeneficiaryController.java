package com.securepay.controller;

import com.securepay.dto.CreateBeneficiaryRequest;
import com.securepay.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    public ResponseEntity<?> getMyBeneficiaries(@AuthenticationPrincipal Jwt jwt) {
        try {
            List<Map<String, Object>> beneficiaries =
                    beneficiaryService.getMyBeneficiaries(jwt.getSubject());
            return ResponseEntity.ok(beneficiaries);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/{beneficiaryId}")
    public ResponseEntity<?> getMyBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long beneficiaryId) {
        try {
            return ResponseEntity.ok(
                    beneficiaryService.getMyBeneficiary(jwt.getSubject(), beneficiaryId));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateBeneficiaryRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(beneficiaryService.addBeneficiary(jwt.getSubject(), request));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}

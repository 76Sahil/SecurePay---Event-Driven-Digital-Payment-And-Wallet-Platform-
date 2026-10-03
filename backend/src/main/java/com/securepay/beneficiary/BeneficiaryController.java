package com.securepay.beneficiary;

import com.securepay.beneficiary.dto.CreateBeneficiaryRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/beneficiaries")
@PreAuthorize("hasRole('CUSTOMER')")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyBeneficiaries(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(beneficiaryService.getMyBeneficiaries(jwt.getSubject()));
    }

    @GetMapping("/{beneficiaryId}")
    public ResponseEntity<Map<String, Object>> getMyBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long beneficiaryId) {
        return ResponseEntity.ok(beneficiaryService.getMyBeneficiary(jwt.getSubject(), beneficiaryId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addBeneficiary(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateBeneficiaryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(beneficiaryService.addBeneficiary(jwt.getSubject(), request));
    }
}

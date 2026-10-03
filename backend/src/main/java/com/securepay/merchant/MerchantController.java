package com.securepay.merchant;

import com.securepay.merchant.dto.ApiKeyResponse;
import com.securepay.merchant.dto.CreateApiKeyRequest;
import com.securepay.merchant.dto.MerchantDashboardSummaryResponse;
import com.securepay.merchant.dto.MerchantProfileResponse;
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
@RequestMapping("/api/merchant")
@PreAuthorize("hasRole('MERCHANT')")
public class MerchantController {

    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @GetMapping("/profile")
    public ResponseEntity<MerchantProfileResponse> getProfile(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(merchantService.getMerchantProfile(jwt.getSubject()));
    }

    @GetMapping("/api-keys")
    public ResponseEntity<List<ApiKeyResponse>> listApiKeys(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(merchantService.listApiKeys(jwt.getSubject()));
    }

    @PostMapping("/api-keys")
    public ResponseEntity<ApiKeyResponse> createApiKey(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateApiKeyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(merchantService.createApiKey(jwt.getSubject(), request));
    }

    @DeleteMapping("/api-keys/{keyId}")
    public ResponseEntity<Map<String, String>> revokeApiKey(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String keyId) {
        merchantService.revokeApiKey(jwt.getSubject(), keyId);
        return ResponseEntity.ok(Map.of("message", "API key revoked successfully."));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<MerchantDashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(merchantService.getDashboardSummary(jwt.getSubject()));
    }
}

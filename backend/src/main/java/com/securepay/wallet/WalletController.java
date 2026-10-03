package com.securepay.wallet;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@PreAuthorize("hasRole('CUSTOMER')")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyWallet(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
                walletService.getOrCreateWallet(jwt.getSubject())
        );
    }
}

package com.securepay.transaction;

import com.securepay.transaction.dto.WalletTransferRequest;
import com.securepay.wallet.dto.WalletTopUpRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet/transactions")
@PreAuthorize("hasRole('CUSTOMER')")
public class WalletTransactionController {

    private final WalletTransactionService transactionService;

    public WalletTransactionController(WalletTransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyTransactions(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
                transactionService.getMyTransactions(jwt.getSubject())
        );
    }

    @PostMapping("/top-up")
    public ResponseEntity<Map<String, Object>> topUp(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody WalletTopUpRequest request) {
        return ResponseEntity.ok(
                transactionService.topUp(jwt.getSubject(), request.getAmount())
        );
    }

    @PostMapping("/transfer")
    public ResponseEntity<Map<String, Object>> transfer(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody WalletTransferRequest request) {
        return ResponseEntity.ok(
                transactionService.transfer(
                        jwt.getSubject(),
                        request.getRecipientEmail(),
                        request.getAmount()
                )
        );
    }
}

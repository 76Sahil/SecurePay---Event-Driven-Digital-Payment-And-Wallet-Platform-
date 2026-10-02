
package com.securepay.controller;

import com.securepay.dto.WalletTopUpRequest;
import com.securepay.service.WalletTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet/transactions")
public class WalletTransactionController {

    private final WalletTransactionService transactionService;

    public WalletTransactionController(
            WalletTransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<?> getMyTransactions(
            @AuthenticationPrincipal Jwt jwt) {
        try {
            List<Map<String, Object>> transactions =
                    transactionService.getMyTransactions(jwt.getSubject());
            return ResponseEntity.ok(transactions);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/top-up")
    public ResponseEntity<?> topUp(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody WalletTopUpRequest request) {
        try {
            return ResponseEntity.ok(
                    transactionService.topUp(
                            jwt.getSubject(), request.getAmount()));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}
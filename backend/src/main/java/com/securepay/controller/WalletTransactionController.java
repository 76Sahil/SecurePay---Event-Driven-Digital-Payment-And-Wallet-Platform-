
package com.securepay.controller;

import com.securepay.service.WalletTransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
                    transactionService.getMyTransactions(
                            jwt.getSubject());

            return ResponseEntity.ok(transactions);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}
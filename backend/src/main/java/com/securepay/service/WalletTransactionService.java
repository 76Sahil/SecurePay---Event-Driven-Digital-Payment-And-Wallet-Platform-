
package com.securepay.service;

import com.securepay.entity.User;
import com.securepay.entity.Wallet;
import com.securepay.entity.WalletTransaction;
import com.securepay.repository.UserRepository;
import com.securepay.repository.WalletRepository;
import com.securepay.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WalletTransactionService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public WalletTransactionService(
            UserRepository userRepository,
            WalletRepository walletRepository,
            WalletTransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyTransactions(
            String keycloakUserId) {

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Transactions are available only for customer accounts.");
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElse(null);

        if (wallet == null) {
            return List.of();
        }

        return transactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Map<String, Object> toResponse(
            WalletTransaction transaction) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", transaction.getId());
        response.put("type", transaction.getType());
        response.put("amount", transaction.getAmount());
        response.put("currency", transaction.getCurrency());
        response.put("status", transaction.getStatus());
        response.put("description", transaction.getDescription());
        response.put("createdAt", transaction.getCreatedAt().toString());

        return response;
    }
}
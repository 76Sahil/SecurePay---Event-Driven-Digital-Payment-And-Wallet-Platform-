
package com.securepay.service;

import com.securepay.entity.User;
import com.securepay.entity.Wallet;
import com.securepay.entity.WalletTransaction;
import com.securepay.repository.UserRepository;
import com.securepay.repository.WalletRepository;
import com.securepay.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
                .orElseThrow(() ->
                        new IllegalArgumentException("User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Transactions are available only for customer accounts.");
        }

        Wallet wallet = walletRepository.findByUser(user).orElse(null);

        if (wallet == null) {
            return List.of();
        }

        return transactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public Map<String, Object> topUp(
            String keycloakUserId,
            BigDecimal amount) {

        if (amount == null
                || amount.compareTo(BigDecimal.ONE) < 0
                || amount.compareTo(new BigDecimal("100000.00")) > 0
                || amount.scale() > 2) {
            throw new IllegalArgumentException(
                    "Enter a valid top-up amount between INR 1 and INR 100000, with up to 2 decimal places.");
        }

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Wallet top-up is available only for customer accounts.");
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalArgumentException("Wallet not found."));

        if (!"ACTIVE".equalsIgnoreCase(wallet.getStatus())) {
            throw new IllegalArgumentException("Wallet is not active.");
        }

        BigDecimal updatedBalance = wallet.getBalance().add(amount);
        wallet.setBalance(updatedBalance);
        walletRepository.save(wallet);

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setType("TOP_UP");
        transaction.setAmount(amount);
        transaction.setCurrency(wallet.getCurrency());
        transaction.setStatus("SUCCESS");
        transaction.setDescription("Demo wallet top-up");

        WalletTransaction saved =
                transactionRepository.save(transaction);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactionId", saved.getId());
        response.put("amount", saved.getAmount());
        response.put("currency", saved.getCurrency());
        response.put("status", saved.getStatus());
        response.put("balance", updatedBalance);
        response.put("message", "Demo top-up completed successfully.");

        return response;
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
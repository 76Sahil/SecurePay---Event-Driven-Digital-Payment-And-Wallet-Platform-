
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
import java.util.Locale;
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

        validateAmount(amount);

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Wallet top-up is available only for customer accounts.");
        }

        ensureWalletExists(user);
        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
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

        WalletTransaction saved = transactionRepository.save(transaction);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactionId", saved.getId());
        response.put("amount", saved.getAmount());
        response.put("currency", saved.getCurrency());
        response.put("status", saved.getStatus());
        response.put("balance", updatedBalance);
        response.put("message", "Demo top-up completed successfully.");

        return response;
    }

    @Transactional
    public Map<String, Object> transfer(
            String keycloakUserId,
            String recipientEmail,
            BigDecimal amount) {

        validateAmount(amount);

        if (recipientEmail == null || recipientEmail.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required.");
        }

        User sender = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(sender.getAccountType())) {
            throw new IllegalArgumentException(
                    "Transfers are available only for customer accounts.");
        }

        User recipient = userRepository.findByEmail(
                        recipientEmail.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new IllegalArgumentException("Recipient account not found."));

        if (!"CUSTOMER".equalsIgnoreCase(recipient.getAccountType())) {
            throw new IllegalArgumentException(
                    "Transfers are allowed only to customer accounts.");
        }

        if (sender.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException(
                    "You cannot transfer money to your own account.");
        }

        // Ensure both customers have a wallet, including a recipient who has not opened the wallet page yet.
        ensureWalletExists(sender);
        ensureWalletExists(recipient);

        // Always lock wallets in the same user-ID order to reduce deadlock risk.
        Long firstUserId = Math.min(sender.getId(), recipient.getId());
        Long secondUserId = Math.max(sender.getId(), recipient.getId());

        Wallet firstWallet = walletRepository.findByUserIdForUpdate(firstUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("A wallet was not found."));

        Wallet secondWallet = walletRepository.findByUserIdForUpdate(secondUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("A wallet was not found."));

        Wallet senderWallet = sender.getId().equals(firstUserId)
                ? firstWallet : secondWallet;

        Wallet recipientWallet = recipient.getId().equals(firstUserId)
                ? firstWallet : secondWallet;

        if (!"ACTIVE".equalsIgnoreCase(senderWallet.getStatus())
                || !"ACTIVE".equalsIgnoreCase(recipientWallet.getStatus())) {
            throw new IllegalArgumentException(
                    "Both wallets must be active to transfer money.");
        }

        if (!senderWallet.getCurrency().equals(recipientWallet.getCurrency())) {
            throw new IllegalArgumentException(
                    "Wallet currencies do not match.");
        }

        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance.");
        }

        BigDecimal senderBalance =
                senderWallet.getBalance().subtract(amount);
        BigDecimal recipientBalance =
                recipientWallet.getBalance().add(amount);

        senderWallet.setBalance(senderBalance);
        recipientWallet.setBalance(recipientBalance);

        walletRepository.save(senderWallet);
        walletRepository.save(recipientWallet);

        WalletTransaction outgoing = new WalletTransaction();
        outgoing.setWallet(senderWallet);
        outgoing.setType("TRANSFER");
        outgoing.setAmount(amount);
        outgoing.setCurrency(senderWallet.getCurrency());
        outgoing.setStatus("SUCCESS");
        outgoing.setDescription(
                "Transfer to " + recipient.getFullName()
                        + " (" + recipient.getEmail() + ")");

        WalletTransaction savedOutgoing =
                transactionRepository.save(outgoing);

        WalletTransaction incoming = new WalletTransaction();
        incoming.setWallet(recipientWallet);
        incoming.setType("TRANSFER_IN");
        incoming.setAmount(amount);
        incoming.setCurrency(recipientWallet.getCurrency());
        incoming.setStatus("SUCCESS");
        incoming.setDescription(
                "Transfer from " + sender.getFullName()
                        + " (" + sender.getEmail() + ")");

        WalletTransaction savedIncoming =
                transactionRepository.save(incoming);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactionId", savedOutgoing.getId());
        response.put("recipientTransactionId", savedIncoming.getId());
        response.put("recipientName", recipient.getFullName());
        response.put("recipientEmail", recipient.getEmail());
        response.put("amount", amount);
        response.put("currency", senderWallet.getCurrency());
        response.put("status", "SUCCESS");
        response.put("senderBalance", senderBalance);
        response.put("recipientBalance", recipientBalance);
        response.put("message", "Demo transfer completed successfully.");

        return response;
    }


    private void ensureWalletExists(User user) {
        if (walletRepository.findByUser(user).isPresent()) {
            return;
        }

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setCurrency("INR");
        wallet.setStatus("ACTIVE");
        walletRepository.saveAndFlush(wallet);
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null
                || amount.compareTo(BigDecimal.ONE) < 0
                || amount.compareTo(new BigDecimal("100000.00")) > 0
                || amount.scale() > 2) {
            throw new IllegalArgumentException(
                    "Enter an amount between INR 1 and INR 100000, with up to 2 decimal places.");
        }
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
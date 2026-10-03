package com.securepay.transaction;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.securepay.audit.SecurityAuditService;
import com.securepay.audit.SecurityAuditSeverity;
import com.securepay.idempotency.IdempotencyRecord;
import com.securepay.idempotency.IdempotencyService;
import com.securepay.ledger.LedgerEntryType;
import com.securepay.ledger.LedgerService;
import com.securepay.notification.NotificationService;
import com.securepay.outbox.OutboxService;
import com.securepay.risk.RiskAssessment;
import com.securepay.risk.RiskDecision;
import com.securepay.risk.RiskEngineService;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.wallet.Wallet;
import com.securepay.wallet.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class WalletTransactionService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final LedgerService ledgerService;
    private final IdempotencyService idempotencyService;
    private final RiskEngineService riskEngineService;
    private final SecurityAuditService securityAuditService;
    private final OutboxService outboxService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public WalletTransactionService(
            WalletRepository walletRepository,
            WalletTransactionRepository transactionRepository,
            UserRepository userRepository,
            LedgerService ledgerService,
            IdempotencyService idempotencyService,
            RiskEngineService riskEngineService,
            SecurityAuditService securityAuditService,
            OutboxService outboxService,
            NotificationService notificationService,
            ObjectMapper objectMapper) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.ledgerService = ledgerService;
        this.idempotencyService = idempotencyService;
        this.riskEngineService = riskEngineService;
        this.securityAuditService = securityAuditService;
        this.outboxService = outboxService;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyTransactions(String keycloakUserId) {

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Transactions are available only for customer accounts.");
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalArgumentException("Wallet not found."));

        return transactionRepository.findByWalletOrderByCreatedAtDesc(wallet)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public Map<String, Object> topUp(
            String keycloakUserId,
            BigDecimal amount) {
        return topUp(keycloakUserId, amount, null);
    }

    @Transactional
    public Map<String, Object> topUp(
            String keycloakUserId,
            BigDecimal amount,
            String idempotencyKey) {

        validateAmount(amount);

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User profile not found."));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Wallet top-up is available only for customer accounts.");
        }

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String payload = "TOPUP:" + amount.toPlainString();
            Optional<IdempotencyRecord> cached = idempotencyService.checkOrAcquire(user.getId(), idempotencyKey, payload);
            if (cached.isPresent() && cached.get().getResponseBody() != null) {
                try {
                    return objectMapper.readValue(cached.get().getResponseBody(), new TypeReference<Map<String, Object>>() {});
                } catch (Exception ignored) {
                }
            }
        }

        try {
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

            ledgerService.recordEntry(
                    saved,
                    wallet,
                    LedgerEntryType.CREDIT,
                    amount,
                    updatedBalance,
                    "Top-up credit"
            );

            outboxService.saveEvent(
                    "WALLET_TOPUP",
                    String.valueOf(saved.getId()),
                    "TOPUP_COMPLETED",
                    "{\"transactionId\":" + saved.getId() + ",\"amount\":" + amount + ",\"userId\":" + user.getId() + "}"
            );

            notificationService.createNotification(
                    user,
                    "PAYMENT",
                    "Wallet Top-Up Successful",
                    "Your wallet was credited with INR " + amount + ". New balance: INR " + updatedBalance,
                    String.valueOf(saved.getId()),
                    null
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("transactionId", saved.getId());
            response.put("amount", saved.getAmount());
            response.put("currency", saved.getCurrency());
            response.put("status", saved.getStatus());
            response.put("balance", updatedBalance);
            response.put("message", "Demo top-up completed successfully.");

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                try {
                    String json = objectMapper.writeValueAsString(response);
                    idempotencyService.complete(user.getId(), idempotencyKey, 200, json);
                } catch (Exception ignored) {}
            }

            return response;
        } catch (RuntimeException e) {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.markFailed(user.getId(), idempotencyKey, e.getMessage());
            }
            throw e;
        }
    }

    @Transactional
    public Map<String, Object> transfer(
            String keycloakUserId,
            String recipientEmail,
            BigDecimal amount) {
        return transfer(keycloakUserId, recipientEmail, amount, null);
    }

    @Transactional
    public Map<String, Object> transfer(
            String keycloakUserId,
            String recipientEmail,
            BigDecimal amount,
            String idempotencyKey) {

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

        RiskAssessment riskAssessment = riskEngineService.assessTransaction(sender, amount);
        if (riskAssessment.getDecision() == RiskDecision.BLOCKED) {
            securityAuditService.recordEvent(
                    "TRANSFER_BLOCKED",
                    sender,
                    SecurityAuditSeverity.CRITICAL,
                    null,
                    null,
                    "Transfer of INR " + amount + " blocked: " + riskAssessment.getReasons()
            );
            notificationService.createNotification(
                    sender,
                    "SECURITY",
                    "Transfer Blocked by Risk Engine",
                    "Your transfer attempt of INR " + amount + " was blocked: " + riskAssessment.getReasons(),
                    null,
                    null
            );
            throw new IllegalStateException("Transfer blocked by security risk engine: " + riskAssessment.getReasons());
        }

        if (riskAssessment.getDecision() == RiskDecision.FLAGGED) {
            securityAuditService.recordEvent(
                    "TRANSFER_FLAGGED",
                    sender,
                    SecurityAuditSeverity.WARN,
                    null,
                    null,
                    "Transfer of INR " + amount + " flagged: " + riskAssessment.getReasons()
            );
        }

        String normalizedRecipientEmail = recipientEmail.trim().toLowerCase(Locale.ROOT);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String payload = "TRANSFER:" + normalizedRecipientEmail + ":" + amount.toPlainString();
            Optional<IdempotencyRecord> cached = idempotencyService.checkOrAcquire(sender.getId(), idempotencyKey, payload);
            if (cached.isPresent() && cached.get().getResponseBody() != null) {
                try {
                    return objectMapper.readValue(cached.get().getResponseBody(), new TypeReference<Map<String, Object>>() {});
                } catch (Exception ignored) {
                }
            }
        }

        try {
            User recipient = userRepository.findByEmail(normalizedRecipientEmail)
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

            ensureWalletExists(sender);
            ensureWalletExists(recipient);

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

            BigDecimal senderBalance = senderWallet.getBalance().subtract(amount);
            BigDecimal recipientBalance = recipientWallet.getBalance().add(amount);

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

            WalletTransaction savedOutgoing = transactionRepository.save(outgoing);

            WalletTransaction incoming = new WalletTransaction();
            incoming.setWallet(recipientWallet);
            incoming.setType("TRANSFER_IN");
            incoming.setAmount(amount);
            incoming.setCurrency(recipientWallet.getCurrency());
            incoming.setStatus("SUCCESS");
            incoming.setDescription(
                    "Transfer from " + sender.getFullName()
                            + " (" + sender.getEmail() + ")");

            WalletTransaction savedIncoming = transactionRepository.save(incoming);

            ledgerService.recordEntry(
                    savedOutgoing,
                    senderWallet,
                    LedgerEntryType.DEBIT,
                    amount,
                    senderBalance,
                    "Debit for transfer to " + recipient.getEmail()
            );

            ledgerService.recordEntry(
                    savedIncoming,
                    recipientWallet,
                    LedgerEntryType.CREDIT,
                    amount,
                    recipientBalance,
                    "Credit for transfer from " + sender.getEmail()
            );

            securityAuditService.recordEvent(
                    "TRANSFER_COMPLETED",
                    sender,
                    SecurityAuditSeverity.INFO,
                    null,
                    null,
                    "Transfer of INR " + amount + " to " + recipient.getEmail() + " completed successfully."
            );

            outboxService.saveEvent(
                    "WALLET_TRANSFER",
                    String.valueOf(savedOutgoing.getId()),
                    "TRANSFER_COMPLETED",
                    "{\"outgoingId\":" + savedOutgoing.getId() + ",\"incomingId\":" + savedIncoming.getId() + ",\"amount\":" + amount + "}"
            );

            notificationService.createNotification(
                    sender,
                    "TRANSACTION",
                    "Transfer Completed",
                    "Your transfer of INR " + amount + " to " + recipient.getFullName() + " was completed successfully.",
                    String.valueOf(savedOutgoing.getId()),
                    null
            );

            notificationService.createNotification(
                    recipient,
                    "TRANSACTION",
                    "Money Received",
                    "You received INR " + amount + " from " + sender.getFullName() + ".",
                    String.valueOf(savedIncoming.getId()),
                    null
            );

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

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                try {
                    String json = objectMapper.writeValueAsString(response);
                    idempotencyService.complete(sender.getId(), idempotencyKey, 200, json);
                } catch (Exception ignored) {}
            }

            return response;
        } catch (RuntimeException e) {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.markFailed(sender.getId(), idempotencyKey, e.getMessage());
            }
            throw e;
        }
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

    private Map<String, Object> toResponse(WalletTransaction transaction) {
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

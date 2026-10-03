package com.securepay.saga;

import com.securepay.ledger.LedgerEntryType;
import com.securepay.ledger.LedgerService;
import com.securepay.notification.NotificationService;
import com.securepay.outbox.OutboxService;
import com.securepay.risk.RiskAssessment;
import com.securepay.risk.RiskDecision;
import com.securepay.risk.RiskEngineService;
import com.securepay.saga.dto.SagaExecutionResponse;
import com.securepay.transaction.WalletTransaction;
import com.securepay.transaction.WalletTransactionRepository;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.wallet.Wallet;
import com.securepay.wallet.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentSagaOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(PaymentSagaOrchestrator.class);

    private final SagaInstanceRepository sagaRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final LedgerService ledgerService;
    private final RiskEngineService riskEngineService;
    private final NotificationService notificationService;
    private final OutboxService outboxService;

    public PaymentSagaOrchestrator(
            SagaInstanceRepository sagaRepository,
            UserRepository userRepository,
            WalletRepository walletRepository,
            WalletTransactionRepository transactionRepository,
            LedgerService ledgerService,
            RiskEngineService riskEngineService,
            NotificationService notificationService,
            OutboxService outboxService) {
        this.sagaRepository = sagaRepository;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerService = ledgerService;
        this.riskEngineService = riskEngineService;
        this.notificationService = notificationService;
        this.outboxService = outboxService;
    }

    @Transactional
    public SagaExecutionResponse executePaymentSaga(
            String keycloakUserId,
            BigDecimal amount,
            String recipientEmail,
            boolean simulateDownstreamFailure) {

        List<String> executedSteps = new ArrayList<>();

        User sender = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + keycloakUserId));

        String sagaId = "saga_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        // Step 1: Initialize Saga Instance
        SagaInstance saga = new SagaInstance();
        saga.setSagaId(sagaId);
        saga.setUser(sender);
        saga.setCurrentStep("SAGA_INITIALIZED");
        saga.setStatus(SagaStatus.STARTED);
        saga.setPayload("{\"amount\":" + amount + ",\"recipient\":\"" + recipientEmail + "\"}");
        sagaRepository.save(saga);
        executedSteps.add("STEP_1: SAGA_INITIALIZED");

        // Step 2: Reserve Funds from Sender Wallet
        Wallet senderWallet = walletRepository.findByUserIdForUpdate(sender.getId())
                .orElseThrow(() -> new IllegalArgumentException("Sender wallet not found"));

        if (senderWallet.getBalance().compareTo(amount) < 0) {
            saga.setStatus(SagaStatus.FAILED);
            saga.setCurrentStep("FUNDS_RESERVATION_FAILED");
            sagaRepository.save(saga);
            executedSteps.add("STEP_2_FAILED: INSUFFICIENT_FUNDS");
            return new SagaExecutionResponse(
                    sagaId,
                    "FAILED",
                    executedSteps,
                    false,
                    null,
                    "Saga aborted: Insufficient sender wallet balance."
            );
        }

        BigDecimal senderBalanceAfterDebit = senderWallet.getBalance().subtract(amount);
        senderWallet.setBalance(senderBalanceAfterDebit);
        walletRepository.save(senderWallet);

        WalletTransaction reserveTx = new WalletTransaction();
        reserveTx.setWallet(senderWallet);
        reserveTx.setType("SAGA_RESERVATION");
        reserveTx.setAmount(amount);
        reserveTx.setCurrency(senderWallet.getCurrency());
        reserveTx.setStatus("SUCCESS");
        reserveTx.setDescription("Saga funds reservation for " + recipientEmail);
        reserveTx = transactionRepository.save(reserveTx);

        ledgerService.recordEntry(
                reserveTx,
                senderWallet,
                LedgerEntryType.DEBIT,
                amount,
                senderBalanceAfterDebit,
                "Saga funds reserved: " + sagaId
        );

        saga.setCurrentStep("FUNDS_RESERVED");
        saga.setStatus(SagaStatus.IN_PROGRESS);
        sagaRepository.save(saga);
        executedSteps.add("STEP_2: FUNDS_RESERVED");

        // Step 3: Risk Assessment & Downstream Check
        RiskAssessment riskAssessment = riskEngineService.assessTransaction(sender, amount);
        executedSteps.add("STEP_3: RISK_ASSESSMENT_COMPLETED (score=" + riskAssessment.getRiskScore() + ")");

        boolean failureTriggered = simulateDownstreamFailure || riskAssessment.getDecision() == RiskDecision.BLOCKED;

        if (failureTriggered) {
            String failureReason = simulateDownstreamFailure
                    ? "Simulated external downstream partner timeout"
                    : "Risk engine blocked transaction: " + riskAssessment.getReasons();

            log.warn("SAGA [{}] Step 3 failed: {}. Executing compensating transaction.", sagaId, failureReason);
            executedSteps.add("STEP_3_FAILED: " + failureReason);

            // Step 3-Compensating: Refund Reserved Funds
            BigDecimal senderBalanceAfterCompensation = senderWallet.getBalance().add(amount);
            senderWallet.setBalance(senderBalanceAfterCompensation);
            walletRepository.save(senderWallet);

            WalletTransaction compensateTx = new WalletTransaction();
            compensateTx.setWallet(senderWallet);
            compensateTx.setType("SAGA_COMPENSATION");
            compensateTx.setAmount(amount);
            compensateTx.setCurrency(senderWallet.getCurrency());
            compensateTx.setStatus("SUCCESS");
            compensateTx.setDescription("Compensating credit for saga " + sagaId);
            compensateTx = transactionRepository.save(compensateTx);

            ledgerService.recordEntry(
                    compensateTx,
                    senderWallet,
                    LedgerEntryType.CREDIT,
                    amount,
                    senderBalanceAfterCompensation,
                    "Saga compensation credit: " + sagaId
            );

            saga.setStatus(SagaStatus.COMPENSATED);
            saga.setCurrentStep("COMPENSATION_COMPLETED");
            sagaRepository.save(saga);
            executedSteps.add("STEP_COMPENSATION: FUNDS_RESTORED_TO_SENDER");

            outboxService.saveEvent(
                    "SAGA_INSTANCE",
                    sagaId,
                    "SAGA_COMPENSATED",
                    "{\"sagaId\":\"" + sagaId + "\",\"status\":\"COMPENSATED\",\"reason\":\"" + failureReason + "\"}"
            );

            notificationService.createNotification(
                    sender,
                    "SECURITY",
                    "Payment Cancelled & Refunded",
                    "Your transfer of INR " + amount + " could not be completed. Your funds were automatically restored via compensating transaction.",
                    String.valueOf(compensateTx.getId()),
                    null
            );

            return new SagaExecutionResponse(
                    sagaId,
                    "COMPENSATED",
                    executedSteps,
                    true,
                    failureReason,
                    "Downstream execution failed. Compensating transaction successfully refunded reserved funds."
            );
        }

        // Step 4: Credit Recipient and Complete Saga
        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new IllegalArgumentException("Recipient account not found: " + recipientEmail));

        Wallet recipientWallet = walletRepository.findByUserIdForUpdate(recipient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Recipient wallet not found"));

        BigDecimal recipientBalanceAfterCredit = recipientWallet.getBalance().add(amount);
        recipientWallet.setBalance(recipientBalanceAfterCredit);
        walletRepository.save(recipientWallet);

        WalletTransaction settleTx = new WalletTransaction();
        settleTx.setWallet(recipientWallet);
        settleTx.setType("SAGA_SETTLEMENT");
        settleTx.setAmount(amount);
        settleTx.setCurrency(recipientWallet.getCurrency());
        settleTx.setStatus("SUCCESS");
        settleTx.setDescription("Saga settlement from " + sender.getEmail());
        settleTx = transactionRepository.save(settleTx);

        ledgerService.recordEntry(
                settleTx,
                recipientWallet,
                LedgerEntryType.CREDIT,
                amount,
                recipientBalanceAfterCredit,
                "Saga settlement credit: " + sagaId
        );

        saga.setStatus(SagaStatus.COMPLETED);
        saga.setCurrentStep("SAGA_COMPLETED");
        sagaRepository.save(saga);
        executedSteps.add("STEP_4: SETTLEMENT_COMPLETED");

        outboxService.saveEvent(
                "SAGA_INSTANCE",
                sagaId,
                "SAGA_COMPLETED",
                "{\"sagaId\":\"" + sagaId + "\",\"status\":\"COMPLETED\",\"amount\":" + amount + "}"
        );

        notificationService.createNotification(
                sender,
                "TRANSACTION",
                "Transfer Completed Successfully",
                "Successfully transferred INR " + amount + " to " + recipientEmail + " via distributed saga orchestration.",
                String.valueOf(reserveTx.getId()),
                null
        );

        notificationService.createNotification(
                recipient,
                "TRANSACTION",
                "Funds Received",
                "Received INR " + amount + " from " + sender.getEmail() + " via SecurePay transfer.",
                String.valueOf(settleTx.getId()),
                null
        );

        return new SagaExecutionResponse(
                sagaId,
                "COMPLETED",
                executedSteps,
                false,
                null,
                "Distributed saga completed successfully with balanced ledger records."
        );
    }
}

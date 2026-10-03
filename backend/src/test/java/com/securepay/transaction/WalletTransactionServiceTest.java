package com.securepay.transaction;

import tools.jackson.databind.ObjectMapper;
import com.securepay.audit.SecurityAuditService;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletTransactionServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LedgerService ledgerService;

    @Mock
    private IdempotencyService idempotencyService;

    @Mock
    private RiskEngineService riskEngineService;

    @Mock
    private SecurityAuditService securityAuditService;

    @Mock
    private OutboxService outboxService;

    @Mock
    private NotificationService notificationService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private WalletTransactionService transactionService;

    private User sender;
    private User recipient;
    private Wallet senderWallet;
    private Wallet recipientWallet;

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(10L);
        sender.setEmail("sender@example.com");
        sender.setAccountType("CUSTOMER");
        sender.setKeycloakUserId("kc-sender-10");
        sender.setStatus("ACTIVE");

        recipient = new User();
        recipient.setId(20L);
        recipient.setEmail("recipient@example.com");
        recipient.setAccountType("CUSTOMER");
        recipient.setStatus("ACTIVE");

        senderWallet = new Wallet();
        senderWallet.setId(100L);
        senderWallet.setUser(sender);
        senderWallet.setBalance(new BigDecimal("1000.00"));
        senderWallet.setCurrency("INR");
        senderWallet.setStatus("ACTIVE");

        recipientWallet = new Wallet();
        recipientWallet.setId(200L);
        recipientWallet.setUser(recipient);
        recipientWallet.setBalance(new BigDecimal("500.00"));
        recipientWallet.setCurrency("INR");
        recipientWallet.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should successfully transfer money between wallets and emit outbox event")
    void shouldTransferMoneySuccessfully() {
        when(userRepository.findByKeycloakUserId("kc-sender-10")).thenReturn(Optional.of(sender));
        when(userRepository.findByEmail("recipient@example.com")).thenReturn(Optional.of(recipient));

        RiskAssessment allowedAssessment = new RiskAssessment();
        allowedAssessment.setDecision(RiskDecision.ALLOWED);
        allowedAssessment.setRiskScore(10);
        when(riskEngineService.assessTransaction(eq(sender), any(BigDecimal.class)))
                .thenReturn(allowedAssessment);

        when(walletRepository.findByUser(sender)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUser(recipient)).thenReturn(Optional.of(recipientWallet));

        when(walletRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUserIdForUpdate(20L)).thenReturn(Optional.of(recipientWallet));

        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(777L);
            return tx;
        });

        Map<String, Object> response = transactionService.transfer(
                "kc-sender-10",
                "recipient@example.com",
                new BigDecimal("200.00")
        );

        assertThat(response.get("status")).isEqualTo("SUCCESS");
        assertThat(senderWallet.getBalance()).isEqualByComparingTo(new BigDecimal("800.00"));
        assertThat(recipientWallet.getBalance()).isEqualByComparingTo(new BigDecimal("700.00"));

        verify(outboxService).saveEvent(
                eq("WALLET_TRANSFER"),
                anyString(),
                eq("TRANSFER_COMPLETED"),
                anyString()
        );

        verify(ledgerService, times(2)).recordEntry(
                any(WalletTransaction.class),
                any(Wallet.class),
                any(LedgerEntryType.class),
                eq(new BigDecimal("200.00")),
                any(BigDecimal.class),
                anyString()
        );
    }

    @Test
    @DisplayName("Should block transfer if risk engine returns BLOCKED decision")
    void shouldBlockTransferOnRiskEngineBlock() {
        when(userRepository.findByKeycloakUserId("kc-sender-10")).thenReturn(Optional.of(sender));

        RiskAssessment blockedAssessment = new RiskAssessment();
        blockedAssessment.setDecision(RiskDecision.BLOCKED);
        blockedAssessment.setRiskScore(90);
        blockedAssessment.setReasons("High velocity fraud pattern detected");

        when(riskEngineService.assessTransaction(eq(sender), any(BigDecimal.class)))
                .thenReturn(blockedAssessment);

        assertThatThrownBy(() -> transactionService.transfer("kc-sender-10", "recipient@example.com", new BigDecimal("500.00")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Transfer blocked by security risk engine");

        verify(outboxService, never()).saveEvent(any(), any(), any(), any());
        verify(walletRepository, never()).findByUserIdForUpdate(any());
    }

    @Test
    @DisplayName("Should successfully perform topUp and emit outbox event")
    void shouldTopUpSuccessfully() {
        when(userRepository.findByKeycloakUserId("kc-sender-10")).thenReturn(Optional.of(sender));
        when(walletRepository.findByUser(sender)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUserIdForUpdate(10L)).thenReturn(Optional.of(senderWallet));

        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(888L);
            return tx;
        });

        Map<String, Object> result = transactionService.topUp("kc-sender-10", new BigDecimal("300.00"));

        assertThat(result.get("status")).isEqualTo("SUCCESS");
        assertThat(senderWallet.getBalance()).isEqualByComparingTo(new BigDecimal("1300.00"));

        verify(outboxService).saveEvent(
                eq("WALLET_TOPUP"),
                eq("888"),
                eq("TOPUP_COMPLETED"),
                anyString()
        );
    }
}

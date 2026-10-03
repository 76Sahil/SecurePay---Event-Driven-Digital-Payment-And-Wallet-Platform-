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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentSagaOrchestratorTest {

    @Mock
    private SagaInstanceRepository sagaRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private LedgerService ledgerService;

    @Mock
    private RiskEngineService riskEngineService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private OutboxService outboxService;

    @InjectMocks
    private PaymentSagaOrchestrator orchestrator;

    private User sender;
    private User recipient;
    private Wallet senderWallet;
    private Wallet recipientWallet;

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(1L);
        sender.setEmail("sender@example.com");
        sender.setKeycloakUserId("kc-sender-1");

        recipient = new User();
        recipient.setId(2L);
        recipient.setEmail("recipient@example.com");

        senderWallet = new Wallet();
        senderWallet.setId(10L);
        senderWallet.setUser(sender);
        senderWallet.setBalance(new BigDecimal("1000.00"));
        senderWallet.setCurrency("INR");
        senderWallet.setStatus("ACTIVE");

        recipientWallet = new Wallet();
        recipientWallet.setId(20L);
        recipientWallet.setUser(recipient);
        recipientWallet.setBalance(new BigDecimal("200.00"));
        recipientWallet.setCurrency("INR");
        recipientWallet.setStatus("ACTIVE");

        when(userRepository.findByKeycloakUserId("kc-sender-1")).thenReturn(Optional.of(sender));
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(senderWallet));

        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(99L);
            return tx;
        });
        when(sagaRepository.save(any(SagaInstance.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("Should successfully orchestrate payment saga across services")
    void shouldCompletePaymentSagaSuccessfully() {
        RiskAssessment allowed = new RiskAssessment();
        allowed.setDecision(RiskDecision.ALLOWED);
        allowed.setRiskScore(10);
        when(riskEngineService.assessTransaction(eq(sender), any(BigDecimal.class))).thenReturn(allowed);

        when(userRepository.findByEmail("recipient@example.com")).thenReturn(Optional.of(recipient));
        when(walletRepository.findByUserIdForUpdate(2L)).thenReturn(Optional.of(recipientWallet));

        SagaExecutionResponse response = orchestrator.executePaymentSaga(
                "kc-sender-1",
                new BigDecimal("250.00"),
                "recipient@example.com",
                false
        );

        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(response.compensated()).isFalse();
        assertThat(senderWallet.getBalance()).isEqualByComparingTo(new BigDecimal("750.00"));
        assertThat(recipientWallet.getBalance()).isEqualByComparingTo(new BigDecimal("450.00"));

        verify(ledgerService, times(2)).recordEntry(any(), any(), any(), eq(new BigDecimal("250.00")), any(), anyString());
        verify(outboxService).saveEvent(eq("SAGA_INSTANCE"), anyString(), eq("SAGA_COMPLETED"), anyString());
    }

    @Test
    @DisplayName("Should execute compensating transaction when downstream error is simulated")
    void shouldCompensateOnDownstreamFailure() {
        RiskAssessment allowed = new RiskAssessment();
        allowed.setDecision(RiskDecision.ALLOWED);
        when(riskEngineService.assessTransaction(eq(sender), any(BigDecimal.class))).thenReturn(allowed);

        SagaExecutionResponse response = orchestrator.executePaymentSaga(
                "kc-sender-1",
                new BigDecimal("300.00"),
                "recipient@example.com",
                true // simulate failure
        );

        assertThat(response.status()).isEqualTo("COMPENSATED");
        assertThat(response.compensated()).isTrue();
        assertThat(response.compensationReason()).contains("Simulated external downstream partner timeout");

        // Balance restored to 1000 after compensation!
        assertThat(senderWallet.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));

        verify(outboxService).saveEvent(eq("SAGA_INSTANCE"), anyString(), eq("SAGA_COMPENSATED"), anyString());
        verify(notificationService).createNotification(eq(sender), eq("SECURITY"), eq("Payment Cancelled & Refunded"), anyString(), anyString(), isNull());
    }
}

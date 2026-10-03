package com.securepay.payment;

import com.securepay.audit.SecurityAuditService;
import com.securepay.audit.SecurityAuditSeverity;
import com.securepay.ledger.LedgerEntryType;
import com.securepay.ledger.LedgerService;
import com.securepay.merchant.Merchant;
import com.securepay.merchant.MerchantRepository;
import com.securepay.payment.dto.CreatePaymentRequest;
import com.securepay.payment.dto.CreateRefundRequest;
import com.securepay.payment.dto.MerchantPaymentResponse;
import com.securepay.payment.dto.MerchantRefundResponse;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MerchantPaymentServiceTest {

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MerchantPaymentRepository paymentRepository;

    @Mock
    private MerchantRefundRepository refundRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private LedgerService ledgerService;

    @Mock
    private SecurityAuditService auditService;

    @InjectMocks
    private MerchantPaymentService paymentService;

    private User merchantUser;
    private Merchant merchant;
    private Wallet merchantWallet;
    private User customerUser;
    private Wallet customerWallet;

    @BeforeEach
    void setUp() {
        merchantUser = new User();
        merchantUser.setId(10L);
        merchantUser.setEmail("merchant@example.com");
        merchantUser.setKeycloakUserId("kc-mer-10");

        merchant = new Merchant();
        merchant.setId(1L);
        merchant.setUser(merchantUser);
        merchant.setBusinessName("Test Store");
        merchant.setMerchantId("mer_test_1");

        merchantWallet = new Wallet();
        merchantWallet.setId(100L);
        merchantWallet.setUser(merchantUser);
        merchantWallet.setBalance(new BigDecimal("5000.00"));
        merchantWallet.setCurrency("INR");
        merchantWallet.setStatus("ACTIVE");

        customerUser = new User();
        customerUser.setId(20L);
        customerUser.setEmail("customer@example.com");

        customerWallet = new Wallet();
        customerWallet.setId(200L);
        customerWallet.setUser(customerUser);
        customerWallet.setBalance(new BigDecimal("2000.00"));
        customerWallet.setCurrency("INR");
        customerWallet.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should collect UPI payment and settle into merchant wallet with ledger credit")
    void shouldCollectUpiPayment() {
        when(userRepository.findByKeycloakUserId("kc-mer-10")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));
        when(walletRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchantWallet));
        when(paymentRepository.save(any(MerchantPayment.class))).thenAnswer(i -> {
            MerchantPayment p = i.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(500L);
            return tx;
        });

        CreatePaymentRequest request = new CreatePaymentRequest(
                new BigDecimal("1500.00"),
                "INR",
                "Customer One",
                "customer1@example.com",
                "UPI",
                "Purchase order #123"
        );

        MerchantPaymentResponse response = paymentService.collectPayment("kc-mer-10", request);

        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(response.status()).isEqualTo("SUCCESS");
        assertThat(merchantWallet.getBalance()).isEqualByComparingTo(new BigDecimal("6500.00"));

        verify(ledgerService).recordEntry(
                any(WalletTransaction.class),
                eq(merchantWallet),
                eq(LedgerEntryType.CREDIT),
                eq(new BigDecimal("1500.00")),
                eq(new BigDecimal("6500.00")),
                anyString()
        );

        verify(auditService).recordEvent(
                eq("MERCHANT_PAYMENT_COLLECTED"),
                eq(merchantUser),
                eq(SecurityAuditSeverity.INFO),
                isNull(),
                isNull(),
                anyString()
        );
    }

    @Test
    @DisplayName("Should collect WALLET payment with balanced double-entry ledger entries")
    void shouldCollectWalletPayment() {
        when(userRepository.findByKeycloakUserId("kc-mer-10")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));
        when(walletRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchantWallet));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customerUser));
        when(walletRepository.findByUser(customerUser)).thenReturn(Optional.of(customerWallet));

        when(paymentRepository.save(any(MerchantPayment.class))).thenAnswer(i -> {
            MerchantPayment p = i.getArgument(0);
            p.setId(2L);
            return p;
        });
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(501L);
            return tx;
        });

        CreatePaymentRequest request = new CreatePaymentRequest(
                new BigDecimal("800.00"),
                "INR",
                "Customer Wallet User",
                "customer@example.com",
                "WALLET",
                "App subscription"
        );

        MerchantPaymentResponse response = paymentService.collectPayment("kc-mer-10", request);

        assertThat(response.status()).isEqualTo("SUCCESS");
        assertThat(customerWallet.getBalance()).isEqualByComparingTo(new BigDecimal("1200.00"));
        assertThat(merchantWallet.getBalance()).isEqualByComparingTo(new BigDecimal("5800.00"));

        // Verify customer debit ledger entry
        verify(ledgerService).recordEntry(
                any(WalletTransaction.class),
                eq(customerWallet),
                eq(LedgerEntryType.DEBIT),
                eq(new BigDecimal("800.00")),
                eq(new BigDecimal("1200.00")),
                anyString()
        );

        // Verify merchant credit ledger entry
        verify(ledgerService).recordEntry(
                any(WalletTransaction.class),
                eq(merchantWallet),
                eq(LedgerEntryType.CREDIT),
                eq(new BigDecimal("800.00")),
                eq(new BigDecimal("5800.00")),
                anyString()
        );
    }

    @Test
    @DisplayName("Should reject WALLET payment when customer wallet balance is insufficient")
    void shouldRejectWalletPaymentOnInsufficientBalance() {
        when(userRepository.findByKeycloakUserId("kc-mer-10")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));
        when(walletRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchantWallet));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customerUser));
        when(walletRepository.findByUser(customerUser)).thenReturn(Optional.of(customerWallet));

        CreatePaymentRequest request = new CreatePaymentRequest(
                new BigDecimal("9000.00"), // Exceeds 2000 balance
                "INR",
                "Customer Wallet User",
                "customer@example.com",
                "WALLET",
                "High value purchase"
        );

        assertThatThrownBy(() -> paymentService.collectPayment("kc-mer-10", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient customer wallet balance");
    }

    @Test
    @DisplayName("Should successfully process refund and balance ledger")
    void shouldProcessRefund() {
        when(userRepository.findByKeycloakUserId("kc-mer-10")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));
        when(walletRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchantWallet));

        MerchantPayment payment = new MerchantPayment();
        payment.setId(10L);
        payment.setMerchant(merchant);
        payment.setReference("SP-PAY-99999");
        payment.setCustomerName("Refund Customer");
        payment.setCustomerEmail("customer@example.com");
        payment.setAmount(new BigDecimal("1000.00"));
        payment.setCurrency("INR");
        payment.setMethod("WALLET");
        payment.setStatus("SUCCESS");

        when(paymentRepository.findByReferenceAndMerchant("SP-PAY-99999", merchant))
                .thenReturn(Optional.of(payment));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customerUser));
        when(walletRepository.findByUser(customerUser)).thenReturn(Optional.of(customerWallet));

        when(refundRepository.save(any(MerchantRefund.class))).thenAnswer(i -> {
            MerchantRefund r = i.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> {
            WalletTransaction tx = i.getArgument(0);
            tx.setId(700L);
            return tx;
        });

        CreateRefundRequest request = new CreateRefundRequest(
                "SP-PAY-99999",
                new BigDecimal("1000.00"),
                "Product return"
        );

        MerchantRefundResponse refundResponse = paymentService.processRefund("kc-mer-10", request);

        assertThat(refundResponse.status()).isEqualTo("SUCCESS");
        assertThat(payment.getStatus()).isEqualTo("REFUNDED");
        assertThat(merchantWallet.getBalance()).isEqualByComparingTo(new BigDecimal("4000.00"));
        assertThat(customerWallet.getBalance()).isEqualByComparingTo(new BigDecimal("3000.00"));

        verify(auditService).recordEvent(
                eq("MERCHANT_REFUND_PROCESSED"),
                eq(merchantUser),
                eq(SecurityAuditSeverity.INFO),
                isNull(),
                isNull(),
                anyString()
        );
    }
}

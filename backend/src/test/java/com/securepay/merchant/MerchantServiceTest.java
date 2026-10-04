package com.securepay.merchant;

import com.securepay.merchant.dto.ApiKeyResponse;
import com.securepay.merchant.dto.CreateApiKeyRequest;
import com.securepay.merchant.dto.MerchantDashboardSummaryResponse;
import com.securepay.merchant.dto.MerchantProfileResponse;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MerchantServiceTest {

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private MerchantApiKeyRepository apiKeyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.securepay.payment.MerchantPaymentRepository paymentRepository;

    @Mock
    private com.securepay.payment.MerchantRefundRepository refundRepository;

    @InjectMocks
    private MerchantService merchantService;

    private User merchantUser;
    private Merchant merchant;

    @BeforeEach
    void setUp() {
        merchantUser = new User();
        merchantUser.setFullName("Merchant Acme");
        merchantUser.setEmail("acme@securepay.local");
        merchantUser.setAccountType("MERCHANT");
        merchantUser.setKeycloakUserId("kc-mer-123");

        merchant = new Merchant();
        merchant.setMerchantId("MER-10001");
        merchant.setUser(merchantUser);
        merchant.setBusinessName("Acme Store");
        merchant.setLegalName("Acme Pvt Ltd");
        merchant.setEmail("acme@securepay.local");
        merchant.setAccountStatus("ACTIVE");
        merchant.setVerificationStatus("VERIFIED");
    }

    @Test
    void shouldReturnMerchantProfile() {
        when(userRepository.findByKeycloakUserId("kc-mer-123")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));

        MerchantProfileResponse response = merchantService.getMerchantProfile("kc-mer-123");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("MER-10001");
        assertThat(response.businessName()).isEqualTo("Acme Store");
        assertThat(response.email()).isEqualTo("acme@securepay.local");
    }

    @Test
    void shouldCreateApiKeyWithCorrectPrefixAndHashedSecret() {
        when(userRepository.findByKeycloakUserId("kc-mer-123")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));
        when(apiKeyRepository.save(any(MerchantApiKey.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateApiKeyRequest request = new CreateApiKeyRequest("Test Key", "TEST", List.of("payments:create"));
        ApiKeyResponse response = merchantService.createApiKey("kc-mer-123", request);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Test Key");
        assertThat(response.environment()).isEqualTo("TEST");
        assertThat(response.prefix()).startsWith("sp_test_");
        assertThat(response.secretKey()).isNotBlank();
        assertThat(response.secretKey()).startsWith(response.prefix());
        assertThat(response.status()).isEqualTo("ACTIVE");

        verify(apiKeyRepository).save(any(MerchantApiKey.class));
    }

    @Test
    void shouldRevokeApiKeySuccessfully() {
        when(userRepository.findByKeycloakUserId("kc-mer-123")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));

        MerchantApiKey apiKey = new MerchantApiKey();
        apiKey.setKeyId("key-123");
        apiKey.setStatus("ACTIVE");

        when(apiKeyRepository.findByMerchantAndKeyId(merchant, "key-123")).thenReturn(Optional.of(apiKey));

        merchantService.revokeApiKey("kc-mer-123", "key-123");

        assertThat(apiKey.getStatus()).isEqualTo("REVOKED");
        verify(apiKeyRepository).save(apiKey);
    }

    @Test
    void shouldReturnDashboardSummary() {
        when(userRepository.findByKeycloakUserId("kc-mer-123")).thenReturn(Optional.of(merchantUser));
        when(merchantRepository.findByUser(merchantUser)).thenReturn(Optional.of(merchant));

        com.securepay.payment.MerchantPayment payment = new com.securepay.payment.MerchantPayment();
        payment.setId(1L);
        payment.setReference("SP-PAY-12345");
        payment.setCustomerName("Alice Customer");
        payment.setAmount(new java.math.BigDecimal("500.00"));
        payment.setStatus("SUCCESS");

        when(paymentRepository.findByMerchantOrderByCreatedAtDesc(merchant)).thenReturn(List.of(payment));
        when(refundRepository.findByMerchantOrderByCreatedAtDesc(merchant)).thenReturn(List.of());

        MerchantDashboardSummaryResponse summary = merchantService.getDashboardSummary("kc-mer-123");

        assertThat(summary).isNotNull();
        assertThat(summary.currency()).isEqualTo("INR");
        assertThat(summary.totalRevenue()).isEqualByComparingTo("500.00");
        assertThat(summary.successfulPayments()).isEqualTo(1);
        assertThat(summary.recentPayments()).hasSize(1);
    }
}

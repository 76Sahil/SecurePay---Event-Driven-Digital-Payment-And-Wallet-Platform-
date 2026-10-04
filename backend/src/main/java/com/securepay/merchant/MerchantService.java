package com.securepay.merchant;

import com.securepay.merchant.dto.ApiKeyResponse;
import com.securepay.merchant.dto.CreateApiKeyRequest;
import com.securepay.merchant.dto.MerchantDashboardSummaryResponse;
import com.securepay.merchant.dto.MerchantProfileResponse;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.payment.MerchantPayment;
import com.securepay.payment.MerchantPaymentRepository;
import com.securepay.payment.MerchantRefund;
import com.securepay.payment.MerchantRefundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;

@Service
public class MerchantService {

    private final MerchantRepository merchantRepository;
    private final MerchantApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;
    private final MerchantPaymentRepository paymentRepository;
    private final MerchantRefundRepository refundRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public MerchantService(
            MerchantRepository merchantRepository,
            MerchantApiKeyRepository apiKeyRepository,
            UserRepository userRepository) {
        this(merchantRepository, apiKeyRepository, userRepository, null, null);
    }

    @Autowired
    public MerchantService(
            MerchantRepository merchantRepository,
            MerchantApiKeyRepository apiKeyRepository,
            UserRepository userRepository,
            MerchantPaymentRepository paymentRepository,
            MerchantRefundRepository refundRepository) {
        this.merchantRepository = merchantRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.refundRepository = refundRepository;
    }

    @Transactional
    public Merchant getOrCreateMerchant(String keycloakUserId) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found."));

        return merchantRepository.findByUser(user).orElseGet(() -> {
            Merchant merchant = new Merchant();
            merchant.setUser(user);
            merchant.setMerchantId("MER-" + (10000 + user.getId()));
            merchant.setBusinessName(user.getFullName() + " Store");
            merchant.setLegalName(user.getFullName() + " Private Limited");
            merchant.setEmail(user.getEmail());
            merchant.setPhone(user.getPhoneNumber() != null ? user.getPhoneNumber() : "+91 98765 43210");
            merchant.setMerchantType("BUSINESS");
            merchant.setAccountStatus("ACTIVE");
            merchant.setVerificationStatus("VERIFIED");
            merchant.setSettlementCurrency("INR");
            return merchantRepository.save(merchant);
        });
    }

    @Transactional
    public MerchantProfileResponse getMerchantProfile(String keycloakUserId) {
        Merchant merchant = getOrCreateMerchant(keycloakUserId);
        return MerchantProfileResponse.from(merchant);
    }

    @Transactional
    public List<ApiKeyResponse> listApiKeys(String keycloakUserId) {
        Merchant merchant = getOrCreateMerchant(keycloakUserId);
        return apiKeyRepository.findByMerchantOrderByCreatedAtDesc(merchant)
                .stream()
                .map(key -> ApiKeyResponse.from(key, null))
                .toList();
    }

    @Transactional
    public ApiKeyResponse createApiKey(String keycloakUserId, CreateApiKeyRequest request) {
        Merchant merchant = getOrCreateMerchant(keycloakUserId);

        String env = request.environment() != null && request.environment().equalsIgnoreCase("LIVE")
                ? "LIVE"
                : "TEST";

        byte[] randomBytes = new byte[16];
        secureRandom.nextBytes(randomBytes);
        String randomHex = HexFormat.of().formatHex(randomBytes).toUpperCase(Locale.ROOT);

        String prefix = env.equals("LIVE")
                ? "sp_live_" + randomHex.substring(0, 4)
                : "sp_test_" + randomHex.substring(0, 4);

        String plainKey = prefix + "_" + randomHex;
        String hashedKey = hashApiKey(plainKey);

        String keyId = "key-" + UUID.randomUUID().toString().substring(0, 8);

        String scopesStr = request.scopes() != null && !request.scopes().isEmpty()
                ? String.join(",", request.scopes())
                : "payments:read,payments:create";

        MerchantApiKey apiKey = new MerchantApiKey();
        apiKey.setKeyId(keyId);
        apiKey.setMerchant(merchant);
        apiKey.setName(request.name().trim());
        apiKey.setPrefix(prefix);
        apiKey.setHashedKey(hashedKey);
        apiKey.setEnvironment(env);
        apiKey.setScopes(scopesStr);
        apiKey.setStatus("ACTIVE");

        MerchantApiKey saved = apiKeyRepository.save(apiKey);
        return ApiKeyResponse.from(saved, plainKey);
    }

    @Transactional
    public void revokeApiKey(String keycloakUserId, String keyId) {
        Merchant merchant = getOrCreateMerchant(keycloakUserId);
        MerchantApiKey apiKey = apiKeyRepository.findByMerchantAndKeyId(merchant, keyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found with id: " + keyId));

        apiKey.setStatus("REVOKED");
        apiKeyRepository.save(apiKey);
    }

    @Transactional(readOnly = true)
    public MerchantDashboardSummaryResponse getDashboardSummary(String keycloakUserId) {
        Merchant merchant = getOrCreateMerchant(keycloakUserId);

        List<MerchantPayment> payments = paymentRepository != null
                ? paymentRepository.findByMerchantOrderByCreatedAtDesc(merchant)
                : List.of();

        List<MerchantRefund> refunds = refundRepository != null
                ? refundRepository.findByMerchantOrderByCreatedAtDesc(merchant)
                : List.of();

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()) || "REFUNDED".equalsIgnoreCase(p.getStatus()))
                .map(MerchantPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int successfulPayments = (int) payments.stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()) || "REFUNDED".equalsIgnoreCase(p.getStatus()))
                .count();

        int pendingPayments = (int) payments.stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getStatus()))
                .count();

        BigDecimal totalRefunds = refunds.stream()
                .filter(r -> "SUCCESS".equalsIgnoreCase(r.getStatus()) || "COMPLETED".equalsIgnoreCase(r.getStatus()))
                .map(MerchantRefund::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> recentPayments = payments.stream()
                .limit(10)
                .map(p -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", String.valueOf(p.getId()));
                    map.put("reference", p.getReference());
                    map.put("customerName", p.getCustomerName());
                    map.put("amount", p.getAmount());
                    map.put("status", p.getStatus());
                    map.put("createdAt", p.getCreatedAt().toString());
                    return map;
                })
                .toList();

        return new MerchantDashboardSummaryResponse(
                merchant.getSettlementCurrency(),
                totalRevenue,
                successfulPayments,
                pendingPayments,
                totalRefunds,
                recentPayments
        );
    }

    private String hashApiKey(String plainKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(plainKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}

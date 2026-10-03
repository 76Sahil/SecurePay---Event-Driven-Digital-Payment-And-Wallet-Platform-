package com.securepay.gateway;

import com.securepay.audit.SecurityAuditService;
import com.securepay.audit.SecurityAuditSeverity;
import com.securepay.gateway.dto.CreateOrderRequest;
import com.securepay.gateway.dto.GatewayOrderResponse;
import com.securepay.gateway.dto.VerifyPaymentRequest;
import com.securepay.outbox.OutboxService;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.wallet.Wallet;
import com.securepay.wallet.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PaymentGatewayService.class);

    @Value("${securepay.gateway.provider:SIMULATED}")
    private String gatewayProvider = "SIMULATED";

    @Value("${razorpay.key.id:rzp_test_mock_key}")
    private String razorpayKeyId = "rzp_test_mock_key";

    @Value("${razorpay.key.secret:rzp_test_mock_secret}")
    private String razorpayKeySecret = "rzp_test_mock_secret";

    @Value("${razorpay.webhook.secret:rzp_test_webhook_secret}")
    private String razorpayWebhookSecret = "rzp_test_webhook_secret";

    private final GatewayOrderRepository orderRepository;
    private final WebhookEventRepository webhookEventRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final OutboxService outboxService;
    private final SecurityAuditService auditService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public PaymentGatewayService(
            GatewayOrderRepository orderRepository,
            WebhookEventRepository webhookEventRepository,
            UserRepository userRepository,
            WalletRepository walletRepository,
            OutboxService outboxService,
            SecurityAuditService auditService) {
        this.orderRepository = orderRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.outboxService = outboxService;
        this.auditService = auditService;
    }

    @Transactional
    public GatewayOrderResponse createOrder(String keycloakUserId, CreateOrderRequest request) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for identity: " + keycloakUserId));

        BigDecimal amount = request.amount();
        if (amount == null || amount.compareTo(BigDecimal.ONE) < 0) {
            throw new IllegalArgumentException("Order amount must be at least INR 1.00");
        }

        String orderId = "order_sim_" + System.currentTimeMillis() + "_" + (1000 + RANDOM.nextInt(9000));
        String receipt = request.receipt() != null ? request.receipt() : "rcpt_" + System.currentTimeMillis();
        String currency = request.currency() != null ? request.currency() : "INR";

        GatewayOrder order = new GatewayOrder();
        order.setOrderId(orderId);
        order.setUser(user);
        order.setAmount(amount);
        order.setCurrency(currency);
        order.setReceipt(receipt);
        order.setStatus("CREATED");
        order.setGatewayProvider(gatewayProvider);

        GatewayOrder saved = orderRepository.save(order);

        // Transactional outbox event
        outboxService.saveEvent(
                "GATEWAY_ORDER",
                orderId,
                "ORDER_CREATED",
                "{\"orderId\":\"" + orderId + "\",\"amount\":" + amount + ",\"currency\":\"" + currency + "\"}"
        );

        auditService.recordEvent(
                "GATEWAY_ORDER_CREATED",
                user,
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Gateway order created: " + orderId + " for amount INR " + amount
        );

        return new GatewayOrderResponse(
                saved.getOrderId(),
                saved.getAmount(),
                saved.getCurrency(),
                saved.getReceipt(),
                saved.getStatus(),
                razorpayKeyId,
                saved.getGatewayProvider()
        );
    }

    @Transactional
    public Map<String, Object> verifyPayment(String keycloakUserId, VerifyPaymentRequest request) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        GatewayOrder order = orderRepository.findByOrderId(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.orderId()));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized: Order does not belong to this user.");
        }

        boolean validSignature = verifySignature(
                request.orderId() + "|" + request.paymentId(),
                request.signature(),
                razorpayKeySecret
        );

        if (!validSignature && !"SIMULATED".equalsIgnoreCase(gatewayProvider)) {
            auditService.recordEvent(
                    "GATEWAY_SIGNATURE_MISMATCH",
                    user,
                    SecurityAuditSeverity.CRITICAL,
                    null,
                    null,
                    "Invalid gateway payment signature for order " + request.orderId()
            );
            throw new IllegalArgumentException("Invalid payment signature.");
        }

        order.setStatus("PAID");
        orderRepository.save(order);

        // Transactional Outbox
        outboxService.saveEvent(
                "GATEWAY_PAYMENT",
                request.paymentId(),
                "PAYMENT_VERIFIED",
                "{\"orderId\":\"" + request.orderId() + "\",\"paymentId\":\"" + request.paymentId() + "\",\"status\":\"PAID\"}"
        );

        auditService.recordEvent(
                "GATEWAY_PAYMENT_VERIFIED",
                user,
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Gateway payment verified: " + request.paymentId() + " for order " + request.orderId()
        );

        return Map.of(
                "status", "SUCCESS",
                "orderId", order.getOrderId(),
                "paymentId", request.paymentId(),
                "amount", order.getAmount(),
                "message", "Payment verified and recorded successfully."
        );
    }

    @Transactional
    public Map<String, Object> processWebhook(String payload, String signatureHeader) {
        String eventId = "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        boolean signatureValid;
        if ("SIMULATED".equalsIgnoreCase(gatewayProvider) && ("sig_mock".equalsIgnoreCase(signatureHeader) || signatureHeader == null || signatureHeader.isBlank())) {
            signatureValid = true;
        } else if (signatureHeader != null && !signatureHeader.isBlank()) {
            signatureValid = verifyHmacSha256(payload, signatureHeader, razorpayWebhookSecret);
        } else {
            signatureValid = false;
        }

        if (!signatureValid) {
            log.warn("Invalid webhook signature received");
            auditService.recordEvent(
                    "WEBHOOK_SIGNATURE_INVALID",
                    null,
                    SecurityAuditSeverity.CRITICAL,
                    null,
                    null,
                    "Rejected webhook with invalid HMAC signature"
            );
            throw new IllegalArgumentException("Invalid webhook signature.");
        }

        WebhookEvent event = new WebhookEvent();
        event.setEventId(eventId);
        event.setEventType("PAYMENT_CAPTURED");
        event.setSource("RAZORPAY");
        event.setPayload(payload);
        event.setSignature(signatureHeader);
        event.setStatus("PROCESSED");

        webhookEventRepository.save(event);

        auditService.recordEvent(
                "WEBHOOK_PROCESSED",
                null,
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Webhook event " + eventId + " processed successfully."
        );

        return Map.of(
                "status", "SUCCESS",
                "eventId", eventId,
                "message", "Webhook verified and processed successfully."
        );
    }

    public boolean verifySignature(String data, String signature, String secret) {
        if ("SIMULATED".equalsIgnoreCase(gatewayProvider)) {
            return true; // Allow simulated tests and sandbox signatures
        }
        return verifyHmacSha256(data, signature, secret);
    }

    private boolean verifyHmacSha256(String data, String signature, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            byte[] expectedBytes = HexFormat.of().formatHex(hash).getBytes(StandardCharsets.UTF_8);
            byte[] signatureBytes = signature.toLowerCase().getBytes(StandardCharsets.UTF_8);
            return java.security.MessageDigest.isEqual(expectedBytes, signatureBytes);
        } catch (Exception e) {
            log.error("Failed to compute HMAC-SHA256: {}", e.getMessage());
            return false;
        }
    }
}

package com.securepay.gateway;

import com.securepay.audit.SecurityAuditService;
import com.securepay.gateway.dto.CreateOrderRequest;
import com.securepay.gateway.dto.GatewayOrderResponse;
import com.securepay.gateway.dto.VerifyPaymentRequest;
import com.securepay.outbox.OutboxService;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.wallet.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentGatewayServiceTest {

    @Mock
    private GatewayOrderRepository orderRepository;

    @Mock
    private WebhookEventRepository webhookEventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private OutboxService outboxService;

    @Mock
    private SecurityAuditService auditService;

    @InjectMocks
    private PaymentGatewayService gatewayService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("gateway-user@example.com");
        sampleUser.setKeycloakUserId("kc-user-10");
    }

    @Test
    @DisplayName("Should create gateway order and dispatch outbox event")
    void shouldCreateGatewayOrder() {
        when(userRepository.findByKeycloakUserId("kc-user-10")).thenReturn(Optional.of(sampleUser));
        when(orderRepository.save(any(GatewayOrder.class))).thenAnswer(i -> {
            GatewayOrder o = i.getArgument(0);
            o.setId(1L);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                new BigDecimal("5000.00"),
                "INR",
                "rcpt_123"
        );

        GatewayOrderResponse response = gatewayService.createOrder("kc-user-10", request);

        assertThat(response.orderId()).startsWith("order_sim_");
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(response.currency()).isEqualTo("INR");
        assertThat(response.status()).isEqualTo("CREATED");

        verify(outboxService).saveEvent(
                eq("GATEWAY_ORDER"),
                eq(response.orderId()),
                eq("ORDER_CREATED"),
                anyString()
        );
        verify(auditService).recordEvent(eq("GATEWAY_ORDER_CREATED"), eq(sampleUser), any(), isNull(), isNull(), anyString());
    }

    @Test
    @DisplayName("Should verify payment and mark order as PAID")
    void shouldVerifyPayment() {
        when(userRepository.findByKeycloakUserId("kc-user-10")).thenReturn(Optional.of(sampleUser));

        GatewayOrder order = new GatewayOrder();
        order.setId(1L);
        order.setOrderId("order_sim_123");
        order.setUser(sampleUser);
        order.setAmount(new BigDecimal("2500.00"));
        order.setStatus("CREATED");

        when(orderRepository.findByOrderId("order_sim_123")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(GatewayOrder.class))).thenAnswer(i -> i.getArgument(0));

        VerifyPaymentRequest request = new VerifyPaymentRequest(
                "order_sim_123",
                "pay_sim_999",
                "test_mock_sig"
        );

        Map<String, Object> result = gatewayService.verifyPayment("kc-user-10", request);

        assertThat(result.get("status")).isEqualTo("SUCCESS");
        assertThat(order.getStatus()).isEqualTo("PAID");

        verify(outboxService).saveEvent(
                eq("GATEWAY_PAYMENT"),
                eq("pay_sim_999"),
                eq("PAYMENT_VERIFIED"),
                anyString()
        );
    }

    @Test
    @DisplayName("Should process webhook event and store payload")
    void shouldProcessWebhook() {
        when(webhookEventRepository.save(any(WebhookEvent.class))).thenAnswer(i -> {
            WebhookEvent e = i.getArgument(0);
            e.setId(1L);
            return e;
        });

        String payload = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"id\":\"pay_123\"}}}";
        Map<String, Object> result = gatewayService.processWebhook(payload, "sig_mock");

        assertThat(result.get("status")).isEqualTo("SUCCESS");
        assertThat(result.get("eventId")).isNotNull();
        verify(webhookEventRepository).save(any(WebhookEvent.class));
    }
}

package com.securepay.gateway;

import tools.jackson.databind.ObjectMapper;
import com.securepay.gateway.dto.CreateOrderRequest;
import com.securepay.gateway.dto.GatewayOrderResponse;
import com.securepay.gateway.dto.VerifyPaymentRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GatewayControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentGatewayService gatewayService;

    @InjectMocks
    private GatewayController gatewayController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("test-user-sub");

        HandlerMethodArgumentResolver jwtResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                        && parameter.getParameterType().isAssignableFrom(Jwt.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return jwt;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(gatewayController)
                .setCustomArgumentResolvers(jwtResolver)
                .build();
    }

    @Test
    @DisplayName("POST /api/gateway/orders should return 201 CREATED with order details")
    void shouldCreateOrder() throws Exception {
        CreateOrderRequest request = new CreateOrderRequest(new BigDecimal("1000.00"), "INR", "rcpt_1");
        GatewayOrderResponse response = new GatewayOrderResponse(
                "order_123", new BigDecimal("1000.00"), "INR", "rcpt_1", "CREATED", "rzp_test_key", "SIMULATED"
        );

        when(gatewayService.createOrder(eq("test-user-sub"), any(CreateOrderRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/gateway/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("order_123"))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    @DisplayName("POST /api/gateway/verify should return 200 OK")
    void shouldVerifyPayment() throws Exception {
        VerifyPaymentRequest request = new VerifyPaymentRequest("order_123", "pay_456", "sig_789");
        when(gatewayService.verifyPayment(eq("test-user-sub"), any(VerifyPaymentRequest.class)))
                .thenReturn(Map.of("status", "SUCCESS", "message", "Verified"));

        mockMvc.perform(post("/api/gateway/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}

package com.securepay.payment;

import tools.jackson.databind.ObjectMapper;
import com.securepay.payment.dto.CreatePaymentRequest;
import com.securepay.payment.dto.CreateRefundRequest;
import com.securepay.payment.dto.MerchantPaymentResponse;
import com.securepay.payment.dto.MerchantRefundResponse;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MerchantPaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MerchantPaymentService paymentService;

    @InjectMocks
    private MerchantPaymentController paymentController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("test-merchant-sub");

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

        mockMvc = MockMvcBuilders.standaloneSetup(paymentController)
                .setCustomArgumentResolvers(jwtResolver)
                .build();
    }

    @Test
    @DisplayName("GET /api/merchant/payments should return 200 and list of payments")
    void shouldReturnMerchantPayments() throws Exception {
        MerchantPaymentResponse response = new MerchantPaymentResponse(
                "1", "SP-PAY-10001", "Customer", "c@example.com",
                new BigDecimal("500.00"), "INR", "UPI", "SUCCESS", "Desc", "2026-09-30T10:00:00"
        );
        when(paymentService.getMerchantPayments("test-merchant-sub")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/merchant/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reference").value("SP-PAY-10001"))
                .andExpect(jsonPath("$[0].amount").value(500.00));
    }

    @Test
    @DisplayName("POST /api/merchant/payments/collect should return 201 CREATED")
    void shouldCollectPayment() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest(
                new BigDecimal("750.00"), "INR", "Customer", "c@example.com", "UPI", "Order"
        );
        MerchantPaymentResponse response = new MerchantPaymentResponse(
                "2", "SP-PAY-10002", "Customer", "c@example.com",
                new BigDecimal("750.00"), "INR", "UPI", "SUCCESS", "Order", "2026-09-30T10:00:00"
        );
        when(paymentService.collectPayment(eq("test-merchant-sub"), any(CreatePaymentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/merchant/payments/collect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference").value("SP-PAY-10002"))
                .andExpect(jsonPath("$.amount").value(750.00));
    }

    @Test
    @DisplayName("POST /api/merchant/refunds should return 201 CREATED")
    void shouldProcessRefund() throws Exception {
        CreateRefundRequest request = new CreateRefundRequest("SP-PAY-10002", new BigDecimal("750.00"), "Customer return");
        MerchantRefundResponse response = new MerchantRefundResponse(
                "1", "SP-REF-70001", "SP-PAY-10002", "Customer",
                new BigDecimal("750.00"), "INR", "Customer return", "SUCCESS", "2026-09-30T11:00:00"
        );
        when(paymentService.processRefund(eq("test-merchant-sub"), any(CreateRefundRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/merchant/refunds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reference").value("SP-REF-70001"))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}

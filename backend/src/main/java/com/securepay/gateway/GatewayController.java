package com.securepay.gateway;

import com.securepay.gateway.dto.CreateOrderRequest;
import com.securepay.gateway.dto.GatewayOrderResponse;
import com.securepay.gateway.dto.VerifyPaymentRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gateway")
@PreAuthorize("isAuthenticated()")
public class GatewayController {

    private final PaymentGatewayService gatewayService;

    public GatewayController(PaymentGatewayService gatewayService) {
        this.gatewayService = gatewayService;
    }

    @PostMapping("/orders")
    public ResponseEntity<GatewayOrderResponse> createOrder(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateOrderRequest request) {
        GatewayOrderResponse response = gatewayService.createOrder(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody VerifyPaymentRequest request) {
        Map<String, Object> result = gatewayService.verifyPayment(jwt.getSubject(), request);
        return ResponseEntity.ok(result);
    }
}

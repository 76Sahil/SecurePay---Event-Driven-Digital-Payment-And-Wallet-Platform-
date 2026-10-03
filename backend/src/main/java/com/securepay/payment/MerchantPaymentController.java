package com.securepay.payment;

import com.securepay.payment.dto.CreatePaymentRequest;
import com.securepay.payment.dto.CreateRefundRequest;
import com.securepay.payment.dto.MerchantPaymentResponse;
import com.securepay.payment.dto.MerchantRefundResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/merchant")
@PreAuthorize("hasRole('MERCHANT')")
public class MerchantPaymentController {

    private final MerchantPaymentService paymentService;

    public MerchantPaymentController(MerchantPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/payments")
    public ResponseEntity<List<MerchantPaymentResponse>> getPayments(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(paymentService.getMerchantPayments(jwt.getSubject()));
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<MerchantPaymentResponse> getPaymentById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String id) {
        return ResponseEntity.ok(paymentService.getPaymentById(jwt.getSubject(), id));
    }

    @PostMapping("/payments/collect")
    public ResponseEntity<MerchantPaymentResponse> collectPayment(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreatePaymentRequest request) {
        MerchantPaymentResponse response = paymentService.collectPayment(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/refunds")
    public ResponseEntity<List<MerchantRefundResponse>> getRefunds(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(paymentService.getMerchantRefunds(jwt.getSubject()));
    }

    @PostMapping("/refunds")
    public ResponseEntity<MerchantRefundResponse> processRefund(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CreateRefundRequest request) {
        MerchantRefundResponse response = paymentService.processRefund(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

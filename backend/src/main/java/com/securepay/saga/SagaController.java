package com.securepay.saga;

import com.securepay.saga.dto.SagaExecutionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/saga")
@PreAuthorize("isAuthenticated()")
public class SagaController {

    private final PaymentSagaOrchestrator orchestrator;

    public SagaController(PaymentSagaOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/simulate")
    public ResponseEntity<SagaExecutionResponse> simulateSaga(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> request) {

        BigDecimal amount = new BigDecimal(String.valueOf(request.getOrDefault("amount", "100.00")));
        String recipientEmail = (String) request.get("recipientEmail");
        boolean simulateFailure = Boolean.TRUE.equals(request.get("simulateFailure"));

        SagaExecutionResponse response = orchestrator.executePaymentSaga(
                jwt.getSubject(),
                amount,
                recipientEmail,
                simulateFailure
        );

        return ResponseEntity.ok(response);
    }
}


package com.securepay.transaction;

import com.securepay.transaction.dto.TransferRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transfer(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TransferRequest request) {

        Long senderId = Long.parseLong(jwt.getSubject());

        transferService.transfer(
                senderId,
                request.recipientEmail(),
                request.amount()
        );

        return ResponseEntity.ok(
                Map.of("message", "Transfer completed successfully")
        );
    }
}
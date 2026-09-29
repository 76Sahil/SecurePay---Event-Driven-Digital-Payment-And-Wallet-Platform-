
package com.securepay.wallet;

import com.securepay.wallet.dto.WalletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.securepay.wallet.dto.AddMoneyRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletRepository walletRepository;
    private final WalletService walletService;

    public WalletController(
            WalletRepository walletRepository,
            WalletService walletService
    ) {
        this.walletRepository = walletRepository;
        this.walletService = walletService;
    }

    @GetMapping("/me")
    public WalletResponse getMyWallet(
            @AuthenticationPrincipal Jwt jwt) {

        Long userId = Long.valueOf(jwt.getSubject());

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Wallet not found"
                ));

        return new WalletResponse(
                wallet.getId(),
                userId,
                wallet.getBalance(),
                wallet.getCreatedAt()
        );
    }


    @PostMapping("/add-money")
    @ResponseStatus(HttpStatus.OK)
    public WalletResponse addMoney(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AddMoneyRequest request
    ) {
        Long userId = Long.valueOf(jwt.getSubject());

        Wallet wallet = walletService.addMoney(
                userId,
                request.amount()
        );

        return new WalletResponse(
                wallet.getId(),
                userId,
                wallet.getBalance(),
                wallet.getCreatedAt()
        );
    }
}
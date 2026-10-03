package com.securepay.wallet;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletService(
            WalletRepository walletRepository,
            UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> getOrCreateWallet(String keycloakUserId) {

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User profile not found. Please complete registration first."
                        ));

        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException(
                    "Wallet access is available only for customer accounts."
            );
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setUser(user);
                    newWallet.setBalance(BigDecimal.ZERO);
                    newWallet.setCurrency("INR");
                    newWallet.setStatus("ACTIVE");
                    return walletRepository.save(newWallet);
                });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", wallet.getId());
        response.put("userId", user.getId());
        response.put("balance", wallet.getBalance());
        response.put("currency", wallet.getCurrency());
        response.put("status", wallet.getStatus());
        response.put("createdAt", wallet.getCreatedAt().toString());

        return response;
    }
}

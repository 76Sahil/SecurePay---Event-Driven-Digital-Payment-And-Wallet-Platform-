package com.securepay.wallet;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public WalletService(
            WalletRepository walletRepository,
            UserRepository userRepository) {
        this(walletRepository, userRepository, null);
    }

    @Autowired
    public WalletService(
            WalletRepository walletRepository,
            UserRepository userRepository,
            UserService userService) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public Map<String, Object> getOrCreateWallet(String keycloakUserId) {
        return getOrCreateWallet(keycloakUserId, null, null);
    }

    @Transactional
    public Map<String, Object> getOrCreateWallet(String keycloakUserId, String email, String fullName) {
        User user = findOrProvisionUser(keycloakUserId, email, fullName);

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

    private User findOrProvisionUser(String keycloakUserId, String email, String fullName) {
        java.util.Optional<User> byKeycloak = userRepository.findByKeycloakUserId(keycloakUserId);
        if (byKeycloak.isPresent()) {
            return byKeycloak.get();
        }

        if (userService != null) {
            return userService.getOrCreateUser(keycloakUserId, email, fullName, "CUSTOMER");
        }

        throw new IllegalArgumentException("User not found for Keycloak identity: " + keycloakUserId);
    }
}

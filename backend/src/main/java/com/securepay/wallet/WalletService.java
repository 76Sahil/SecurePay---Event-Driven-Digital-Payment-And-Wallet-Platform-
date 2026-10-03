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

        String safeEmail = (email != null && !email.isBlank())
                ? email.trim().toLowerCase(java.util.Locale.ROOT)
                : (keycloakUserId.contains("@") ? keycloakUserId.trim().toLowerCase(java.util.Locale.ROOT) : null);

        if (safeEmail != null) {
            java.util.Optional<User> byEmail = userRepository.findByEmail(safeEmail);
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                existing.setKeycloakUserId(keycloakUserId);
                existing.setUpdatedAt(java.time.LocalDateTime.now());
                return userRepository.save(existing);
            }
        }

        User newUser = new User();
        newUser.setKeycloakUserId(keycloakUserId);
        newUser.setEmail(safeEmail != null ? safeEmail : keycloakUserId + "@securepay.local");
        String name = (fullName != null && !fullName.isBlank())
                ? fullName.trim()
                : (safeEmail != null ? safeEmail.split("@")[0] : "Customer");
        newUser.setFullName(name);
        newUser.setAccountType("CUSTOMER");
        newUser.setStatus("ACTIVE");
        newUser.setKycStatus("VERIFIED");
        newUser.setUpdatedAt(java.time.LocalDateTime.now());
        return userRepository.save(newUser);
    }
}

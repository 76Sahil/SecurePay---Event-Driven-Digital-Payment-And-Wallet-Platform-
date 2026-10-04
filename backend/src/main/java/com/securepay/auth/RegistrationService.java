package com.securepay.auth;

import com.securepay.auth.dto.RegisterRequest;
import com.securepay.merchant.Merchant;
import com.securepay.merchant.MerchantRepository;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final KeycloakRegistrationService keycloakService;
    private final MerchantRepository merchantRepository;

    public RegistrationService(
            UserRepository userRepository,
            KeycloakRegistrationService keycloakService) {
        this(userRepository, keycloakService, null);
    }

    @Autowired
    public RegistrationService(
            UserRepository userRepository,
            KeycloakRegistrationService keycloakService,
            MerchantRepository merchantRepository) {
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
        this.merchantRepository = merchantRepository;
    }

    @Transactional
    public void register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists");
        }

        String accountType = request.getAccountType()
                .trim().toUpperCase(Locale.ROOT);

        if (!accountType.equals("CUSTOMER")
                && !accountType.equals("MERCHANT")) {
            throw new IllegalArgumentException(
                    "Invalid account type");
        }

        String keycloakUserId = keycloakService.createUser(
                request.getFullName(),
                email,
                request.getPassword()
        );

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setAccountType(accountType);
        user.setKeycloakUserId(keycloakUserId);

        user = userRepository.save(user);

        if ("MERCHANT".equals(accountType)) {
            keycloakService.assignRole(keycloakUserId, "MERCHANT");

            if (merchantRepository != null) {
                Merchant merchant = new Merchant();
                merchant.setUser(user);
                merchant.setMerchantId("MER-" + (10000 + user.getId()));
                merchant.setBusinessName(user.getFullName() + " Store");
                merchant.setLegalName(user.getFullName() + " Private Limited");
                merchant.setEmail(user.getEmail());
                merchant.setPhone(user.getPhoneNumber() != null ? user.getPhoneNumber() : "+91 98765 43210");
                merchant.setMerchantType("BUSINESS");
                merchant.setAccountStatus("ACTIVE");
                merchant.setVerificationStatus("VERIFIED");
                merchant.setSettlementCurrency("INR");
                merchantRepository.save(merchant);
            }
        }
    }
}

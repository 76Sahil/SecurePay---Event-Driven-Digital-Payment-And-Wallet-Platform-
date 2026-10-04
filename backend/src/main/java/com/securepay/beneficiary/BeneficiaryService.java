package com.securepay.beneficiary;

import com.securepay.beneficiary.dto.CreateBeneficiaryRequest;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
import com.securepay.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            UserRepository userRepository) {
        this(beneficiaryRepository, userRepository, null);
    }

    @Autowired
    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            UserRepository userRepository,
            UserService userService) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyBeneficiaries(String keycloakUserId) {
        return getMyBeneficiaries(keycloakUserId, null, null);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyBeneficiaries(String keycloakUserId, String email, String fullName) {
        User owner = getCustomer(keycloakUserId, email, fullName);
        return beneficiaryRepository.findByOwnerOrderByCreatedAtDesc(owner)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMyBeneficiary(String keycloakUserId, Long beneficiaryId) {
        return getMyBeneficiary(keycloakUserId, null, null, beneficiaryId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMyBeneficiary(String keycloakUserId, String email, String fullName, Long beneficiaryId) {
        User owner = getCustomer(keycloakUserId, email, fullName);
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndOwner(beneficiaryId, owner)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found."));
        return toResponse(beneficiary);
    }

    @Transactional
    public Map<String, Object> addBeneficiary(
            String keycloakUserId,
            CreateBeneficiaryRequest request) {
        return addBeneficiary(keycloakUserId, null, null, request);
    }

    @Transactional
    public Map<String, Object> addBeneficiary(
            String keycloakUserId,
            String email,
            String fullName,
            CreateBeneficiaryRequest request) {
        User owner = getCustomer(keycloakUserId, email, fullName);
        String recipientEmail = request.getRecipientEmail().trim().toLowerCase(Locale.ROOT);
        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Recipient must have a registered SecurePay account."));

        if (!"CUSTOMER".equalsIgnoreCase(recipient.getAccountType())) {
            throw new IllegalArgumentException("This account cannot be added as a customer beneficiary.");
        }
        if (owner.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("You cannot add your own account as a beneficiary.");
        }
        if (beneficiaryRepository.existsByOwnerAndRecipient(owner, recipient)) {
            throw new IllegalArgumentException("This customer is already in your beneficiaries.");
        }

        String accountNumber = request.getAccountNumber().trim();
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setOwner(owner);
        beneficiary.setRecipient(recipient);
        beneficiary.setName(request.getName().trim());
        beneficiary.setBankName(request.getBankName().trim());
        beneficiary.setAccountLastFour(accountNumber.substring(accountNumber.length() - 4));
        beneficiary.setStatus("ACTIVE");

        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    private User getCustomer(String keycloakUserId, String email, String fullName) {
        User user = findOrProvisionUser(keycloakUserId, email, fullName);
        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException("Beneficiaries are available only for customer accounts.");
        }
        return user;
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

    private Map<String, Object> toResponse(Beneficiary beneficiary) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", beneficiary.getId().toString());
        response.put("name", beneficiary.getName());
        response.put("bankName", beneficiary.getBankName());
        response.put("accountIdentifier", "•••• " + beneficiary.getAccountLastFour());
        response.put("recipientEmail", beneficiary.getRecipient().getEmail());
        response.put("status", beneficiary.getStatus());
        response.put("createdAt", beneficiary.getCreatedAt().toString());
        return response;
    }
}

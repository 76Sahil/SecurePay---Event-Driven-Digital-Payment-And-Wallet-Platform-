package com.securepay.beneficiary;

import com.securepay.beneficiary.dto.CreateBeneficiaryRequest;
import com.securepay.user.User;
import com.securepay.user.UserRepository;
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

    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            UserRepository userRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.userRepository = userRepository;
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
            throw new IllegalArgumentException("Only SecurePay customer accounts can be added as beneficiaries.");
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

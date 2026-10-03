package com.securepay.service;

import com.securepay.dto.CreateBeneficiaryRequest;
import com.securepay.entity.Beneficiary;
import com.securepay.entity.User;
import com.securepay.repository.BeneficiaryRepository;
import com.securepay.repository.UserRepository;
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
        User owner = getCustomer(keycloakUserId);
        return beneficiaryRepository.findByOwnerOrderByCreatedAtDesc(owner)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMyBeneficiary(String keycloakUserId, Long beneficiaryId) {
        User owner = getCustomer(keycloakUserId);
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndOwner(beneficiaryId, owner)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found."));
        return toResponse(beneficiary);
    }

    @Transactional
    public Map<String, Object> addBeneficiary(
            String keycloakUserId,
            CreateBeneficiaryRequest request) {
        User owner = getCustomer(keycloakUserId);
        String email = request.getRecipientEmail().trim().toLowerCase(Locale.ROOT);
        User recipient = userRepository.findByEmail(email)
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
        // Demo project: this is an internal SecurePay wallet recipient, not an external bank transfer.
        beneficiary.setStatus("ACTIVE");

        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    private User getCustomer(String keycloakUserId) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found."));
        if (!"CUSTOMER".equalsIgnoreCase(user.getAccountType())) {
            throw new IllegalArgumentException("Beneficiaries are available only for customer accounts.");
        }
        return user;
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

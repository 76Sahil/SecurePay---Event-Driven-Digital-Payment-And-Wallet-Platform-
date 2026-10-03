package com.securepay.repository;

import com.securepay.entity.Beneficiary;
import com.securepay.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByOwnerOrderByCreatedAtDesc(User owner);
    Optional<Beneficiary> findByIdAndOwner(Long id, User owner);
    boolean existsByOwnerAndRecipient(User owner, User recipient);
}

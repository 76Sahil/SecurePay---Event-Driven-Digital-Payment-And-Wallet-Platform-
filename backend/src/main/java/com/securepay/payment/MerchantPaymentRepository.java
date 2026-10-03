package com.securepay.payment;

import com.securepay.merchant.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MerchantPaymentRepository extends JpaRepository<MerchantPayment, Long> {

    List<MerchantPayment> findByMerchantOrderByCreatedAtDesc(Merchant merchant);

    Optional<MerchantPayment> findByReference(String reference);

    Optional<MerchantPayment> findByIdAndMerchant(Long id, Merchant merchant);

    Optional<MerchantPayment> findByReferenceAndMerchant(String reference, Merchant merchant);
}

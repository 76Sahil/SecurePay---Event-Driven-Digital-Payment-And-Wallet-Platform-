package com.securepay.payment;

import com.securepay.merchant.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MerchantRefundRepository extends JpaRepository<MerchantRefund, Long> {

    List<MerchantRefund> findByMerchantOrderByCreatedAtDesc(Merchant merchant);

    Optional<MerchantRefund> findByReference(String reference);
}

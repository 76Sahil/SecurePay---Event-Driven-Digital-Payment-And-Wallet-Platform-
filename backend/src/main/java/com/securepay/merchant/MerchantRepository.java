package com.securepay.merchant;

import com.securepay.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MerchantRepository extends JpaRepository<Merchant, Long> {

    Optional<Merchant> findByUser(User user);

    Optional<Merchant> findByMerchantId(String merchantId);
}

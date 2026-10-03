package com.securepay.merchant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MerchantApiKeyRepository extends JpaRepository<MerchantApiKey, Long> {

    List<MerchantApiKey> findByMerchantOrderByCreatedAtDesc(Merchant merchant);

    Optional<MerchantApiKey> findByMerchantAndKeyId(Merchant merchant, String keyId);

    Optional<MerchantApiKey> findByHashedKeyAndStatus(String hashedKey, String status);
}

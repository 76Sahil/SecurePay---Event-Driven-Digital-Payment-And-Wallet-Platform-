
package com.securepay.repository;

import com.securepay.entity.Wallet;
import com.securepay.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUser(User user);

    Optional<Wallet> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
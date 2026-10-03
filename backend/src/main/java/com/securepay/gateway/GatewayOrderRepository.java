package com.securepay.gateway;

import com.securepay.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GatewayOrderRepository extends JpaRepository<GatewayOrder, Long> {

    Optional<GatewayOrder> findByOrderId(String orderId);

    List<GatewayOrder> findByUserOrderByCreatedAtDesc(User user);
}

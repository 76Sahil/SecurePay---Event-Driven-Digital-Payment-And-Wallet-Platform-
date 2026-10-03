package com.securepay.saga;

import com.securepay.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SagaInstanceRepository extends JpaRepository<SagaInstance, Long> {

    Optional<SagaInstance> findBySagaId(String sagaId);

    List<SagaInstance> findByUserOrderByCreatedAtDesc(User user);
}

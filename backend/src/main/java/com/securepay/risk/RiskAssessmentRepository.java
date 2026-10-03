package com.securepay.risk;

import com.securepay.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {

    List<RiskAssessment> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndCreatedAtAfter(User user, LocalDateTime since);
}

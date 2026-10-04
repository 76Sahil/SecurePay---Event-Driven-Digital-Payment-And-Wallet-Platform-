package com.securepay.risk;

import com.securepay.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {

    List<RiskAssessment> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndCreatedAtAfter(User user, LocalDateTime since);

    List<RiskAssessment> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT r FROM RiskAssessment r LEFT JOIN FETCH r.user WHERE r.decision IN :decisions ORDER BY r.createdAt DESC")
    List<RiskAssessment> findByDecisionInOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("decisions") List<RiskDecision> decisions);
}

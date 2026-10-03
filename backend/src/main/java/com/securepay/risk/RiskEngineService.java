package com.securepay.risk;

import com.securepay.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RiskEngineService {

    private static final Logger log = LoggerFactory.getLogger(RiskEngineService.class);

    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("50000.00");
    private static final BigDecimal ELEVATED_VALUE_THRESHOLD = new BigDecimal("20000.00");
    private static final int VELOCITY_WINDOW_SECONDS = 60;

    private final RiskAssessmentRepository riskAssessmentRepository;

    public RiskEngineService(RiskAssessmentRepository riskAssessmentRepository) {
        this.riskAssessmentRepository = riskAssessmentRepository;
    }

    @Transactional
    public RiskAssessment assessTransaction(User user, BigDecimal amount) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        // Rule 1: Account status check
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            score = 100;
            reasons.add("Account is locked or suspended (" + user.getStatus() + ")");
        }

        // Rule 2: High transaction amount check
        if (amount.compareTo(HIGH_VALUE_THRESHOLD) > 0) {
            score += 45;
            reasons.add("Transfer amount exceeds INR 50,000 threshold");
        } else if (amount.compareTo(ELEVATED_VALUE_THRESHOLD) > 0) {
            score += 20;
            reasons.add("Transfer amount is elevated (above INR 20,000)");
        }

        // Rule 3: Velocity check (transfers within the last 60 seconds)
        LocalDateTime windowStart = LocalDateTime.now().minusSeconds(VELOCITY_WINDOW_SECONDS);
        long recentAssessments = riskAssessmentRepository.countByUserAndCreatedAtAfter(user, windowStart);

        if (recentAssessments >= 5) {
            score += 60;
            reasons.add("Extreme transaction frequency: " + recentAssessments + " attempts in past 60s");
        } else if (recentAssessments >= 3) {
            score += 30;
            reasons.add("High transaction velocity: " + recentAssessments + " attempts in past 60s");
        }

        // Clamp score between 0 and 100
        score = Math.min(100, Math.max(0, score));

        RiskDecision decision;
        if (score >= 70) {
            decision = RiskDecision.BLOCKED;
        } else if (score >= 40) {
            decision = RiskDecision.FLAGGED;
        } else {
            decision = RiskDecision.ALLOWED;
        }

        RiskAssessment assessment = new RiskAssessment();
        assessment.setUser(user);
        assessment.setRiskScore(score);
        assessment.setDecision(decision);
        assessment.setReasons(reasons.isEmpty() ? "Standard low-risk transaction" : String.join("; ", reasons));

        RiskAssessment saved = riskAssessmentRepository.save(assessment);
        log.info("Risk assessment for user {} (amount {}): score={}, decision={}",
                user.getEmail(), amount, score, decision);

        return saved;
    }
}

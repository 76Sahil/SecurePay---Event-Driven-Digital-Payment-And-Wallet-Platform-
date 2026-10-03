package com.securepay.risk;

import com.securepay.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RiskEngineServiceTest {

    @Mock
    private RiskAssessmentRepository riskAssessmentRepository;

    private RiskEngineService riskEngineService;

    private User activeUser;
    private User lockedUser;

    @BeforeEach
    void setUp() {
        riskEngineService = new RiskEngineService(riskAssessmentRepository);

        activeUser = new User();
        activeUser.setId(10L);
        activeUser.setEmail("active@example.com");
        activeUser.setStatus("ACTIVE");

        lockedUser = new User();
        lockedUser.setId(20L);
        lockedUser.setEmail("locked@example.com");
        lockedUser.setStatus("LOCKED");

        when(riskAssessmentRepository.save(any(RiskAssessment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Should ALLOW low-value transaction for active user with low velocity")
    void shouldAllowLowValueTransaction() {
        when(riskAssessmentRepository.countByUserAndCreatedAtAfter(eq(activeUser), any(LocalDateTime.class)))
                .thenReturn(0L);

        RiskAssessment assessment = riskEngineService.assessTransaction(activeUser, new BigDecimal("500.00"));

        assertThat(assessment.getDecision()).isEqualTo(RiskDecision.ALLOWED);
        assertThat(assessment.getRiskScore()).isEqualTo(0);
        verify(riskAssessmentRepository).save(any(RiskAssessment.class));
    }

    @Test
    @DisplayName("Should FLAG high-value transaction exceeding INR 50,000 threshold")
    void shouldFlagHighValueTransaction() {
        when(riskAssessmentRepository.countByUserAndCreatedAtAfter(eq(activeUser), any(LocalDateTime.class)))
                .thenReturn(0L);

        RiskAssessment assessment = riskEngineService.assessTransaction(activeUser, new BigDecimal("60000.00"));

        assertThat(assessment.getDecision()).isEqualTo(RiskDecision.FLAGGED);
        assertThat(assessment.getRiskScore()).isGreaterThanOrEqualTo(40);
        assertThat(assessment.getReasons()).contains("exceeds INR 50,000");
    }

    @Test
    @DisplayName("Should BLOCK transaction if user account is LOCKED")
    void shouldBlockLockedUserTransaction() {
        when(riskAssessmentRepository.countByUserAndCreatedAtAfter(eq(lockedUser), any(LocalDateTime.class)))
                .thenReturn(0L);

        RiskAssessment assessment = riskEngineService.assessTransaction(lockedUser, new BigDecimal("100.00"));

        assertThat(assessment.getDecision()).isEqualTo(RiskDecision.BLOCKED);
        assertThat(assessment.getRiskScore()).isEqualTo(100);
        assertThat(assessment.getReasons()).contains("Account is locked or suspended");
    }

    @Test
    @DisplayName("Should BLOCK transaction when high velocity (5+ attempts in 60s) is detected")
    void shouldBlockHighVelocityTransaction() {
        when(riskAssessmentRepository.countByUserAndCreatedAtAfter(eq(activeUser), any(LocalDateTime.class)))
                .thenReturn(5L);

        // 60 points for velocity + 20 points for elevated amount (>20000) = 80 -> BLOCKED (>= 70)
        RiskAssessment assessment = riskEngineService.assessTransaction(activeUser, new BigDecimal("25000.00"));

        assertThat(assessment.getDecision()).isEqualTo(RiskDecision.BLOCKED);
        assertThat(assessment.getRiskScore()).isGreaterThanOrEqualTo(70);
        assertThat(assessment.getReasons()).contains("Extreme transaction frequency");
    }
}

package com.securepay.audit;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityAuditServiceTest {

    @Mock
    private SecurityAuditEventRepository auditRepository;

    @Mock
    private UserRepository userRepository;

    private SecurityAuditService auditService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        auditService = new SecurityAuditService(auditRepository, userRepository);

        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("audit-user@example.com");
    }

    @Test
    @DisplayName("Should successfully record audit event")
    void shouldRecordAuditEvent() {
        when(auditRepository.save(any(SecurityAuditEvent.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SecurityAuditEvent event = auditService.recordEvent(
                "LOGIN_SUCCESS",
                sampleUser,
                SecurityAuditSeverity.INFO,
                "127.0.0.1",
                "Mozilla/5.0",
                "User logged in"
        );

        assertThat(event.getEventType()).isEqualTo("LOGIN_SUCCESS");
        assertThat(event.getUser()).isEqualTo(sampleUser);
        assertThat(event.getSeverity()).isEqualTo(SecurityAuditSeverity.INFO);
        assertThat(event.getIpAddress()).isEqualTo("127.0.0.1");
        verify(auditRepository).save(any(SecurityAuditEvent.class));
    }

    @Test
    @DisplayName("Should retrieve recent events formatted for response")
    void shouldGetRecentEvents() {
        SecurityAuditEvent event = new SecurityAuditEvent();
        event.setEventType("TRANSFER_BLOCKED");
        event.setUser(sampleUser);
        event.setSeverity(SecurityAuditSeverity.CRITICAL);
        event.setIpAddress("192.168.1.1");
        event.setDetails("Blocked high risk");

        when(auditRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(List.of(event));

        List<Map<String, Object>> results = auditService.getRecentEvents(10);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).get("eventType")).isEqualTo("TRANSFER_BLOCKED");
        assertThat(results.get(0).get("severity")).isEqualTo("CRITICAL");
        assertThat(results.get(0).get("actor")).isEqualTo("audit-user@example.com");
    }

    @Test
    @DisplayName("Should compute aggregated security metrics")
    void shouldGetSecurityMetrics() {
        when(auditRepository.countByEventType("LOGIN_FAILURE")).thenReturn(3L);
        when(auditRepository.countByEventType("TRANSFER_BLOCKED")).thenReturn(2L);
        when(userRepository.countByStatus("LOCKED")).thenReturn(1L);
        when(auditRepository.countBySeverity(SecurityAuditSeverity.CRITICAL)).thenReturn(2L);
        when(auditRepository.countBySeverity(SecurityAuditSeverity.WARN)).thenReturn(4L);

        Map<String, Object> metrics = auditService.getSecurityMetrics();

        assertThat(metrics.get("failedLogins")).isEqualTo(3L);
        assertThat(metrics.get("suspiciousTransactions")).isEqualTo(2L);
        assertThat(metrics.get("lockedAccounts")).isEqualTo(1L);
        assertThat(metrics.get("criticalAlerts")).isEqualTo(2L);
        assertThat(metrics.get("systemHealth")).isEqualTo("ATTENTION_REQUIRED");
    }
}

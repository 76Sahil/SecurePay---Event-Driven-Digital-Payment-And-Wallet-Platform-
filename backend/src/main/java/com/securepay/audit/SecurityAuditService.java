package com.securepay.audit;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SecurityAuditService {

    private static final Logger log = LoggerFactory.getLogger(SecurityAuditService.class);

    private final SecurityAuditEventRepository auditRepository;
    private final UserRepository userRepository;

    public SecurityAuditService(
            SecurityAuditEventRepository auditRepository,
            UserRepository userRepository) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SecurityAuditEvent recordEvent(
            String eventType,
            User user,
            SecurityAuditSeverity severity,
            String ipAddress,
            String userAgent,
            String details) {

        SecurityAuditEvent event = new SecurityAuditEvent();
        event.setEventType(eventType);
        event.setUser(user);
        event.setSeverity(severity != null ? severity : SecurityAuditSeverity.INFO);
        event.setIpAddress(ipAddress);
        event.setUserAgent(userAgent);
        event.setDetails(details);

        SecurityAuditEvent saved = auditRepository.save(event);
        log.info("SECURITY AUDIT: [{}] severity={} user={} details={}",
                eventType, severity, user != null ? user.getEmail() : "anonymous", details);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentEvents(int limit) {
        int safeLimit = Math.max(1, Math.min(100, limit));
        return auditRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(event -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", String.valueOf(event.getId()));
                    map.put("eventType", event.getEventType());
                    map.put("userEmail", event.getUser() != null ? event.getUser().getEmail() : "system");
                    map.put("actor", event.getUser() != null ? event.getUser().getEmail() : "system");
                    map.put("severity", event.getSeverity().name());
                    map.put("description", event.getDetails() != null ? event.getDetails() : event.getEventType());
                    map.put("status", "OPEN");
                    map.put("ipAddress", event.getIpAddress());
                    map.put("details", event.getDetails());
                    map.put("createdAt", event.getCreatedAt().toString());
                    return map;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSecurityMetrics() {
        long totalFailedLogins = auditRepository.countByEventType("LOGIN_FAILURE");
        long totalBlockedTransfers = auditRepository.countByEventType("TRANSFER_BLOCKED");
        long lockedAccounts = userRepository.countByStatus("LOCKED");
        long criticalAlerts = auditRepository.countBySeverity(SecurityAuditSeverity.CRITICAL);
        long warningAlerts = auditRepository.countBySeverity(SecurityAuditSeverity.WARN);

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("failedLogins", totalFailedLogins);
        metrics.put("totalFailedLogins", totalFailedLogins);
        metrics.put("suspiciousTransactions", totalBlockedTransfers);
        metrics.put("totalBlockedTransfers", totalBlockedTransfers);
        metrics.put("lockedAccounts", lockedAccounts);
        metrics.put("openFraudAlerts", criticalAlerts + warningAlerts);
        metrics.put("criticalAlerts", criticalAlerts);
        metrics.put("warningAlerts", warningAlerts);
        metrics.put("systemHealth", criticalAlerts > 0 ? "ATTENTION_REQUIRED" : "NORMAL");

        return metrics;
    }
}

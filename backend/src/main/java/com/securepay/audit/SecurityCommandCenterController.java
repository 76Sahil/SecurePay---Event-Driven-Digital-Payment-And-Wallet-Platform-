package com.securepay.audit;

import com.securepay.user.User;
import com.securepay.user.UserService;
import com.securepay.risk.RiskAssessment;
import com.securepay.risk.RiskAssessmentRepository;
import com.securepay.risk.RiskDecision;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/security")
@PreAuthorize("hasRole('ADMIN')")
public class SecurityCommandCenterController {

    private final SecurityAuditService auditService;
    private final UserService userService;

    @Autowired(required = false)
    private RiskAssessmentRepository riskAssessmentRepository;

    public SecurityCommandCenterController(
            SecurityAuditService auditService,
            UserService userService) {
        this.auditService = auditService;
        this.userService = userService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(auditService.getSecurityMetrics());
    }

    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getRecentEvents(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(auditService.getRecentEvents(limit));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<Map<String, Object>> users = userService.getAllUsers().stream()
                .map(user -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", "USR-" + user.getId());
                    map.put("userId", user.getId());
                    map.put("name", user.getFullName());
                    map.put("email", user.getEmail());
                    map.put("role", user.getAccountType());
                    map.put("accountStatus", user.getStatus());
                    map.put("verificationStatus", user.getKycStatus() != null ? user.getKycStatus() : "PENDING");
                    map.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
                    map.put("createdAt", user.getCreatedAt().toString());
                    return map;
                })
                .toList();

        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{id}/lock")
    public ResponseEntity<Map<String, Object>> lockUser(@PathVariable Long id) {
        userService.lockUser(id);
        User user = userService.getUserById(id);

        auditService.recordEvent(
                "ACCOUNT_LOCKED",
                user,
                SecurityAuditSeverity.WARN,
                null,
                null,
                "User account locked by administrator action."
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "User account locked successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/{id}/unlock")
    public ResponseEntity<Map<String, Object>> unlockUser(@PathVariable Long id) {
        userService.unlockUser(id);
        User user = userService.getUserById(id);

        auditService.recordEvent(
                "ACCOUNT_UNLOCKED",
                user,
                SecurityAuditSeverity.INFO,
                null,
                null,
                "User account unlocked by administrator action."
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "User account unlocked successfully.");
        return ResponseEntity.ok(response);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/fraud-alerts")
    public ResponseEntity<List<Map<String, Object>>> getFraudAlerts() {
        List<Map<String, Object>> alerts = new java.util.ArrayList<>();

        if (riskAssessmentRepository != null) {
            List<RiskAssessment> risks = riskAssessmentRepository.findByDecisionInOrderByCreatedAtDesc(
                    List.of(RiskDecision.BLOCKED, RiskDecision.FLAGGED)
            );
            for (RiskAssessment ra : risks) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", "FRD-" + ra.getId());
                map.put("transactionReference", ra.getTransactionId() != null ? "TXN-" + ra.getTransactionId() : "RISK-EVAL-" + ra.getId());
                map.put("customerName", ra.getUser() != null ? ra.getUser().getFullName() + " (" + ra.getUser().getEmail() + ")" : "Flagged User");
                map.put("userEmail", ra.getUser() != null ? ra.getUser().getEmail() : "system");
                map.put("amount", 0);
                map.put("currency", "INR");
                map.put("riskScore", ra.getRiskScore());
                map.put("reason", ra.getReasons() != null ? ra.getReasons() : "Risk rule triggered");
                map.put("severity", ra.getDecision() == RiskDecision.BLOCKED ? "CRITICAL" : "HIGH");
                map.put("status", "OPEN");
                map.put("createdAt", ra.getCreatedAt().toString());
                alerts.add(map);
            }
        }

        List<Map<String, Object>> events = auditService.getRecentEvents(50);
        for (Map<String, Object> ev : events) {
            String type = String.valueOf(ev.getOrDefault("eventType", ""));
            String sev = String.valueOf(ev.getOrDefault("severity", ""));
            if ("CRITICAL".equalsIgnoreCase(sev) || "WARN".equalsIgnoreCase(sev) || type.contains("BLOCKED") || type.contains("FRAUD") || type.contains("SUSPICIOUS")) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", "SEC-" + ev.get("id"));
                map.put("transactionReference", "TXN-SEC-" + ev.get("id"));
                map.put("customerName", ev.get("actor") != null ? (String) ev.get("actor") : (String) ev.get("userEmail"));
                map.put("userEmail", ev.get("userEmail"));
                map.put("amount", 0);
                map.put("currency", "INR");
                map.put("riskScore", "CRITICAL".equalsIgnoreCase(sev) ? 95 : 65);
                map.put("reason", ev.get("description") != null ? ev.get("description") : ev.get("details"));
                map.put("severity", "CRITICAL".equalsIgnoreCase(sev) ? "CRITICAL" : "HIGH");
                map.put("status", "OPEN");
                map.put("createdAt", ev.get("createdAt"));
                alerts.add(map);
            }
        }

        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/fraud-alerts/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolveAlert(@PathVariable String id) {
        auditService.recordEvent(
                "FRAUD_ALERT_RESOLVED",
                null,
                SecurityAuditSeverity.INFO,
                null,
                null,
                "Fraud alert " + id + " marked as resolved by administrator."
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("alertId", id);
        response.put("message", "Alert resolved successfully.");
        return ResponseEntity.ok(response);
    }
}


package com.securepay.audit;

import com.securepay.user.User;
import com.securepay.user.UserService;
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
}

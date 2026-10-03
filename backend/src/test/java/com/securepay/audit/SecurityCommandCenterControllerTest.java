package com.securepay.audit;

import com.securepay.user.User;
import com.securepay.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SecurityCommandCenterControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityAuditService auditService;

    @Mock
    private UserService userService;

    @InjectMocks
    private SecurityCommandCenterController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/admin/security/metrics should return 200 and metrics payload")
    void shouldReturnSecurityMetrics() throws Exception {
        when(auditService.getSecurityMetrics()).thenReturn(Map.of("failedLogins", 5L, "systemHealth", "NORMAL"));

        mockMvc.perform(get("/api/admin/security/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.failedLogins").value(5))
                .andExpect(jsonPath("$.systemHealth").value("NORMAL"));
    }

    @Test
    @DisplayName("GET /api/admin/security/events should return 200 and events list")
    void shouldReturnRecentEvents() throws Exception {
        Map<String, Object> event = Map.of(
                "id", "1",
                "eventType", "SUSPICIOUS_LOGIN",
                "severity", "HIGH"
        );
        when(auditService.getRecentEvents(50)).thenReturn(List.of(event));

        mockMvc.perform(get("/api/admin/security/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventType").value("SUSPICIOUS_LOGIN"));
    }

    @Test
    @DisplayName("POST /api/admin/security/users/{id}/lock should lock user and record audit event")
    void shouldLockUser() throws Exception {
        User user = new User();
        user.setId(5L);
        user.setEmail("target@example.com");

        when(userService.getUserById(5L)).thenReturn(user);

        mockMvc.perform(post("/api/admin/security/users/5/lock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        verify(userService).lockUser(5L);
        verify(auditService).recordEvent(eq("ACCOUNT_LOCKED"), eq(user), eq(SecurityAuditSeverity.WARN), isNull(), isNull(), anyString());
    }

    @Test
    @DisplayName("POST /api/admin/security/users/{id}/unlock should unlock user and record audit event")
    void shouldUnlockUser() throws Exception {
        User user = new User();
        user.setId(5L);
        user.setEmail("target@example.com");

        when(userService.getUserById(5L)).thenReturn(user);

        mockMvc.perform(post("/api/admin/security/users/5/unlock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        verify(userService).unlockUser(5L);
        verify(auditService).recordEvent(eq("ACCOUNT_UNLOCKED"), eq(user), eq(SecurityAuditSeverity.INFO), isNull(), isNull(), anyString());
    }
}

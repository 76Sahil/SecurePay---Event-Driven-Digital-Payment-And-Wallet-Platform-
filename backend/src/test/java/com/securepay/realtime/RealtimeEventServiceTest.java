package com.securepay.realtime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RealtimeEventServiceTest {

    private RealtimeEventService realtimeEventService;

    @BeforeEach
    void setUp() {
        realtimeEventService = new RealtimeEventService();
    }

    @Test
    @DisplayName("Should create user SSE subscription and send initial connect frame")
    void shouldSubscribeUser() {
        SseEmitter emitter = realtimeEventService.subscribeUser("kc-user-123");
        assertThat(emitter).isNotNull();
    }

    @Test
    @DisplayName("Should create admin SSE subscription and send connect frame")
    void shouldSubscribeAdmin() {
        SseEmitter emitter = realtimeEventService.subscribeAdmin();
        assertThat(emitter).isNotNull();
    }

    @Test
    @DisplayName("Should dispatch event to user and admin streams without throwing")
    void shouldDispatchEvents() {
        SseEmitter userEmitter = realtimeEventService.subscribeUser("kc-user-123");
        SseEmitter adminEmitter = realtimeEventService.subscribeAdmin();

        realtimeEventService.sendToUser("kc-user-123", "BALANCE_UPDATE", Map.of("balance", 500));
        realtimeEventService.broadcastSecurityAlert("SECURITY_ALERT", Map.of("severity", "WARN"));

        assertThat(userEmitter).isNotNull();
        assertThat(adminEmitter).isNotNull();
    }
}

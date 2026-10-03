package com.securepay.realtime;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/realtime")
public class RealtimeEventController {

    private final RealtimeEventService realtimeEventService;

    public RealtimeEventController(RealtimeEventService realtimeEventService) {
        this.realtimeEventService = realtimeEventService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("isAuthenticated()")
    public SseEmitter streamUserEvents(@AuthenticationPrincipal Jwt jwt) {
        return realtimeEventService.subscribeUser(jwt.getSubject());
    }

    @GetMapping(value = "/admin-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public SseEmitter streamAdminEvents() {
        return realtimeEventService.subscribeAdmin();
    }
}

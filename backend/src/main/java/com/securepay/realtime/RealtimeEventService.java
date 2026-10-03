package com.securepay.realtime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class RealtimeEventService {

    private static final Logger log = LoggerFactory.getLogger(RealtimeEventService.class);
    private static final Long EMITTER_TIMEOUT = 300_000L; // 5 minutes

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribeUser(String keycloakUserId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);

        userEmitters.computeIfAbsent(keycloakUserId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeUserEmitter(keycloakUserId, emitter));
        emitter.onTimeout(() -> removeUserEmitter(keycloakUserId, emitter));
        emitter.onError(e -> removeUserEmitter(keycloakUserId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("{\"status\":\"CONNECTED\",\"userId\":\"" + keycloakUserId + "\"}"));
        } catch (IOException e) {
            removeUserEmitter(keycloakUserId, emitter);
        }

        return emitter;
    }

    public SseEmitter subscribeAdmin() {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);
        adminEmitters.add(emitter);

        emitter.onCompletion(() -> adminEmitters.remove(emitter));
        emitter.onTimeout(() -> adminEmitters.remove(emitter));
        emitter.onError(e -> adminEmitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("ADMIN_CONNECTED")
                    .data("{\"status\":\"CONNECTED\",\"channel\":\"ADMIN_SECURITY_FEED\"}"));
        } catch (IOException e) {
            adminEmitters.remove(emitter);
        }

        return emitter;
    }

    public void sendToUser(String keycloakUserId, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(keycloakUserId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                removeUserEmitter(keycloakUserId, emitter);
            }
        }
    }

    public void broadcastSecurityAlert(String eventName, Object data) {
        for (SseEmitter emitter : adminEmitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                adminEmitters.remove(emitter);
            }
        }
    }

    private void removeUserEmitter(String keycloakUserId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(keycloakUserId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(keycloakUserId);
            }
        }
    }
}

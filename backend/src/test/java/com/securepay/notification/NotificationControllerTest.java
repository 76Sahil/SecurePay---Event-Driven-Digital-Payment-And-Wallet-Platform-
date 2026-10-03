package com.securepay.notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController controller;

    @BeforeEach
    void setUp() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn("test-user-sub");

        HandlerMethodArgumentResolver jwtResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                        && parameter.getParameterType().isAssignableFrom(Jwt.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return jwt;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(jwtResolver)
                .build();
    }

    @Test
    @DisplayName("GET /api/notifications should return 200 and list of notifications")
    void shouldReturnNotifications() throws Exception {
        Map<String, Object> item = Map.of(
                "id", "1",
                "title", "Welcome",
                "status", "UNREAD"
        );
        when(notificationService.getNotificationsForUser("test-user-sub")).thenReturn(List.of(item));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Welcome"))
                .andExpect(jsonPath("$[0].status").value("UNREAD"));
    }

    @Test
    @DisplayName("POST /api/notifications/{id}/read should return 200 OK")
    void shouldMarkAsRead() throws Exception {
        when(notificationService.markAsRead("test-user-sub", 1L))
                .thenReturn(Map.of("notificationId", "1", "status", "READ"));

        mockMvc.perform(post("/api/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));
    }

    @Test
    @DisplayName("GET /api/notifications/unread-count should return 200 OK and count")
    void shouldReturnUnreadCount() throws Exception {
        when(notificationService.getUnreadCount("test-user-sub"))
                .thenReturn(Map.of("unreadCount", 3L));

        mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(3));
    }
}

package com.securepay.notification;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User sampleUser;
    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("notify@example.com");
        sampleUser.setKeycloakUserId("kc-user-10");

        sampleNotification = new Notification();
        sampleNotification.setId(100L);
        sampleNotification.setUser(sampleUser);
        sampleNotification.setTitle("Transfer Received");
        sampleNotification.setMessage("Received INR 500");
        sampleNotification.setType("TRANSACTION");
        sampleNotification.setStatus("UNREAD");
    }

    @Test
    @DisplayName("Should retrieve notifications for user")
    void shouldGetNotificationsForUser() {
        when(userRepository.findByKeycloakUserId("kc-user-10")).thenReturn(Optional.of(sampleUser));
        when(notificationRepository.findByUserOrderByCreatedAtDesc(sampleUser))
                .thenReturn(List.of(sampleNotification));

        List<Map<String, Object>> result = notificationService.getNotificationsForUser("kc-user-10");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).get("title")).isEqualTo("Transfer Received");
        assertThat(result.get(0).get("status")).isEqualTo("UNREAD");
    }

    @Test
    @DisplayName("Should mark notification as READ")
    void shouldMarkAsRead() {
        when(userRepository.findByKeycloakUserId("kc-user-10")).thenReturn(Optional.of(sampleUser));
        when(notificationRepository.findByIdAndUser(100L, sampleUser))
                .thenReturn(Optional.of(sampleNotification));

        Map<String, Object> result = notificationService.markAsRead("kc-user-10", 100L);

        assertThat(result.get("status")).isEqualTo("READ");
        assertThat(sampleNotification.getStatus()).isEqualTo("READ");
        verify(notificationRepository).save(sampleNotification);
    }

    @Test
    @DisplayName("Should retrieve unread notification count")
    void shouldGetUnreadCount() {
        when(userRepository.findByKeycloakUserId("kc-user-10")).thenReturn(Optional.of(sampleUser));
        when(notificationRepository.countByUserAndStatus(sampleUser, "UNREAD")).thenReturn(5L);

        Map<String, Object> result = notificationService.getUnreadCount("kc-user-10");

        assertThat(result.get("unreadCount")).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should create new notification successfully")
    void shouldCreateNotification() {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(i -> i.getArgument(0));

        Notification created = notificationService.createNotification(
                sampleUser,
                "PAYMENT",
                "Payment Received",
                "INR 1000 collected",
                "TX-1",
                "PAY-1"
        );

        assertThat(created.getUser()).isEqualTo(sampleUser);
        assertThat(created.getStatus()).isEqualTo("UNREAD");
        assertThat(created.getType()).isEqualTo("PAYMENT");
        assertThat(created.getTitle()).isEqualTo("Payment Received");
    }
}

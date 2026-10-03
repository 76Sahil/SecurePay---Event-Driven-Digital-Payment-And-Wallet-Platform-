package com.securepay.notification;

import com.securepay.user.User;
import com.securepay.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotificationsForUser(String keycloakUserId) {
        User user = getUser(keycloakUserId);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNotificationById(String keycloakUserId, Long id) {
        User user = getUser(keycloakUserId);
        Notification notification = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        return toResponse(notification);
    }

    @Transactional
    public Map<String, Object> markAsRead(String keycloakUserId, Long id) {
        User user = getUser(keycloakUserId);
        Notification notification = notificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));

        notification.setStatus("READ");
        notificationRepository.save(notification);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("notificationId", String.valueOf(notification.getId()));
        response.put("status", notification.getStatus());
        response.put("action", "MARK_AS_READ");
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUnreadCount(String keycloakUserId) {
        User user = getUser(keycloakUserId);
        long count = notificationRepository.countByUserAndStatus(user, "UNREAD");
        return Map.of("unreadCount", count);
    }

    @Transactional
    public Notification createNotification(
            User user,
            String type,
            String title,
            String message,
            String transactionId,
            String paymentId) {

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type != null ? type : "SYSTEM");
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTransactionId(transactionId);
        notification.setPaymentId(paymentId);
        notification.setStatus("UNREAD");

        return notificationRepository.save(notification);
    }

    private User getUser(String keycloakUserId) {
        java.util.Optional<User> byKeycloak = userRepository.findByKeycloakUserId(keycloakUserId);
        if (byKeycloak.isPresent()) {
            return byKeycloak.get();
        }

        String safeEmail = keycloakUserId.contains("@") ? keycloakUserId.trim().toLowerCase(java.util.Locale.ROOT) : null;
        if (safeEmail != null) {
            java.util.Optional<User> byEmail = userRepository.findByEmail(safeEmail);
            if (byEmail.isPresent()) {
                User existing = byEmail.get();
                existing.setKeycloakUserId(keycloakUserId);
                existing.setUpdatedAt(java.time.LocalDateTime.now());
                return userRepository.save(existing);
            }
        }

        User newUser = new User();
        newUser.setKeycloakUserId(keycloakUserId);
        newUser.setEmail(safeEmail != null ? safeEmail : keycloakUserId + "@securepay.local");
        newUser.setFullName(safeEmail != null ? safeEmail.split("@")[0] : "Customer");
        newUser.setAccountType("CUSTOMER");
        newUser.setStatus("ACTIVE");
        newUser.setKycStatus("VERIFIED");
        newUser.setUpdatedAt(java.time.LocalDateTime.now());
        return userRepository.save(newUser);
    }

    private Map<String, Object> toResponse(Notification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", String.valueOf(n.getId()));
        map.put("type", n.getType());
        map.put("status", n.getStatus());
        map.put("title", n.getTitle());
        map.put("message", n.getMessage());
        map.put("createdAt", n.getCreatedAt().toString());
        if (n.getTransactionId() != null) map.put("transactionId", n.getTransactionId());
        if (n.getPaymentId() != null) map.put("paymentId", n.getPaymentId());
        return map;
    }
}

package com.nexora.service;

import com.nexora.entity.Notification;
import com.nexora.dto.NotificationDTO;
import com.nexora.entity.User;
import com.nexora.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void create(Long userId, String title, String message, Notification.NotificationType type) {
        User user = new User();
        user.setId(userId);
        notificationRepository.save(Notification.builder()
                .user(user).title(title).message(message).type(type).build());
    }

    public List<NotificationDTO> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> NotificationDTO.builder()
                        .id(n.getId()).title(n.getTitle()).message(n.getMessage())
                        .type(n.getType().name()).isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt().toString()).build())
                .toList();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserIdAndIsReadFalse(userId).forEach(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }
}

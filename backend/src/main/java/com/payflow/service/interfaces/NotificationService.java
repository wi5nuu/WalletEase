package com.payflow.service.interfaces;

import com.payflow.dto.response.NotificationResponse;
import com.payflow.dto.response.PageResponse;
import com.payflow.entity.Notification;
import com.payflow.entity.User;

import java.util.List;
import java.util.UUID;

/**
 * NotificationService interface - ABSTRACTION for notification operations.
 */
public interface NotificationService extends BaseService<Notification, UUID> {

    Notification sendNotification(User user, String title, String message, 
                                   Notification.NotificationType type);

    PageResponse<NotificationResponse> getUserNotifications(UUID userId, int page, int size);

    List<NotificationResponse> getUnreadNotifications(UUID userId);

    void markAsRead(UUID userId, UUID notificationId);

    void markAllAsRead(UUID userId);

    long countUnread(UUID userId);

    void sendTransactionNotification(UUID userId, String title, String message);
}

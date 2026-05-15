package com.payflow.notification.impl;

import com.payflow.entity.Notification;
import com.payflow.entity.User;
import com.payflow.notification.NotificationSender;
import com.payflow.repository.NotificationRepository;
import org.springframework.stereotype.Component;

/**
 * InAppNotificationSender - Concrete implementation of NotificationSender.
 * 
 * Stores notifications in the database for in-app display.
 * 
 * POLYMORPHISM: Implements NotificationSender interface
 */
@Component
public class InAppNotificationSender implements NotificationSender {

    private final NotificationRepository notificationRepository;

    public InAppNotificationSender(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public Notification send(User user, String title, String message, Notification.NotificationType type) {
        Notification notification = Notification.create(user, title, message, type);
        return notificationRepository.save(notification);
    }

    @Override
    public boolean supports(Notification.NotificationType type) {
        // Supports all notification types
        return true;
    }

    @Override
    public String getChannel() {
        return "in-app";
    }
}

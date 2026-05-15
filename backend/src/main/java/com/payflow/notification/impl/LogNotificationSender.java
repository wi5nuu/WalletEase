package com.payflow.notification.impl;

import com.payflow.entity.Notification;
import com.payflow.entity.User;
import com.payflow.notification.NotificationSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * LogNotificationSender - Concrete implementation of NotificationSender.
 * 
 * Logs notifications to console/file for debugging and audit purposes.
 * This is a non-persistent sender (returns null as it doesn't store).
 * 
 * POLYMORPHISM: Implements NotificationSender interface
 */
@Component
public class LogNotificationSender implements NotificationSender {

    private static final Logger logger = LoggerFactory.getLogger(LogNotificationSender.class);

    @Override
    public Notification send(User user, String title, String message, Notification.NotificationType type) {
        logger.info("NOTIFICATION [{}] to user {}: {} - {}", 
                type, user.getUsername(), title, message);
        
        // Return null as this sender doesn't persist notifications
        return null;
    }

    @Override
    public boolean supports(Notification.NotificationType type) {
        // Supports all notification types for logging
        return true;
    }

    @Override
    public String getChannel() {
        return "log";
    }
}

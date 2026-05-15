package com.payflow.notification;

import com.payflow.entity.Notification;
import com.payflow.entity.User;

/**
 * NotificationSender - Interface demonstrating POLYMORPHISM (OOP Pillar #3)
 * 
 * This is an ABSTRACTION that defines the contract for sending notifications.
 * Multiple implementations exist for different channels:
 * - InAppNotificationSender (stores in database)
 * - LogNotificationSender (logs to console/file)
 * - Future: EmailNotificationSender, SmsNotificationSender
 * 
 * POLYMORPHISM: Services can call NotificationSender without knowing
 * the concrete implementation, enabling easy addition of new channels.
 */
public interface NotificationSender {

    /**
     * Send a notification to a user.
     * 
     * @param user The recipient user
     * @param title The notification title
     * @param message The notification message
     * @param type The notification type
     * @return The created notification entity (or null for non-persistent senders)
     */
    Notification send(User user, String title, String message, 
                      com.payflow.entity.Notification.NotificationType type);

    /**
     * Check if this sender supports the given notification type.
     * 
     * @param type The notification type
     * @return true if supported
     */
    boolean supports(com.payflow.entity.Notification.NotificationType type);

    /**
     * Get the channel name (e.g., "in-app", "email", "sms", "log")
     * 
     * @return The channel identifier
     */
    String getChannel();
}

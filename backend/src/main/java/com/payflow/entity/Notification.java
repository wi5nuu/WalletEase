package com.payflow.entity;

import jakarta.persistence.*;

/**
 * Notification entity for user alerts and messages.
 * 
 * INHERITANCE: Extends BaseEntity for common audit fields.
 */
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    public enum NotificationType {
        TRANSACTION,
        SECURITY,
        PROMOTION,
        SYSTEM,
        BILL_REMINDER
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    private Boolean isRead = false;

    // Default constructor
    protected Notification() {
    }

    // Factory method
    public static Notification create(User user, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.user = user;
        notification.title = title;
        notification.message = message;
        notification.type = type;
        notification.isRead = false;
        return notification;
    }

    // Getters
    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public NotificationType getType() {
        return type;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    // Setters
    public void markAsRead() {
        this.isRead = true;
    }

    public void markAsUnread() {
        this.isRead = false;
    }
}

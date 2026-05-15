package com.payflow.service.impl;

import com.payflow.dto.response.NotificationResponse;
import com.payflow.dto.response.PageResponse;
import com.payflow.entity.Notification;
import com.payflow.entity.User;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.mapper.NotificationMapper;
import com.payflow.notification.NotificationSender;
import com.payflow.repository.NotificationRepository;
import com.payflow.repository.UserRepository;
import com.payflow.service.interfaces.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * NotificationServiceImpl - Concrete implementation of NotificationService.
 * 
 * ABSTRACTION: Implements NotificationService interface.
 * POLYMORPHISM: Uses all NotificationSender implementations.
 */
@Service
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final List<NotificationSender> notificationSenders;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   NotificationMapper notificationMapper,
                                   List<NotificationSender> notificationSenders) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationMapper = notificationMapper;
        this.notificationSenders = notificationSenders;
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return notificationRepository.findById(id);
    }

    @Override
    public List<Notification> findAll() {
        return notificationRepository.findAll();
    }

    @Override
    @Transactional
    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return notificationRepository.existsById(id);
    }

    @Override
    public long count() {
        return notificationRepository.count();
    }

    @Override
    @Transactional
    public Notification sendNotification(User user, String title, String message, 
                                         Notification.NotificationType type) {
        // Send through all notification channels (POLYMORPHISM)
        Notification savedNotification = null;
        for (NotificationSender sender : notificationSenders) {
            if (sender.supports(type)) {
                Notification result = sender.send(user, title, message, type);
                if (result != null) {
                    savedNotification = result;
                }
            }
        }
        return savedNotification;
    }

    @Override
    @Transactional
    public void sendTransactionNotification(UUID userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        sendNotification(user, title, message, Notification.NotificationType.TRANSACTION);
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public PageResponse<NotificationResponse> getUserNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        
        List<NotificationResponse> responses = notifications.getContent().stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
        
        return new PageResponse<>(responses, page, size, notifications.getTotalElements());
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        
        return notifications.stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("#userId == authentication.principal.username")
    public void markAsRead(UUID userId, UUID notificationId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    @Override
    @Transactional
    @PreAuthorize("#userId == authentication.principal.username")
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public long countUnread(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
}

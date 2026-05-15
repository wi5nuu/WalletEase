package com.payflow.controller;

import com.payflow.response.BaseResponse;
import com.payflow.dto.response.NotificationResponse;
import com.payflow.dto.response.PageResponse;
import com.payflow.entity.User;
import com.payflow.repository.UserRepository;
import com.payflow.response.SuccessResponse;
import com.payflow.service.interfaces.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Notification Controller.
 * 
 * Handles notification retrieval and marking as read.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = getUserId(userDetails);
        PageResponse<NotificationResponse> notifications = notificationService.getUserNotifications(userId, page, size);
        return ResponseEntity.ok(SuccessResponse.of(notifications, "Notifications retrieved"));
    }

    @GetMapping("/unread")
    public ResponseEntity<BaseResponse<List<NotificationResponse>>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(SuccessResponse.of(notifications, "Unread notifications retrieved"));
    }

    @GetMapping("/count-unread")
    public ResponseEntity<BaseResponse<Long>> countUnread(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(SuccessResponse.of(count, "Unread count retrieved"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<BaseResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        UUID userId = getUserId(userDetails);
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(SuccessResponse.of(null, "Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<BaseResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(SuccessResponse.of(null, "All notifications marked as read"));
    }

    private UUID getUserId(UserDetails userDetails) {
        // ABSTRACTION: Look up user by username to get UUID
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

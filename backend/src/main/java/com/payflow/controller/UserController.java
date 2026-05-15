package com.payflow.controller;

import com.payflow.response.BaseResponse;
import com.payflow.dto.response.UserResponse;
import com.payflow.entity.User;
import com.payflow.repository.UserRepository;
import com.payflow.response.SuccessResponse;
import com.payflow.service.interfaces.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User Controller.
 * 
 * Handles user profile operations.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<BaseResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        UserResponse user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(SuccessResponse.of(user, "User profile retrieved"));
    }

    @PutMapping("/me")
    public ResponseEntity<BaseResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        UUID userId = getUserId(userDetails);
        UserResponse user = userService.updateUser(userId, fullName, email, phone);
        return ResponseEntity.ok(SuccessResponse.of(user, "Profile updated successfully"));
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<BaseResponse<Void>> updateAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String avatarUrl) {
        UUID userId = getUserId(userDetails);
        userService.updateAvatar(userId, avatarUrl);
        return ResponseEntity.ok(SuccessResponse.of(null, "Avatar updated successfully"));
    }

    private UUID getUserId(UserDetails userDetails) {
        // ABSTRACTION: Look up user by username to get UUID
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

package com.payflow.service.interfaces;

import com.payflow.dto.response.UserResponse;
import com.payflow.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

/**
 * UserService interface - ABSTRACTION for user operations.
 */
public interface UserService extends BaseService<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    UserResponse getCurrentUser(UUID userId);

    UserResponse updateUser(UUID userId, String fullName, String email, String phone);

    void updateAvatar(UUID userId, String avatarUrl);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Page<UserResponse> searchUsers(String search, Pageable pageable);
}

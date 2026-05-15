package com.payflow.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * RefreshToken entity for JWT token rotation.
 * Stores refresh tokens with expiration and revocation tracking.
 * 
 * INHERITANCE: Extends BaseEntity for common audit fields.
 */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token", unique = true, nullable = false, length = 512)
    private String token;

    @Column(name = "is_revoked")
    private Boolean isRevoked = false;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Default constructor
    protected RefreshToken() {
    }

    // Factory method
    public static RefreshToken create(User user, String token, LocalDateTime expiresAt) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.user = user;
        refreshToken.token = token;
        refreshToken.expiresAt = expiresAt;
        refreshToken.isRevoked = false;
        return refreshToken;
    }

    // Getters
    public User getUser() {
        return user;
    }

    public String getToken() {
        return token;
    }

    public Boolean getIsRevoked() {
        return isRevoked;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    // Domain methods
    public void revoke() {
        this.isRevoked = true;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !isRevoked && !isExpired();
    }
}

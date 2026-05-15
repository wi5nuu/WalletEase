package com.payflow.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * User entity demonstrating ENCAPSULATION (OOP Pillar #1)
 * Sensitive fields (passwordHash, transactionPinHash) have NO public setters.
 * Password can only be set via controlled domain method.
 * 
 * INHERITANCE: Extends BaseEntity for common audit fields.
 */
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    // ENCAPSULATION: All fields private
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "phone", unique = true, nullable = false, length = 20)
    private String phone;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    // ENCAPSULATION: passwordHash has NO setter - must use changePassword method
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // ENCAPSULATION: transactionPinHash has NO setter - must use setTransactionPin method
    @Column(name = "transaction_pin_hash", length = 255)
    private String transactionPinHash;

    @Column(name = "role", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Role role = Role.ROLE_USER;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // One-to-One relationship with Wallet
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;

    // One-to-Many relationship with Notifications
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notification> notifications = new ArrayList<>();

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }

    // Default constructor (required by JPA)
    protected User() {
    }

    // Constructor for creating new users (factory method pattern)
    public static User createNewUser(String username, String email, String phone, 
                                     String fullName, String encodedPassword) {
        User user = new User();
        user.username = username;
        user.email = email;
        user.phone = phone;
        user.fullName = fullName;
        user.passwordHash = encodedPassword;
        user.role = Role.ROLE_USER;
        user.isActive = true;
        return user;
    }

    // ENCAPSULATION: Public getters
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getTransactionPinHash() {
        return transactionPinHash;
    }

    public Role getRole() {
        return role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    // ENCAPSULATION: Controlled setters for non-sensitive fields
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // ENCAPSULATION: Domain method for password change - NO direct setter
    public void changePassword(String encodedPassword) {
        if (encodedPassword == null || encodedPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        this.passwordHash = encodedPassword;
    }

    // ENCAPSULATION: Domain method for PIN setup - NO direct setter
    public void setTransactionPin(String encodedPin) {
        if (encodedPin == null || encodedPin.isBlank()) {
            throw new IllegalArgumentException("PIN hash cannot be empty");
        }
        this.transactionPinHash = encodedPin;
    }

    // ENCAPSULATION: Domain method for PIN change - requires old PIN verification
    public void changeTransactionPin(String newEncodedPin) {
        if (newEncodedPin == null || newEncodedPin.isBlank()) {
            throw new IllegalArgumentException("New PIN hash cannot be empty");
        }
        this.transactionPinHash = newEncodedPin;
    }

    // Helper method to promote to admin
    public void promoteToAdmin() {
        this.role = Role.ROLE_ADMIN;
    }

    // Helper method to demote to user
    public void demoteToUser() {
        this.role = Role.ROLE_USER;
    }

    // Helper method to check if user has PIN set
    public boolean hasTransactionPin() {
        return this.transactionPinHash != null && !this.transactionPinHash.isBlank();
    }

    // Helper method to check if user is admin
    public boolean isAdmin() {
        return this.role == Role.ROLE_ADMIN;
    }
}

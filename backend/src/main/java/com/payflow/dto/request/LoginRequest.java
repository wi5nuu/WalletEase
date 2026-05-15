package com.payflow.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user login requests.
 */
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    @JsonProperty("username")
    private String username;

    @NotBlank(message = "Password is required")
    @JsonProperty("password")
    private String password;

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

package com.payflow.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT Configuration properties.
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    private String secret;
    private long accessExpiryMs = 900000; // 15 minutes
    private long refreshExpiryMs = 604800000; // 7 days

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getAccessExpiryMs() {
        return accessExpiryMs;
    }

    public void setAccessExpiryMs(long accessExpiryMs) {
        this.accessExpiryMs = accessExpiryMs;
    }

    public long getRefreshExpiryMs() {
        return refreshExpiryMs;
    }

    public void setRefreshExpiryMs(long refreshExpiryMs) {
        this.refreshExpiryMs = refreshExpiryMs;
    }
}

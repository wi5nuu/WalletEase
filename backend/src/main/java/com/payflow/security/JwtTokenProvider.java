package com.payflow.security;

import com.payflow.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

/**
 * JWT Token Provider for generating and validating JWT tokens.
 * 
 * Implements:
 * - Access token: 15 minutes expiry
 * - Refresh token: 7 days expiry
 * - HS256 signature algorithm
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:default-secret-key-for-development-only-change-in-production}")
    private String jwtSecret;

    @Value("${jwt.access-expiry-ms:900000}") // 15 minutes
    private long jwtAccessExpiryMs;

    @Value("${jwt.refresh-expiry-ms:604800000}") // 7 days
    private long jwtRefreshExpiryMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate access token for authenticated user.
     */
    public String generateAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateAccessToken(userDetails.getUsername());
    }

    /**
     * Generate access token for user.
     */
    public String generateAccessToken(String username) {
        Instant now = Instant.now();
        Instant expiry = now.plus(jwtAccessExpiryMs, ChronoUnit.MILLIS);

        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim("type", "access")
                .claim("jti", UUID.randomUUID().toString())
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generate access token with role information.
     */
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(jwtAccessExpiryMs, ChronoUnit.MILLIS);

        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim("type", "access")
                .claim("role", user.getRole().name())
                .claim("userId", user.getId().toString())
                .claim("jti", UUID.randomUUID().toString())
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generate refresh token for user.
     */
    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(jwtRefreshExpiryMs, ChronoUnit.MILLIS);

        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim("type", "refresh")
                .claim("userId", user.getId().toString())
                .claim("jti", UUID.randomUUID().toString())
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Extract username from token.
     */
    public String extractUsername(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * Extract user ID from token.
     */
    public UUID extractUserId(String token) {
        Claims claims = parseToken(token);
        String userId = claims.get("userId", String.class);
        return userId != null ? UUID.fromString(userId) : null;
    }

    /**
     * Extract expiration date from token.
     */
    public Date extractExpiration(String token) {
        Claims claims = parseToken(token);
        return claims.getExpiration();
    }

    /**
     * Check if token is expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    /**
     * Validate token against UserDetails.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Parse and validate token, returning claims.
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Get token expiration time in milliseconds.
     */
    public long getAccessTokenExpiryMs() {
        return jwtAccessExpiryMs;
    }

    /**
     * Get refresh token expiration time in milliseconds.
     */
    public long getRefreshTokenExpiryMs() {
        return jwtRefreshExpiryMs;
    }
}

package com.payflow.security;

import com.payflow.entity.User;
import com.payflow.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

/**
 * Custom UserDetailsService for Spring Security authentication.
 * Loads user details from the database.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return buildUserDetails(user);
    }

    /**
     * Load user by ID (UUID).
     */
    public UserDetails loadUserById(UUID userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

        return buildUserDetails(user);
    }

    /**
     * Load user by email or phone (for login with any identifier).
     */
    public UserDetails loadUserByIdentifier(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmailOrPhone(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

        return buildUserDetails(user);
    }

    /**
     * Build Spring Security UserDetails from our User entity.
     */
    private UserDetails buildUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                user.getIsActive(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                getAuthorities(user)
        );
    }

    /**
     * Get user authorities (roles).
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole().name())
        );
    }
}

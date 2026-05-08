package com.yourteam.monitoring.auth.api;

import com.yourteam.monitoring.auth.domain.UserRole;

import java.time.Instant;

public record LoginResponse(
        String token,
        String tokenType,
        Instant expiresAt,
        String username,
        UserRole role
) {
}

package com.yourteam.monitoring.auth.service;

import com.yourteam.monitoring.auth.domain.UserRole;

import java.util.UUID;

public record AuthenticatedUser(
        UUID id,
        String username,
        UserRole role
) {
}

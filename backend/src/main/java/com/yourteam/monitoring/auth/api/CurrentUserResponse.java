package com.yourteam.monitoring.auth.api;

import com.yourteam.monitoring.auth.domain.UserRole;

import java.util.UUID;

public record CurrentUserResponse(
        UUID id,
        String username,
        UserRole role
) {
}

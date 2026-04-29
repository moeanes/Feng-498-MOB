package com.yourteam.monitoring.agentapi.api;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AgentRegisterRequest(
        @NotNull
        UUID machineId,

        String hostname,
        String ipAddress,
        String osName,
        String agentVersion
) {
}

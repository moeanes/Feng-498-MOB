package com.yourteam.monitoring.machine.api;

import com.yourteam.monitoring.machine.domain.MachineStatus;

import java.time.Instant;
import java.util.UUID;

public record MachineResponse(
        UUID id,
        String name,
        String hostname,
        String ipAddress,
        String osName,
        String agentVersion,
        MachineStatus status,
        Instant lastSeen,
        Instant createdAt
) {
}

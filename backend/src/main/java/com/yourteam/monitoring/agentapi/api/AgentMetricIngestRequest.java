package com.yourteam.monitoring.agentapi.api;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.Instant;
import java.util.UUID;

public record AgentMetricIngestRequest(
        @NotNull
        UUID machineId,

        @NotNull
        Instant recordedAt,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double cpuUsage,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double ramUsage,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double diskUsage,

        @PositiveOrZero
        Double netInKbps,

        @PositiveOrZero
        Double netOutKbps,

        @PositiveOrZero
        Long uptimeSeconds
) {
}

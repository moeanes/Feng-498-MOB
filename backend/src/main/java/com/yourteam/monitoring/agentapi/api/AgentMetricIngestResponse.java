package com.yourteam.monitoring.agentapi.api;

import java.time.Instant;
import java.util.UUID;

public record AgentMetricIngestResponse(
        Long metricRecordId,
        UUID machineId,
        Instant recordedAt
) {
}

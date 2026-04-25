package com.yourteam.monitoring.machine.api;

import java.time.Instant;
import java.util.UUID;

public record MachineMetricResponse(
        Long metricRecordId,
        UUID machineId,
        Instant recordedAt,
        Double cpuUsage,
        Double ramUsage,
        Double diskUsage,
        Double netInKbps,
        Double netOutKbps,
        Long uptimeSeconds
) {
}

package com.yourteam.monitoring.machine.api;

import java.time.Instant;
import java.util.UUID;

public record ProcessMetricResponse(
        Long id,
        Long metricRecordId,
        UUID machineId,
        Instant recordedAt,
        Integer processId,
        String processName,
        Integer instanceCount,
        Double cpuUsage,
        Double ramUsageMb,
        Double ramUsagePercent,
        Double impactScore
) {
}

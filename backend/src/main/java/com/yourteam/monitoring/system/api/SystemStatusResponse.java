package com.yourteam.monitoring.system.api;

public record SystemStatusResponse(
        String backend,
        String database,
        long machineCount,
        long onlineMachineCount,
        long openAlertCount,
        String latestMetricTime,
        String version
) {
}

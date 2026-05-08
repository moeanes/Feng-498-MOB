package com.yourteam.monitoring.alert.api;

import com.yourteam.monitoring.alert.domain.AlertSeverity;
import com.yourteam.monitoring.alert.domain.AlertStatus;
import com.yourteam.monitoring.alert.domain.ComparisonOperator;
import com.yourteam.monitoring.alert.domain.MetricType;

import java.time.Instant;
import java.util.UUID;

public record AlertEventResponse(
        UUID id,
        UUID ruleId,
        UUID machineId,
        String machineName,
        AlertStatus status,
        AlertSeverity severity,
        MetricType metricType,
        ComparisonOperator operator,
        Double thresholdValue,
        Double lastValue,
        String message,
        Instant startedAt,
        Instant endedAt,
        UUID ackedBy,
        Instant ackedAt
) {
}

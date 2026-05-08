package com.yourteam.monitoring.alert.api;

import com.yourteam.monitoring.alert.domain.AlertSeverity;
import com.yourteam.monitoring.alert.domain.ComparisonOperator;
import com.yourteam.monitoring.alert.domain.MetricType;

import java.time.Instant;
import java.util.UUID;

public record AlertRuleResponse(
        UUID id,
        UUID machineId,
        String machineName,
        MetricType metricType,
        ComparisonOperator operator,
        Double thresholdValue,
        Integer durationSeconds,
        AlertSeverity severity,
        boolean enabled,
        UUID createdBy,
        Instant createdAt
) {
}

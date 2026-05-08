package com.yourteam.monitoring.alert.api;

import com.yourteam.monitoring.alert.domain.AlertSeverity;
import com.yourteam.monitoring.alert.domain.ComparisonOperator;
import com.yourteam.monitoring.alert.domain.MetricType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateAlertRuleRequest(
        UUID machineId,

        @NotNull
        MetricType metricType,

        @NotNull
        ComparisonOperator operator,

        @NotNull
        @DecimalMin("0.0")
        Double thresholdValue,

        @NotNull
        @Min(0)
        Integer durationSeconds,

        @NotNull
        AlertSeverity severity,

        @NotNull
        Boolean enabled
) {
}

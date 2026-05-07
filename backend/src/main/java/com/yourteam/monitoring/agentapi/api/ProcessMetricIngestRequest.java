package com.yourteam.monitoring.agentapi.api;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProcessMetricIngestRequest(
        @PositiveOrZero
        Integer processId,

        @NotBlank
        @Size(max = 255)
        String processName,

        @NotNull
        @Positive
        Integer instanceCount,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double cpuUsage,

        @NotNull
        @PositiveOrZero
        Double ramUsageMb,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double ramUsagePercent,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double impactScore
) {
}

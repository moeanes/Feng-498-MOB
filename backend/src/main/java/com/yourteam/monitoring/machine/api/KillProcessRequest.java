package com.yourteam.monitoring.machine.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record KillProcessRequest(
        @NotNull Integer pid,
        @NotBlank String processName
) {}

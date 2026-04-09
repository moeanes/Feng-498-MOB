package com.yourteam.monitoring.machine.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMachineRequest(
        @NotBlank
        @Size(max = 120)
        String name,

        @Size(max = 255)
        String hostname,

        @Size(max = 64)
        String ipAddress,

        @Size(max = 120)
        String osName,

        @Size(max = 40)
        String agentVersion
) {
}

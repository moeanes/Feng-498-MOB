package com.yourteam.agent.dto;

import java.util.UUID;

/**
 * Payload sent to PATCH /api/v1/agent/register on startup.
 * Carries the real system info collected by OSHI so the backend
 * record reflects the actual machine rather than placeholder values.
 */
public class SystemInfoPayload {
    public UUID   machineId;
    public String hostname;
    public String ipAddress;
    public String osName;
    public String agentVersion;
}

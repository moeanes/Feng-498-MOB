package com.yourteam.agent.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Data Transfer Object that carries one metric snapshot from the agent
 * to the backend.
 *
 * Field names and types mirror the backend's AgentMetricIngestRequest
 * exactly so that Jackson can serialize this directly to a compatible
 * JSON body without any mapping step.
 *
 * cpuUsage, ramUsage, diskUsage are percentages in the range [0.0, 100.0].
 * netInKbps and netOutKbps are kilobytes per second (KB/s).
 * uptimeSeconds is the total OS uptime in seconds.
 */
public class MetricPayload {

    public UUID machineId;
    public Instant recordedAt;

    /** CPU utilization percentage (0.0 – 100.0) */
    public double cpuUsage;

    /** RAM utilization percentage (0.0 – 100.0) */
    public double ramUsage;

    /** Disk utilization percentage across all file stores (0.0 – 100.0) */
    public double diskUsage;

    /** Network bytes received converted to KB/s since the last collection tick */
    public double netInKbps;

    /** Network bytes sent converted to KB/s since the last collection tick */
    public double netOutKbps;

    /** Total OS uptime in seconds */
    public long uptimeSeconds;
}

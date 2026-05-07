package com.yourteam.agent.dto;

/**
 * One application/process row sent by the agent.
 *
 * The agent groups operating-system processes by name. For example, several
 * Chrome helper processes become one "Chrome" row with combined CPU/RAM usage.
 */
public class ProcessMetricPayload {

    /** Representative process id from the grouped application */
    public int processId;

    /** OS process/application name, for example chrome, java, Docker Desktop */
    public String processName;

    /** Number of OS processes grouped under this application name */
    public int instanceCount;

    /** CPU utilization percentage for this grouped application */
    public double cpuUsage;

    /** RAM usage in megabytes */
    public double ramUsageMb;

    /** RAM usage as percentage of total machine RAM */
    public double ramUsagePercent;

    /** Simple CPU/RAM based resource-impact score, not real electrical watts */
    public double impactScore;
}

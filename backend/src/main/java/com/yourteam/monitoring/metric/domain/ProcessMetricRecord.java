package com.yourteam.monitoring.metric.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "process_metric_records")
public class ProcessMetricRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_record_id", nullable = false)
    private Long metricRecordId;

    @Column(name = "machine_id", nullable = false)
    private UUID machineId;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "process_id")
    private Integer processId;

    @Column(name = "process_name", nullable = false)
    private String processName;

    @Column(name = "instance_count", nullable = false)
    private Integer instanceCount;

    @Column(name = "cpu_usage", nullable = false)
    private Double cpuUsage;

    @Column(name = "ram_usage_mb", nullable = false)
    private Double ramUsageMb;

    @Column(name = "ram_usage_percent", nullable = false)
    private Double ramUsagePercent;

    @Column(name = "impact_score", nullable = false)
    private Double impactScore;

    protected ProcessMetricRecord() {
    }

    private ProcessMetricRecord(
            Long metricRecordId,
            UUID machineId,
            Instant recordedAt,
            Integer processId,
            String processName,
            Integer instanceCount,
            Double cpuUsage,
            Double ramUsageMb,
            Double ramUsagePercent,
            Double impactScore
    ) {
        this.metricRecordId = metricRecordId;
        this.machineId = machineId;
        this.recordedAt = recordedAt;
        this.processId = processId;
        this.processName = processName;
        this.instanceCount = instanceCount;
        this.cpuUsage = cpuUsage;
        this.ramUsageMb = ramUsageMb;
        this.ramUsagePercent = ramUsagePercent;
        this.impactScore = impactScore;
    }

    public static ProcessMetricRecord create(
            Long metricRecordId,
            UUID machineId,
            Instant recordedAt,
            Integer processId,
            String processName,
            Integer instanceCount,
            Double cpuUsage,
            Double ramUsageMb,
            Double ramUsagePercent,
            Double impactScore
    ) {
        return new ProcessMetricRecord(
                metricRecordId,
                machineId,
                recordedAt,
                processId,
                processName,
                instanceCount,
                cpuUsage,
                ramUsageMb,
                ramUsagePercent,
                impactScore
        );
    }

    public Long getId() {
        return id;
    }

    public Long getMetricRecordId() {
        return metricRecordId;
    }

    public UUID getMachineId() {
        return machineId;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }

    public Integer getProcessId() {
        return processId;
    }

    public String getProcessName() {
        return processName;
    }

    public Integer getInstanceCount() {
        return instanceCount;
    }

    public Double getCpuUsage() {
        return cpuUsage;
    }

    public Double getRamUsageMb() {
        return ramUsageMb;
    }

    public Double getRamUsagePercent() {
        return ramUsagePercent;
    }

    public Double getImpactScore() {
        return impactScore;
    }
}

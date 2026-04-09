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
@Table(name = "metric_records")
public class MetricRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "machine_id", nullable = false)
    private UUID machineId;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "cpu_usage", nullable = false)
    private Double cpuUsage;

    @Column(name = "ram_usage", nullable = false)
    private Double ramUsage;

    @Column(name = "disk_usage", nullable = false)
    private Double diskUsage;

    @Column(name = "net_in_kbps")
    private Double netInKbps;

    @Column(name = "net_out_kbps")
    private Double netOutKbps;

    @Column(name = "uptime_seconds")
    private Long uptimeSeconds;

    protected MetricRecord() {
    }

    private MetricRecord(
            UUID machineId,
            Instant recordedAt,
            Double cpuUsage,
            Double ramUsage,
            Double diskUsage,
            Double netInKbps,
            Double netOutKbps,
            Long uptimeSeconds
    ) {
        this.machineId = machineId;
        this.recordedAt = recordedAt;
        this.cpuUsage = cpuUsage;
        this.ramUsage = ramUsage;
        this.diskUsage = diskUsage;
        this.netInKbps = netInKbps;
        this.netOutKbps = netOutKbps;
        this.uptimeSeconds = uptimeSeconds;
    }

    public static MetricRecord create(
            UUID machineId,
            Instant recordedAt,
            Double cpuUsage,
            Double ramUsage,
            Double diskUsage,
            Double netInKbps,
            Double netOutKbps,
            Long uptimeSeconds
    ) {
        return new MetricRecord(
                machineId,
                recordedAt,
                cpuUsage,
                ramUsage,
                diskUsage,
                netInKbps,
                netOutKbps,
                uptimeSeconds
        );
    }

    public Long getId() {
        return id;
    }

    public UUID getMachineId() {
        return machineId;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}

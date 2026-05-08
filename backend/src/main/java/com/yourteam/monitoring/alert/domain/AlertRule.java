package com.yourteam.monitoring.alert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alert_rules")
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "machine_id")
    private UUID machineId;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false, length = 30)
    private MetricType metricType;

    @Enumerated(EnumType.STRING)
    @Column(name = "operator", nullable = false, length = 10)
    private ComparisonOperator operator;

    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private AlertSeverity severity;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AlertRule() {
    }

    private AlertRule(
            UUID machineId,
            MetricType metricType,
            ComparisonOperator operator,
            Double thresholdValue,
            Integer durationSeconds,
            AlertSeverity severity,
            boolean enabled,
            UUID createdBy
    ) {
        this.machineId = machineId;
        this.metricType = metricType;
        this.operator = operator;
        this.thresholdValue = thresholdValue;
        this.durationSeconds = durationSeconds;
        this.severity = severity;
        this.enabled = enabled;
        this.createdBy = createdBy;
    }

    public static AlertRule create(
            UUID machineId,
            MetricType metricType,
            ComparisonOperator operator,
            Double thresholdValue,
            Integer durationSeconds,
            AlertSeverity severity,
            boolean enabled,
            UUID createdBy
    ) {
        return new AlertRule(machineId, metricType, operator, thresholdValue, durationSeconds, severity, enabled, createdBy);
    }

    public UUID getId() {
        return id;
    }

    public UUID getMachineId() {
        return machineId;
    }

    public MetricType getMetricType() {
        return metricType;
    }

    public ComparisonOperator getOperator() {
        return operator;
    }

    public Double getThresholdValue() {
        return thresholdValue;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void update(
            UUID machineId,
            MetricType metricType,
            ComparisonOperator operator,
            Double thresholdValue,
            Integer durationSeconds,
            AlertSeverity severity,
            boolean enabled
    ) {
        this.machineId = machineId;
        this.metricType = metricType;
        this.operator = operator;
        this.thresholdValue = thresholdValue;
        this.durationSeconds = durationSeconds;
        this.severity = severity;
        this.enabled = enabled;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}

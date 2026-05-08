package com.yourteam.monitoring.alert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alert_events")
public class AlertEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rule_id", nullable = false)
    private UUID ruleId;

    @Column(name = "machine_id", nullable = false)
    private UUID machineId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AlertStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "last_value")
    private Double lastValue;

    @Column(name = "message", length = 400)
    private String message;

    @Column(name = "acked_by")
    private UUID ackedBy;

    @Column(name = "acked_at")
    private Instant ackedAt;

    protected AlertEvent() {
    }

    private AlertEvent(UUID ruleId, UUID machineId, Instant startedAt, Double lastValue, String message) {
        this.ruleId = ruleId;
        this.machineId = machineId;
        this.status = AlertStatus.OPEN;
        this.startedAt = startedAt;
        this.lastValue = lastValue;
        this.message = message;
    }

    public static AlertEvent open(UUID ruleId, UUID machineId, Instant startedAt, Double lastValue, String message) {
        return new AlertEvent(ruleId, machineId, startedAt, lastValue, message);
    }

    public UUID getId() {
        return id;
    }

    public UUID getRuleId() {
        return ruleId;
    }

    public UUID getMachineId() {
        return machineId;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public Double getLastValue() {
        return lastValue;
    }

    public String getMessage() {
        return message;
    }

    public UUID getAckedBy() {
        return ackedBy;
    }

    public Instant getAckedAt() {
        return ackedAt;
    }

    public void refresh(Double lastValue, String message) {
        this.lastValue = lastValue;
        this.message = message;
    }

    public void acknowledge(UUID userId) {
        this.status = AlertStatus.ACKED;
        this.ackedBy = userId;
        this.ackedAt = Instant.now();
    }

    public void resolve(Instant endedAt) {
        this.status = AlertStatus.RESOLVED;
        this.endedAt = endedAt == null ? Instant.now() : endedAt;
    }
}

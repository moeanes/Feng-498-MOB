package com.yourteam.monitoring.alert.service;

import com.yourteam.monitoring.alert.api.AlertEventResponse;
import com.yourteam.monitoring.alert.domain.AlertEvent;
import com.yourteam.monitoring.alert.domain.AlertRule;
import com.yourteam.monitoring.alert.domain.AlertStatus;
import com.yourteam.monitoring.alert.repo.AlertEventRepository;
import com.yourteam.monitoring.alert.repo.AlertRuleRepository;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AlertEventService {

    private final AlertEventRepository alertEventRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final MachineRepository machineRepository;

    public AlertEventService(
            AlertEventRepository alertEventRepository,
            AlertRuleRepository alertRuleRepository,
            MachineRepository machineRepository
    ) {
        this.alertEventRepository = alertEventRepository;
        this.alertRuleRepository = alertRuleRepository;
        this.machineRepository = machineRepository;
    }

    public List<AlertEventResponse> getAlerts() {
        return alertEventRepository.findAllByOrderByStartedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AlertEventResponse> getOpenAlerts() {
        return alertEventRepository.findByStatusOrderByStartedAtDesc(AlertStatus.OPEN)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AlertEventResponse acknowledge(UUID alertId, UUID userId) {
        AlertEvent event = getEventOrThrow(alertId);
        if (event.getStatus() == AlertStatus.RESOLVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resolved alerts cannot be acknowledged");
        }
        event.acknowledge(userId);
        return toResponse(event);
    }

    @Transactional
    public AlertEventResponse resolve(UUID alertId) {
        AlertEvent event = getEventOrThrow(alertId);
        if (event.getStatus() == AlertStatus.RESOLVED) {
            return toResponse(event);
        }
        event.resolve(null);
        return toResponse(event);
    }

    private AlertEvent getEventOrThrow(UUID alertId) {
        return alertEventRepository.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert event not found: " + alertId));
    }

    private AlertEventResponse toResponse(AlertEvent event) {
        AlertRule rule = alertRuleRepository.findById(event.getRuleId()).orElse(null);
        String machineName = machineRepository.findById(event.getMachineId())
                .map(Machine::getName)
                .orElse("Unknown machine");

        return new AlertEventResponse(
                event.getId(),
                event.getRuleId(),
                event.getMachineId(),
                machineName,
                event.getStatus(),
                rule == null ? null : rule.getSeverity(),
                rule == null ? null : rule.getMetricType(),
                rule == null ? null : rule.getOperator(),
                rule == null ? null : rule.getThresholdValue(),
                event.getLastValue(),
                event.getMessage(),
                event.getStartedAt(),
                event.getEndedAt(),
                event.getAckedBy(),
                event.getAckedAt()
        );
    }
}

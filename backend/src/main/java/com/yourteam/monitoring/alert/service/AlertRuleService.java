package com.yourteam.monitoring.alert.service;

import com.yourteam.monitoring.alert.api.AlertRuleResponse;
import com.yourteam.monitoring.alert.api.CreateAlertRuleRequest;
import com.yourteam.monitoring.alert.api.UpdateAlertRuleRequest;
import com.yourteam.monitoring.alert.domain.AlertRule;
import com.yourteam.monitoring.alert.domain.MetricType;
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
public class AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;
    private final MachineRepository machineRepository;

    public AlertRuleService(AlertRuleRepository alertRuleRepository, MachineRepository machineRepository) {
        this.alertRuleRepository = alertRuleRepository;
        this.machineRepository = machineRepository;
    }

    public List<AlertRuleResponse> getRules() {
        return alertRuleRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AlertRuleResponse getRule(UUID ruleId) {
        return toResponse(getRuleOrThrow(ruleId));
    }

    @Transactional
    public AlertRuleResponse createRule(CreateAlertRuleRequest request, UUID createdBy) {
        validateRequest(request.machineId(), request.metricType(), request.thresholdValue());

        boolean enabled = request.enabled() == null || request.enabled();
        AlertRule rule = AlertRule.create(
                request.machineId(),
                request.metricType(),
                request.operator(),
                request.thresholdValue(),
                request.durationSeconds(),
                request.severity(),
                enabled,
                createdBy
        );

        return toResponse(alertRuleRepository.save(rule));
    }

    @Transactional
    public AlertRuleResponse updateRule(UUID ruleId, UpdateAlertRuleRequest request) {
        validateRequest(request.machineId(), request.metricType(), request.thresholdValue());

        AlertRule rule = getRuleOrThrow(ruleId);
        rule.update(
                request.machineId(),
                request.metricType(),
                request.operator(),
                request.thresholdValue(),
                request.durationSeconds(),
                request.severity(),
                request.enabled()
        );

        return toResponse(rule);
    }

    @Transactional
    public void deleteRule(UUID ruleId) {
        AlertRule rule = getRuleOrThrow(ruleId);
        alertRuleRepository.delete(rule);
    }

    private void validateRequest(UUID machineId, MetricType metricType, Double thresholdValue) {
        if (machineId != null && !machineRepository.existsById(machineId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Machine not found: " + machineId);
        }
        if (usesPercentage(metricType) && thresholdValue > 100.0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    metricType + " threshold must be between 0 and 100 because it is stored as a percentage"
            );
        }
    }

    private boolean usesPercentage(MetricType metricType) {
        return metricType == MetricType.CPU || metricType == MetricType.RAM || metricType == MetricType.DISK;
    }

    private AlertRule getRuleOrThrow(UUID ruleId) {
        return alertRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert rule not found: " + ruleId));
    }

    private AlertRuleResponse toResponse(AlertRule rule) {
        String machineName = rule.getMachineId() == null
                ? "All machines"
                : machineRepository.findById(rule.getMachineId())
                        .map(Machine::getName)
                        .orElse("Unknown machine");

        return new AlertRuleResponse(
                rule.getId(),
                rule.getMachineId(),
                machineName,
                rule.getMetricType(),
                rule.getOperator(),
                rule.getThresholdValue(),
                rule.getDurationSeconds(),
                rule.getSeverity(),
                rule.isEnabled(),
                rule.getCreatedBy(),
                rule.getCreatedAt()
        );
    }
}

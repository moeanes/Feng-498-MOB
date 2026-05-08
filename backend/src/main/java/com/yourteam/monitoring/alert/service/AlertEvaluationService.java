package com.yourteam.monitoring.alert.service;

import com.yourteam.monitoring.alert.domain.AlertEvent;
import com.yourteam.monitoring.alert.domain.AlertRule;
import com.yourteam.monitoring.alert.domain.AlertStatus;
import com.yourteam.monitoring.alert.domain.ComparisonOperator;
import com.yourteam.monitoring.alert.domain.MetricType;
import com.yourteam.monitoring.alert.repo.AlertEventRepository;
import com.yourteam.monitoring.alert.repo.AlertRuleRepository;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import com.yourteam.monitoring.metric.domain.MetricRecord;
import com.yourteam.monitoring.metric.repo.MetricRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class AlertEvaluationService {

    private static final List<AlertStatus> ACTIVE_STATUSES = List.of(AlertStatus.OPEN, AlertStatus.ACKED);

    private final AlertRuleRepository alertRuleRepository;
    private final AlertEventRepository alertEventRepository;
    private final MetricRecordRepository metricRecordRepository;
    private final MachineRepository machineRepository;

    public AlertEvaluationService(
            AlertRuleRepository alertRuleRepository,
            AlertEventRepository alertEventRepository,
            MetricRecordRepository metricRecordRepository,
            MachineRepository machineRepository
    ) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertEventRepository = alertEventRepository;
        this.metricRecordRepository = metricRecordRepository;
        this.machineRepository = machineRepository;
    }

    @Transactional
    public void evaluate(MetricRecord metricRecord) {
        List<AlertRule> rules = alertRuleRepository.findEnabledRulesForMachine(metricRecord.getMachineId());
        if (rules.isEmpty()) {
            return;
        }

        String machineName = machineRepository.findById(metricRecord.getMachineId())
                .map(Machine::getName)
                .orElse(metricRecord.getMachineId().toString());

        for (AlertRule rule : rules) {
            evaluateRule(rule, metricRecord, machineName);
        }
    }

    private void evaluateRule(AlertRule rule, MetricRecord metricRecord, String machineName) {
        Double latestValue = valueFor(metricRecord, rule.getMetricType());
        if (latestValue == null) {
            return;
        }

        var activeEvent = alertEventRepository.findByRuleIdAndMachineIdAndStatusIn(
                rule.getId(),
                metricRecord.getMachineId(),
                ACTIVE_STATUSES
        );

        boolean thresholdBroken = compare(latestValue, rule.getOperator(), rule.getThresholdValue());
        boolean durationSatisfied = thresholdBroken && durationSatisfied(rule, metricRecord);

        if (durationSatisfied) {
            String message = buildMessage(machineName, rule, latestValue);
            if (activeEvent.isPresent()) {
                activeEvent.get().refresh(latestValue, message);
            } else {
                alertEventRepository.save(AlertEvent.open(
                        rule.getId(),
                        metricRecord.getMachineId(),
                        metricRecord.getRecordedAt(),
                        latestValue,
                        message
                ));
            }
            return;
        }

        activeEvent.ifPresent(event -> event.resolve(metricRecord.getRecordedAt()));
    }

    private boolean durationSatisfied(AlertRule rule, MetricRecord latestRecord) {
        Integer durationSeconds = rule.getDurationSeconds();
        if (durationSeconds == null || durationSeconds <= 0) {
            return true;
        }

        Instant from = latestRecord.getRecordedAt().minusSeconds(durationSeconds);
        List<MetricRecord> records = metricRecordRepository.findByMachineIdAndRecordedAtBetweenOrderByRecordedAtAsc(
                latestRecord.getMachineId(),
                from,
                latestRecord.getRecordedAt()
        );

        if (records.isEmpty()) {
            return false;
        }

        return records.stream()
                .map(record -> valueFor(record, rule.getMetricType()))
                .allMatch(value -> value != null && compare(value, rule.getOperator(), rule.getThresholdValue()));
    }

    private Double valueFor(MetricRecord record, MetricType metricType) {
        return switch (metricType) {
            case CPU -> record.getCpuUsage();
            case RAM -> record.getRamUsage();
            case DISK -> record.getDiskUsage();
            case NET_IN -> record.getNetInKbps();
            case NET_OUT -> record.getNetOutKbps();
        };
    }

    private boolean compare(Double value, ComparisonOperator operator, Double threshold) {
        return switch (operator) {
            case GT -> value > threshold;
            case GTE -> value >= threshold;
            case LT -> value < threshold;
            case LTE -> value <= threshold;
        };
    }

    private String buildMessage(String machineName, AlertRule rule, Double latestValue) {
        return "%s %s is %s, rule is %s %s".formatted(
                machineName,
                rule.getMetricType(),
                format(latestValue),
                rule.getOperator(),
                format(rule.getThresholdValue())
        );
    }

    private String format(Double value) {
        return String.format(Locale.US, "%.2f", value);
    }
}

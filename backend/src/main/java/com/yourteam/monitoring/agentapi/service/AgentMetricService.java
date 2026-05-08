package com.yourteam.monitoring.agentapi.service;

import com.yourteam.monitoring.agentapi.api.AgentMetricIngestRequest;
import com.yourteam.monitoring.agentapi.api.AgentMetricIngestResponse;
import com.yourteam.monitoring.agentapi.api.AgentRegisterRequest;
import com.yourteam.monitoring.alert.service.AlertEvaluationService;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import com.yourteam.monitoring.metric.domain.MetricRecord;
import com.yourteam.monitoring.metric.domain.ProcessMetricRecord;
import com.yourteam.monitoring.metric.repo.MetricRecordRepository;
import com.yourteam.monitoring.metric.repo.ProcessMetricRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AgentMetricService {

    private final MachineRepository machineRepository;
    private final MetricRecordRepository metricRecordRepository;
    private final ProcessMetricRecordRepository processMetricRecordRepository;
    private final AlertEvaluationService alertEvaluationService;

    public AgentMetricService(
            MachineRepository machineRepository,
            MetricRecordRepository metricRecordRepository,
            ProcessMetricRecordRepository processMetricRecordRepository,
            AlertEvaluationService alertEvaluationService
    ) {
        this.machineRepository = machineRepository;
        this.metricRecordRepository = metricRecordRepository;
        this.processMetricRecordRepository = processMetricRecordRepository;
        this.alertEvaluationService = alertEvaluationService;
    }

    @Transactional
    public AgentMetricIngestResponse ingestMetric(AgentMetricIngestRequest request) {
        // Machine binding check:
        // The filter placed the authenticated machine's UUID as the principal.
        // Reject the request if the token belongs to a different machine than
        // the one declared in the payload — prevents one machine spoofing another.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID authenticatedMachineId = (UUID) auth.getPrincipal();
        if (!authenticatedMachineId.equals(request.machineId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Token does not belong to machine: " + request.machineId()
            );
        }

        Machine machine = machineRepository.findById(request.machineId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Machine not found: " + request.machineId()
                ));

        machine.markOnline(request.recordedAt());

        MetricRecord metricRecord = MetricRecord.create(
                request.machineId(),
                request.recordedAt(),
                request.cpuUsage(),
                request.ramUsage(),
                request.diskUsage(),
                request.netInKbps(),
                request.netOutKbps(),
                request.uptimeSeconds()
        );

        MetricRecord saved = metricRecordRepository.save(metricRecord);
        saveProcessMetrics(request, saved);
        alertEvaluationService.evaluate(saved);

        return new AgentMetricIngestResponse(
                saved.getId(),
                saved.getMachineId(),
                saved.getRecordedAt()
        );
    }

    @Transactional
    public void registerMachine(AgentRegisterRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID authenticatedMachineId = (UUID) auth.getPrincipal();
        if (!authenticatedMachineId.equals(request.machineId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Token does not belong to machine: " + request.machineId()
            );
        }

        Machine machine = machineRepository.findById(request.machineId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Machine not found: " + request.machineId()
                ));

        machine.updateSystemInfo(
                request.hostname(),
                request.ipAddress(),
                request.osName(),
                request.agentVersion()
        );
    }

    private void saveProcessMetrics(AgentMetricIngestRequest request, MetricRecord savedMetricRecord) {
        if (request.topProcesses() == null || request.topProcesses().isEmpty()) {
            return;
        }

        List<ProcessMetricRecord> processMetricRecords = request.topProcesses()
                .stream()
                .limit(10)
                .map(process -> ProcessMetricRecord.create(
                        savedMetricRecord.getId(),
                        savedMetricRecord.getMachineId(),
                        savedMetricRecord.getRecordedAt(),
                        process.processId(),
                        process.processName(),
                        process.instanceCount(),
                        process.cpuUsage(),
                        process.ramUsageMb(),
                        process.ramUsagePercent(),
                        process.impactScore()
                ))
                .toList();

        processMetricRecordRepository.saveAll(processMetricRecords);
    }
}

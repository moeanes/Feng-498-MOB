package com.yourteam.monitoring.agentapi.service;

import com.yourteam.monitoring.agentapi.api.AgentMetricIngestRequest;
import com.yourteam.monitoring.agentapi.api.AgentMetricIngestResponse;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import com.yourteam.monitoring.metric.domain.MetricRecord;
import com.yourteam.monitoring.metric.repo.MetricRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AgentMetricService {

    private final MachineRepository machineRepository;
    private final MetricRecordRepository metricRecordRepository;

    public AgentMetricService(
            MachineRepository machineRepository,
            MetricRecordRepository metricRecordRepository
    ) {
        this.machineRepository = machineRepository;
        this.metricRecordRepository = metricRecordRepository;
    }

    @Transactional
    public AgentMetricIngestResponse ingestMetric(AgentMetricIngestRequest request) {
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

        return new AgentMetricIngestResponse(
                saved.getId(),
                saved.getMachineId(),
                saved.getRecordedAt()
        );
    }
}

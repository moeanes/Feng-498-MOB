package com.yourteam.monitoring.machine.service;

import com.yourteam.monitoring.machine.api.CreateMachineRequest;
import com.yourteam.monitoring.machine.api.MachineMetricResponse;
import com.yourteam.monitoring.machine.api.MachineResponse;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import com.yourteam.monitoring.metric.domain.MetricRecord;
import com.yourteam.monitoring.metric.repo.MetricRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MachineService {

    private final MachineRepository machineRepository;
    private final MetricRecordRepository metricRecordRepository;

    public MachineService(
            MachineRepository machineRepository,
            MetricRecordRepository metricRecordRepository
    ) {
        this.machineRepository = machineRepository;
        this.metricRecordRepository = metricRecordRepository;
    }

    public List<MachineResponse> getAllMachines() {
        return machineRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MachineResponse getMachineById(UUID machineId) {
        return toResponse(getMachineOrThrow(machineId));
    }

    public MachineMetricResponse getLatestMetric(UUID machineId) {
        getMachineOrThrow(machineId);
        MetricRecord latest = metricRecordRepository.findTopByMachineIdOrderByRecordedAtDesc(machineId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No metric records found for machine: " + machineId
                ));
        return toMetricResponse(latest);
    }

    public List<MachineMetricResponse> getRecentMetricHistory(UUID machineId) {
        getMachineOrThrow(machineId);
        var records = metricRecordRepository
                .findByMachineIdOrderByRecordedAtDesc(
                        machineId,
                        org.springframework.data.domain.PageRequest.of(0, 200));
        // Reverse so the chart gets oldest-first order
        var reversed = new java.util.ArrayList<>(records);
        java.util.Collections.reverse(reversed);
        return reversed.stream().map(this::toMetricResponse).toList();
    }

    public List<MachineMetricResponse> getMetricHistory(UUID machineId, Instant from, Instant to) {
        getMachineOrThrow(machineId);
        if (from.isAfter(to)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "`from` must be earlier than or equal to `to`"
            );
        }
        return metricRecordRepository.findByMachineIdAndRecordedAtBetweenOrderByRecordedAtAsc(machineId, from, to)
                .stream()
                .map(this::toMetricResponse)
                .toList();
    }

    @Transactional
    public MachineResponse createMachine(CreateMachineRequest request) {
        Machine machine = Machine.create(
                request.name().trim(),
                normalize(request.hostname()),
                normalize(request.ipAddress()),
                normalize(request.osName()),
                normalize(request.agentVersion())
        );
        Machine saved = machineRepository.save(machine);
        return toResponse(saved);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private MachineResponse toResponse(Machine machine) {
        return new MachineResponse(
                machine.getId(),
                machine.getName(),
                machine.getHostname(),
                machine.getIpAddress(),
                machine.getOsName(),
                machine.getAgentVersion(),
                machine.getStatus(),
                machine.getLastSeen(),
                machine.getCreatedAt()
        );
    }

    private Machine getMachineOrThrow(UUID machineId) {
        return machineRepository.findById(machineId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Machine not found: " + machineId
                ));
    }

    private MachineMetricResponse toMetricResponse(MetricRecord metricRecord) {
        return new MachineMetricResponse(
                metricRecord.getId(),
                metricRecord.getMachineId(),
                metricRecord.getRecordedAt(),
                metricRecord.getCpuUsage(),
                metricRecord.getRamUsage(),
                metricRecord.getDiskUsage(),
                metricRecord.getNetInKbps(),
                metricRecord.getNetOutKbps(),
                metricRecord.getUptimeSeconds()
        );
    }
}

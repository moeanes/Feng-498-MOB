package com.yourteam.monitoring.machine.service;

import com.yourteam.monitoring.machine.api.CreateMachineRequest;
import com.yourteam.monitoring.machine.api.MachineResponse;
import com.yourteam.monitoring.machine.domain.Machine;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MachineService {

    private final MachineRepository machineRepository;

    public MachineService(MachineRepository machineRepository) {
        this.machineRepository = machineRepository;
    }

    public List<MachineResponse> getAllMachines() {
        return machineRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MachineResponse getMachineById(UUID machineId) {
        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Machine not found: " + machineId
                ));
        return toResponse(machine);
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
}

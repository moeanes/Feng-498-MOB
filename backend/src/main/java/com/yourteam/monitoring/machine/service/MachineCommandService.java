package com.yourteam.monitoring.machine.service;

import com.yourteam.monitoring.machine.api.KillProcessRequest;
import com.yourteam.monitoring.machine.api.PendingCommandResponse;
import com.yourteam.monitoring.machine.domain.MachineCommand;
import com.yourteam.monitoring.machine.repo.MachineCommandRepository;
import com.yourteam.monitoring.machine.repo.MachineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class MachineCommandService {

    private final MachineCommandRepository commandRepository;
    private final MachineRepository        machineRepository;

    public MachineCommandService(MachineCommandRepository commandRepository,
                                 MachineRepository machineRepository) {
        this.commandRepository = commandRepository;
        this.machineRepository = machineRepository;
    }

    /** Called by the dashboard: enqueues a KILL_PROCESS command. */
    @Transactional
    public void createKillCommand(UUID machineId, KillProcessRequest request) {
        machineRepository.findById(machineId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Machine not found: " + machineId));

        MachineCommand cmd = MachineCommand.createKillProcess(
                machineId, request.pid(), request.processName());
        commandRepository.save(cmd);
    }

    /** Called by the agent: returns its own PENDING commands. */
    @Transactional(readOnly = true)
    public List<PendingCommandResponse> getPendingCommands(UUID machineId) {
        return commandRepository
                .findByMachineIdAndStatus(machineId, "PENDING")
                .stream()
                .map(c -> new PendingCommandResponse(c.getId(), c.getCommandType(), c.getPayload()))
                .toList();
    }

    /**
     * Called by the agent after executing a command.
     * Verifies the command belongs to the calling machine before acknowledging.
     */
    @Transactional
    public void acknowledge(UUID machineId, Long commandId) {
        MachineCommand cmd = commandRepository.findById(commandId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Command not found: " + commandId));

        if (!cmd.getMachineId().equals(machineId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Command does not belong to this machine");
        }

        cmd.acknowledge();
    }
}

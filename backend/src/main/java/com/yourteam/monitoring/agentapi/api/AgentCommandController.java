package com.yourteam.monitoring.agentapi.api;

import com.yourteam.monitoring.machine.api.PendingCommandResponse;
import com.yourteam.monitoring.machine.service.MachineCommandService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Endpoints called by the monitoring agent to receive and acknowledge commands.
 *
 * Authentication: machine token (same filter chain as /api/v1/agent/metrics).
 * The authenticated machine UUID is read from the security context so an agent
 * can only see and acknowledge its own commands.
 */
@RestController
@RequestMapping("/api/v1/agent/commands")
public class AgentCommandController {

    private final MachineCommandService machineCommandService;

    public AgentCommandController(MachineCommandService machineCommandService) {
        this.machineCommandService = machineCommandService;
    }

    /** Returns the list of PENDING commands for the calling agent's machine. */
    @GetMapping("/pending")
    public List<PendingCommandResponse> getPendingCommands() {
        UUID machineId = authenticatedMachineId();
        return machineCommandService.getPendingCommands(machineId);
    }

    /** Marks a command as ACKNOWLEDGED after the agent has executed it. */
    @PostMapping("/{commandId}/ack")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void acknowledge(@PathVariable Long commandId) {
        UUID machineId = authenticatedMachineId();
        machineCommandService.acknowledge(machineId, commandId);
    }

    private UUID authenticatedMachineId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (UUID) auth.getPrincipal();
    }
}

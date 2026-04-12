package com.yourteam.monitoring.machine.api;

import com.yourteam.monitoring.machine.service.MachineService;
import com.yourteam.monitoring.machine.service.MachineTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/machines")
public class MachineController {

    private final MachineService machineService;
    private final MachineTokenService machineTokenService;

    public MachineController(MachineService machineService,
                             MachineTokenService machineTokenService) {
        this.machineService      = machineService;
        this.machineTokenService = machineTokenService;
    }

    @GetMapping
    public List<MachineResponse> getMachines() {
        return machineService.getAllMachines();
    }

    @GetMapping("/{machineId}")
    public MachineResponse getMachine(@PathVariable UUID machineId) {
        return machineService.getMachineById(machineId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MachineResponse createMachine(@Valid @RequestBody CreateMachineRequest request) {
        return machineService.createMachine(request);
    }

    /**
     * Issues a new token for the machine.
     * Returns the plain-text token — shown only once, never stored.
     * The caller (operator) must copy this into agent.properties immediately.
     */
    @PostMapping("/{machineId}/tokens")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueTokenResponse issueToken(@PathVariable UUID machineId) {
        String plainToken = machineTokenService.issueToken(machineId);
        return new IssueTokenResponse(machineId, plainToken);
    }

    /**
     * Revokes all active tokens for the machine.
     * The agent will receive 401 on its next metric send until a new token is issued.
     */
    @DeleteMapping("/{machineId}/tokens")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeTokens(@PathVariable UUID machineId) {
        machineTokenService.revokeAllTokens(machineId);
    }
}

package com.yourteam.monitoring.machine.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "machine_commands")
public class MachineCommand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "machine_id", nullable = false)
    private UUID machineId;

    @Column(name = "command_type", nullable = false)
    private String commandType;

    /** JSON payload. For KILL_PROCESS: {"pid":1234,"processName":"java.exe"} */
    @Column(name = "payload", nullable = false)
    private String payload;

    /** PENDING or ACKNOWLEDGED */
    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    protected MachineCommand() {}

    public static MachineCommand createKillProcess(UUID machineId, int pid, String processName) {
        // Minimal JSON construction — no untrusted user content is interpolated
        // without escaping because processName comes from the frontend which reads
        // it from the process list sent by the agent itself.
        // We still escape the two characters that would break JSON string literals.
        String safeName = processName.replace("\\", "\\\\").replace("\"", "\\\"");
        MachineCommand cmd = new MachineCommand();
        cmd.machineId   = machineId;
        cmd.commandType = "KILL_PROCESS";
        cmd.payload     = "{\"pid\":" + pid + ",\"processName\":\"" + safeName + "\"}";
        cmd.status      = "PENDING";
        cmd.createdAt   = Instant.now();
        return cmd;
    }

    public void acknowledge() {
        this.status          = "ACKNOWLEDGED";
        this.acknowledgedAt  = Instant.now();
    }

    public Long    getId()            { return id; }
    public UUID    getMachineId()     { return machineId; }
    public String  getCommandType()   { return commandType; }
    public String  getPayload()       { return payload; }
    public String  getStatus()        { return status; }
    public Instant getCreatedAt()     { return createdAt; }
    public Instant getAcknowledgedAt(){ return acknowledgedAt; }
}

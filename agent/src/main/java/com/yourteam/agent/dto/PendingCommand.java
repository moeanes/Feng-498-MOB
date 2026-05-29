package com.yourteam.agent.dto;

/**
 * Represents a single pending command returned by the backend's
 * GET /api/v1/agent/commands/pending endpoint.
 *
 * payload is a raw JSON string whose structure depends on commandType.
 * For KILL_PROCESS: {"pid":1234,"processName":"java.exe"}
 */
public class PendingCommand {

    private long   id;
    private String commandType;
    private String payload;

    /** Required by Jackson for deserialization. */
    public PendingCommand() {}

    public long   getId()          { return id; }
    public String getCommandType() { return commandType; }
    public String getPayload()     { return payload; }

    public void setId(long id)                   { this.id = id; }
    public void setCommandType(String commandType){ this.commandType = commandType; }
    public void setPayload(String payload)        { this.payload = payload; }
}

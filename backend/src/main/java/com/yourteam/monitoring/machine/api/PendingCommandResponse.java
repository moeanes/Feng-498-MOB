package com.yourteam.monitoring.machine.api;

/** Returned to the agent when it polls for pending commands. */
public record PendingCommandResponse(
        Long   id,
        String commandType,
        String payload
) {}

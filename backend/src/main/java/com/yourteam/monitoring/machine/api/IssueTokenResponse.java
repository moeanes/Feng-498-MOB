package com.yourteam.monitoring.machine.api;

import java.util.UUID;

/**
 * Returned by POST /api/v1/machines/{machineId}/tokens.
 *
 * plainToken is the only time the raw token value is visible.
 * It must be copied into agent.properties immediately — it cannot
 * be retrieved again because the backend stores only the hash.
 */
public record IssueTokenResponse(
        UUID machineId,
        String plainToken
) {
}

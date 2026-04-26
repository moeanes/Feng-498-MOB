package com.yourteam.agent.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;
import java.util.UUID;

/**
 * Loads agent.properties and exposes each setting as a strongly-typed public final field.
 *
 * Config resolution order:
 *   1. agent.properties in the current working directory (same folder as the JAR).
 *      This is the deployment path — each Windows machine has its own config file
 *      next to the JAR without requiring a rebuild.
 *   2. agent.properties on the classpath (src/main/resources/).
 *      This is the development fallback so local runs still work without changes.
 *
 * Validation happens at construction time: if a required key is missing
 * or malformed the agent refuses to start with a clear error message,
 * rather than failing silently during the first metric send.
 */
public class AgentConfig {

    /** Base URL of the backend (e.g. http://localhost:8080). No trailing slash. */
    public final String backendUrl;

    /** UUID of this machine as registered in the backend. */
    public final UUID machineId;

    /**
     * Plain-text token issued by the backend for this machine.
     * Sent as "Authorization: Bearer <token>" on every request.
     */
    public final String machineToken;

    /** Seconds between each metric collection and send cycle. */
    public final int intervalSeconds;

    public AgentConfig() {
        Properties props = new Properties();
        File externalConfig = new File("agent.properties");
        try {
            if (externalConfig.exists()) {
                // Deployment path: read from the folder where the JAR lives
                try (InputStream in = new FileInputStream(externalConfig)) {
                    props.load(in);
                }
            } else {
                // Development fallback: read from classpath (src/main/resources/)
                try (InputStream in = getClass().getClassLoader()
                        .getResourceAsStream("agent.properties")) {
                    if (in == null) {
                        throw new IllegalStateException(
                                "agent.properties not found. " +
                                "Place agent.properties in the same folder as the JAR " +
                                "(deployment), or in src/main/resources/ (development).");
                    }
                    props.load(in);
                }
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load agent.properties", e);
        }

        this.backendUrl      = require(props, "agent.backend-url");
        this.machineId       = parseMachineId(props);
        this.machineToken    = require(props, "agent.machine-token");
        this.intervalSeconds = parseInterval(props);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static String require(Properties props, String key) {
        String value = props.getProperty(key);
        if (value == null || value.isBlank() || value.startsWith("REPLACE-WITH")) {
            throw new IllegalStateException(
                    "Required config key is missing or not set: " + key);
        }
        return value.trim();
    }

    private UUID parseMachineId(Properties props) {
        String raw = require(props, "agent.machine-id");
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "agent.machine-id is not a valid UUID: " + raw);
        }
    }

    private int parseInterval(Properties props) {
        String raw = props.getProperty("agent.interval-seconds", "10").trim();
        try {
            int value = Integer.parseInt(raw);
            if (value < 1) throw new IllegalStateException(
                    "agent.interval-seconds must be >= 1, got: " + value);
            return value;
        } catch (NumberFormatException e) {
            throw new IllegalStateException(
                    "agent.interval-seconds is not a valid integer: " + raw);
        }
    }
}

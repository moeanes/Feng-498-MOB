package com.yourteam.agent.sender;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourteam.agent.config.AgentConfig;
import com.yourteam.agent.dto.PendingCommand;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Polls the backend every 5 seconds for pending commands and executes them.
 *
 * Currently supports one command type:
 *   KILL_PROCESS — forcibly terminates the process with the given PID using
 *   Java's ProcessHandle API (available on Windows, macOS, Linux with Java 9+).
 *
 * After executing a command the poller sends an ACK to the backend so the
 * command is not delivered again on the next poll.
 *
 * The poller runs on its own daemon thread so it does not interfere with the
 * metric scheduler and does not prevent JVM shutdown on its own.
 */
public class CommandPoller {

    private static final String PENDING_ENDPOINT = "/api/v1/agent/commands/pending";
    private static final String ACK_ENDPOINT     = "/api/v1/agent/commands/%d/ack";
    private static final int    POLL_SECONDS     = 5;

    private final AgentConfig config;
    private final HttpClient  httpClient;
    private final ObjectMapper mapper;

    private final ScheduledExecutorService executor =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "command-poller");
                t.setDaemon(true); // daemon — does not keep JVM alive alone
                return t;
            });

    public CommandPoller(AgentConfig config) {
        this.config     = config;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mapper = new ObjectMapper();
    }

    public void start() {
        executor.scheduleAtFixedRate(this::pollAndExecute,
                POLL_SECONDS, POLL_SECONDS, TimeUnit.SECONDS);
        System.out.println("[CommandPoller] Started — polling every " + POLL_SECONDS + "s");
    }

    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    // -----------------------------------------------------------------------

    private void pollAndExecute() {
        try {
            List<PendingCommand> commands = fetchPendingCommands();
            for (PendingCommand cmd : commands) {
                try {
                    execute(cmd);
                } catch (Exception e) {
                    System.err.printf("[CommandPoller] Execution error for command %d: %s%n",
                            cmd.getId(), e.getMessage());
                    // Do not skip ACK — if execution itself raised an unexpected exception,
                    // ACK anyway so the command doesn't loop. The error is already logged.
                }
                try {
                    acknowledge(cmd.getId());
                } catch (Exception e) {
                    System.err.printf("[CommandPoller] ACK failed for command %d (will retry next poll): %s%n",
                            cmd.getId(), e.getMessage());
                    // Not ACKed — the command will reappear on the next poll.
                    // execute() is idempotent for KILL_PROCESS (killing an already-dead PID is harmless).
                }
            }
        } catch (Exception e) {
            // Log and continue — a transient network error must not stop polling
            System.err.printf("[CommandPoller] Poll error: %s%n", e.getMessage());
        }
    }

    private List<PendingCommand> fetchPendingCommands() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(config.backendUrl + PENDING_ENDPOINT))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + config.machineToken)
                .GET()
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.err.printf("[CommandPoller] Pending fetch returned %d%n",
                    response.statusCode());
            return List.of();
        }

        return mapper.readValue(response.body(),
                new TypeReference<List<PendingCommand>>() {});
    }

    private void execute(PendingCommand cmd) {
        if (!"KILL_PROCESS".equals(cmd.getCommandType())) {
            System.err.printf("[CommandPoller] Unknown command type: %s%n",
                    cmd.getCommandType());
            return;
        }

        // Parse pid from payload — minimal hand-rolled extraction to avoid
        // a full JSON parse dependency just for one integer field.
        int pid = extractPid(cmd.getPayload());
        if (pid < 1) {
            System.err.printf("[CommandPoller] Invalid pid in payload: %s%n",
                    cmd.getPayload());
            return;
        }

        ProcessHandle.of(pid).ifPresentOrElse(
                handle -> {
                    handle.destroyForcibly();
                    System.out.printf("[CommandPoller] Killed PID %d%n", pid);
                },
                () -> System.out.printf("[CommandPoller] PID %d not found (may have already exited)%n", pid)
        );
    }

    private void acknowledge(long commandId) throws Exception {
        String url = config.backendUrl + String.format(ACK_ENDPOINT, commandId);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + config.machineToken)
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 204) {
            System.err.printf("[CommandPoller] ACK failed for command %d: %d%n",
                    commandId, response.statusCode());
        }
    }

    /**
     * Extracts the "pid" integer from a JSON string like {"pid":1234,...}.
     * Returns -1 if the field is missing or cannot be parsed.
     */
    private static int extractPid(String payload) {
        try {
            int start = payload.indexOf("\"pid\"");
            if (start < 0) return -1;
            int colon = payload.indexOf(':', start);
            if (colon < 0) return -1;
            // Skip whitespace after colon
            int valueStart = colon + 1;
            while (valueStart < payload.length() &&
                   Character.isWhitespace(payload.charAt(valueStart))) {
                valueStart++;
            }
            int valueEnd = valueStart;
            while (valueEnd < payload.length() &&
                   (Character.isDigit(payload.charAt(valueEnd)) ||
                    payload.charAt(valueEnd) == '-')) {
                valueEnd++;
            }
            return Integer.parseInt(payload.substring(valueStart, valueEnd));
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}

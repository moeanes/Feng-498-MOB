package com.yourteam.agent.sender;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.yourteam.agent.config.AgentConfig;
import com.yourteam.agent.dto.MetricPayload;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Sends a MetricPayload to the backend via HTTP POST.
 *
 * How it works:
 *
 *  1. Jackson serializes the MetricPayload to a JSON string.
 *     JavaTimeModule is registered so that java.time.Instant is written
 *     as an ISO-8601 string (e.g. "2026-04-12T10:00:00Z") instead of an
 *     epoch-millisecond array, which is what the backend expects.
 *
 *  2. The JSON is placed in the request body with Content-Type: application/json.
 *
 *  3. The machine token is attached as:
 *       Authorization: Bearer <token>
 *     The backend's AgentMetricController reads this header to authenticate
 *     the agent before processing the payload.
 *
 *  4. The request is sent synchronously (httpClient.send).
 *     A 10-second connect+read timeout prevents the agent from hanging
 *     indefinitely if the backend is unreachable.
 *
 *  5. The response status is checked:
 *     - 201 Created  → success, log a brief confirmation.
 *     - anything else → log the status and response body so the problem
 *       is visible without crashing the agent.
 *
 *  The HttpClient and ObjectMapper are created once at construction time
 *  and reused for every send to avoid object creation overhead per tick.
 */
public class MetricSender {

    private static final String METRICS_ENDPOINT = "/api/v1/agent/metrics";
    private static final int HTTP_CREATED = 201;

    private final AgentConfig config;
    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    public MetricSender(AgentConfig config) {
        this.config = config;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                // Write Instant as ISO-8601 string, not as [seconds, nanos] array
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Serializes the payload to JSON and POSTs it to the backend.
     *
     * @param payload the metric snapshot to send
     * @throws Exception if serialization or the HTTP call itself fails
     *         (caller — MetricScheduler — catches this and logs it)
     */
    public void send(MetricPayload payload) throws Exception {
        String json = mapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(config.backendUrl + METRICS_ENDPOINT))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + config.machineToken)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == HTTP_CREATED) {
            System.out.printf("[Sender] OK (201) — recordedAt=%s%n", payload.recordedAt);
        } else {
            System.err.printf("[Sender] Unexpected response %d — body: %s%n",
                    response.statusCode(), response.body());
        }
    }
}

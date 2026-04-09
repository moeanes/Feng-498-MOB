package com.yourteam.monitoring.agentapi.api;

import com.yourteam.monitoring.agentapi.service.AgentMetricService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentMetricController {

    private final AgentMetricService agentMetricService;

    public AgentMetricController(AgentMetricService agentMetricService) {
        this.agentMetricService = agentMetricService;
    }

    @PostMapping("/metrics")
    @ResponseStatus(HttpStatus.CREATED)
    public AgentMetricIngestResponse ingestMetric(@Valid @RequestBody AgentMetricIngestRequest request) {
        return agentMetricService.ingestMetric(request);
    }
}

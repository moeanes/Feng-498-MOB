package com.yourteam.monitoring.alert.api;

import com.yourteam.monitoring.alert.service.AlertEventService;
import com.yourteam.monitoring.auth.service.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertEventController {

    private final AlertEventService alertEventService;

    public AlertEventController(AlertEventService alertEventService) {
        this.alertEventService = alertEventService;
    }

    @GetMapping
    public List<AlertEventResponse> getAlerts() {
        return alertEventService.getAlerts();
    }

    @GetMapping("/open")
    public List<AlertEventResponse> getOpenAlerts() {
        return alertEventService.getOpenAlerts();
    }

    @PostMapping("/{alertId}/ack")
    public AlertEventResponse acknowledge(@PathVariable UUID alertId, Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return alertEventService.acknowledge(alertId, user.id());
    }

    @PostMapping("/{alertId}/resolve")
    public AlertEventResponse resolve(@PathVariable UUID alertId) {
        return alertEventService.resolve(alertId);
    }
}

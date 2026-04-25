package com.yourteam.monitoring.common.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public HomeResponse home() {
        return new HomeResponse(
                "monitoring-backend",
                "UP",
                "This is the backend API server. The React dashboard is deployed separately.",
                List.of(
                        "/actuator/health",
                        "/api/v1/machines",
                        "/api/v1/machines/{machineId}",
                        "/api/v1/machines/{machineId}/latest",
                        "/api/v1/machines/{machineId}/metrics?from=...&to=..."
                )
        );
    }

    public record HomeResponse(
            String service,
            String status,
            String message,
            List<String> endpoints
    ) {
    }
}

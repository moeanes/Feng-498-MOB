package com.yourteam.monitoring.alert.api;

import com.yourteam.monitoring.alert.service.AlertRuleService;
import com.yourteam.monitoring.auth.service.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alert-rules")
public class AlertRuleController {

    private final AlertRuleService alertRuleService;

    public AlertRuleController(AlertRuleService alertRuleService) {
        this.alertRuleService = alertRuleService;
    }

    @GetMapping
    public List<AlertRuleResponse> getRules() {
        return alertRuleService.getRules();
    }

    @GetMapping("/{ruleId}")
    public AlertRuleResponse getRule(@PathVariable UUID ruleId) {
        return alertRuleService.getRule(ruleId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AlertRuleResponse createRule(@Valid @RequestBody CreateAlertRuleRequest request,
                                        Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return alertRuleService.createRule(request, user.id());
    }

    @PutMapping("/{ruleId}")
    public AlertRuleResponse updateRule(@PathVariable UUID ruleId,
                                        @Valid @RequestBody UpdateAlertRuleRequest request) {
        return alertRuleService.updateRule(ruleId, request);
    }

    @DeleteMapping("/{ruleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(@PathVariable UUID ruleId) {
        alertRuleService.deleteRule(ruleId);
    }
}

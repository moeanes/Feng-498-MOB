package com.yourteam.monitoring.alert.repo;

import com.yourteam.monitoring.alert.domain.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AlertRuleRepository extends JpaRepository<AlertRule, UUID> {

    List<AlertRule> findAllByOrderByCreatedAtDesc();

    @Query("""
            select rule
            from AlertRule rule
            where rule.enabled = true
              and (rule.machineId is null or rule.machineId = :machineId)
            """)
    List<AlertRule> findEnabledRulesForMachine(@Param("machineId") UUID machineId);
}

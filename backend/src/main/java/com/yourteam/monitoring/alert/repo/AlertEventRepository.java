package com.yourteam.monitoring.alert.repo;

import com.yourteam.monitoring.alert.domain.AlertEvent;
import com.yourteam.monitoring.alert.domain.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlertEventRepository extends JpaRepository<AlertEvent, UUID> {

    List<AlertEvent> findAllByOrderByStartedAtDesc();

    List<AlertEvent> findByStatusOrderByStartedAtDesc(AlertStatus status);

    Optional<AlertEvent> findByRuleIdAndMachineIdAndStatusIn(UUID ruleId, UUID machineId, List<AlertStatus> statuses);
}

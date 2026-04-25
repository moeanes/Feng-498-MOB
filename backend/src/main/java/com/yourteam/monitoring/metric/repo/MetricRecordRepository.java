package com.yourteam.monitoring.metric.repo;

import com.yourteam.monitoring.metric.domain.MetricRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MetricRecordRepository extends JpaRepository<MetricRecord, Long> {

    Optional<MetricRecord> findTopByMachineIdOrderByRecordedAtDesc(UUID machineId);

    List<MetricRecord> findByMachineIdAndRecordedAtBetweenOrderByRecordedAtAsc(
            UUID machineId,
            Instant from,
            Instant to
    );
}

package com.yourteam.monitoring.metric.repo;

import com.yourteam.monitoring.metric.domain.MetricRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MetricRecordRepository extends JpaRepository<MetricRecord, Long> {

    /** Returns the 30 most recent metric records for a machine, newest first. */
    List<MetricRecord> findTop30ByMachineIdOrderByRecordedAtDesc(UUID machineId);

    /** Returns the single most recent metric record for a machine. */
    Optional<MetricRecord> findTopByMachineIdOrderByRecordedAtDesc(UUID machineId);

    /** Returns all metric records for a machine within the given time range, oldest first. */
    List<MetricRecord> findByMachineIdAndRecordedAtBetweenOrderByRecordedAtAsc(UUID machineId, Instant from, Instant to);

    /** Returns the most recent N records for a machine, newest first — caller reverses for chart. */
    List<MetricRecord> findByMachineIdOrderByRecordedAtDesc(UUID machineId, org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Query("DELETE FROM MetricRecord m WHERE m.recordedAt < :cutoff")
    int deleteByRecordedAtBefore(@Param("cutoff") Instant cutoff);
}

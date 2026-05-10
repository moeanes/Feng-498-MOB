package com.yourteam.monitoring.metric.repo;

import com.yourteam.monitoring.metric.domain.ProcessMetricRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ProcessMetricRecordRepository extends JpaRepository<ProcessMetricRecord, Long> {

    /** Returns the process/application rows that belong to one machine metric snapshot. */
    List<ProcessMetricRecord> findByMetricRecordIdOrderByImpactScoreDesc(Long metricRecordId);

    @Modifying
    @Query("DELETE FROM ProcessMetricRecord p WHERE p.recordedAt < :cutoff")
    int deleteByRecordedAtBefore(@Param("cutoff") Instant cutoff);
}

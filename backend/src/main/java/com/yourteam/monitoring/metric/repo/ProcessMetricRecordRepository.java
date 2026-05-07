package com.yourteam.monitoring.metric.repo;

import com.yourteam.monitoring.metric.domain.ProcessMetricRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcessMetricRecordRepository extends JpaRepository<ProcessMetricRecord, Long> {

    /** Returns the process/application rows that belong to one machine metric snapshot. */
    List<ProcessMetricRecord> findByMetricRecordIdOrderByImpactScoreDesc(Long metricRecordId);
}

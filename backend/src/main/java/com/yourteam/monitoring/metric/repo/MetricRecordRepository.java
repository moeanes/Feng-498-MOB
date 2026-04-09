package com.yourteam.monitoring.metric.repo;

import com.yourteam.monitoring.metric.domain.MetricRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricRecordRepository extends JpaRepository<MetricRecord, Long> {
}

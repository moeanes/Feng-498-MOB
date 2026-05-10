package com.yourteam.monitoring.metric;

import com.yourteam.monitoring.metric.repo.MetricRecordRepository;
import com.yourteam.monitoring.metric.repo.ProcessMetricRecordRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class MetricCleanupJob {

    private final MetricRecordRepository metricRecordRepository;
    private final ProcessMetricRecordRepository processMetricRecordRepository;

    public MetricCleanupJob(MetricRecordRepository metricRecordRepository,
                            ProcessMetricRecordRepository processMetricRecordRepository) {
        this.metricRecordRepository = metricRecordRepository;
        this.processMetricRecordRepository = processMetricRecordRepository;
    }

    // Runs every hour, deletes records older than 24 hours
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void deleteOldMetrics() {
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);

        // Process records must be deleted first (FK references metric_records.id)
        int processRows = processMetricRecordRepository.deleteByRecordedAtBefore(cutoff);
        int metricRows = metricRecordRepository.deleteByRecordedAtBefore(cutoff);

        if (metricRows > 0 || processRows > 0) {
            System.out.printf("[MetricCleanupJob] Deleted %d metric rows and %d process rows older than 24h%n",
                    metricRows, processRows);
        }
    }
}

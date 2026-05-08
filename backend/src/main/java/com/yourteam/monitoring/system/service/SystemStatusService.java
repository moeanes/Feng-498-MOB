package com.yourteam.monitoring.system.service;

import com.yourteam.monitoring.system.api.SystemStatusResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SystemStatusService {

    private static final String VERSION = "0.1.0";

    private final JdbcTemplate jdbcTemplate;

    public SystemStatusService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SystemStatusResponse getStatus() {
        String databaseStatus = databaseIsReachable() ? "UP" : "DOWN";
        return new SystemStatusResponse(
                "UP",
                databaseStatus,
                countLong("SELECT COUNT(*) FROM machines"),
                countLong("SELECT COUNT(*) FROM machines WHERE status = 'ONLINE'"),
                countLong("SELECT COUNT(*) FROM alert_events WHERE status = 'OPEN'"),
                queryString("SELECT MAX(recorded_at)::text FROM metric_records"),
                VERSION
        );
    }

    private boolean databaseIsReachable() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return result != null && result == 1;
        } catch (Exception ex) {
            return false;
        }
    }

    private long countLong(String sql) {
        try {
            Long value = jdbcTemplate.queryForObject(sql, Long.class);
            return value == null ? 0 : value;
        } catch (Exception ex) {
            return 0;
        }
    }

    private String queryString(String sql) {
        try {
            return jdbcTemplate.queryForObject(sql, String.class);
        } catch (Exception ex) {
            return null;
        }
    }
}

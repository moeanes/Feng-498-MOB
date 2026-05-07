CREATE TABLE process_metric_records (
    id BIGSERIAL PRIMARY KEY,
    metric_record_id BIGINT NOT NULL REFERENCES metric_records(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    process_id INTEGER,
    process_name VARCHAR(255) NOT NULL,
    instance_count INTEGER NOT NULL DEFAULT 1,
    cpu_usage DOUBLE PRECISION NOT NULL,
    ram_usage_mb DOUBLE PRECISION NOT NULL,
    ram_usage_percent DOUBLE PRECISION NOT NULL,
    impact_score DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_process_metric_record ON process_metric_records (metric_record_id, impact_score DESC);
CREATE INDEX idx_process_metric_machine_time ON process_metric_records (machine_id, recorded_at DESC);

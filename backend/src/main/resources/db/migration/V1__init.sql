CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'VIEWER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    hostname VARCHAR(255),
    ip_address VARCHAR(64),
    os_name VARCHAR(120),
    agent_version VARCHAR(40),
    status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE')),
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE machine_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE TABLE metric_records (
    id BIGSERIAL PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    cpu_usage DOUBLE PRECISION NOT NULL,
    ram_usage DOUBLE PRECISION NOT NULL,
    disk_usage DOUBLE PRECISION NOT NULL,
    net_in_kbps DOUBLE PRECISION,
    net_out_kbps DOUBLE PRECISION,
    uptime_seconds BIGINT
);

CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    metric_type VARCHAR(30) NOT NULL CHECK (metric_type IN ('CPU', 'RAM', 'DISK', 'NET_IN', 'NET_OUT')),
    operator VARCHAR(10) NOT NULL CHECK (operator IN ('GT', 'GTE', 'LT', 'LTE')),
    threshold_value DOUBLE PRECISION NOT NULL,
    duration_seconds INTEGER NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'ACKED', 'RESOLVED')),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    last_value DOUBLE PRECISION,
    message VARCHAR(400),
    acked_by UUID REFERENCES users(id),
    acked_at TIMESTAMPTZ
);

CREATE INDEX idx_metric_machine_time ON metric_records (machine_id, recorded_at DESC);
CREATE INDEX idx_metric_recorded_time ON metric_records (recorded_at DESC);
CREATE INDEX idx_machines_last_seen ON machines (last_seen);
CREATE INDEX idx_alert_events_status_started ON alert_events (status, started_at DESC);

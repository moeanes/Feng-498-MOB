INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2a$10$nhGe76QHjGcIdkmWgK8RG.KuuC9Hvy7sXb.7ZAvIpT3YgE/LPQ2wK', 'ADMIN')
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

CREATE INDEX IF NOT EXISTS idx_machine_tokens_hash_active
ON machine_tokens (token_hash, is_active);

CREATE INDEX IF NOT EXISTS idx_alert_rules_machine_enabled
ON alert_rules (machine_id, enabled);

CREATE INDEX IF NOT EXISTS idx_alert_events_rule_machine_status
ON alert_events (rule_id, machine_id, status);

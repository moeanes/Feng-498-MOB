CREATE TABLE machine_commands (
    id               BIGSERIAL    PRIMARY KEY,
    machine_id       UUID         NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    command_type     VARCHAR(50)  NOT NULL,
    payload          TEXT         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    acknowledged_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_machine_commands_machine_status
    ON machine_commands (machine_id, status);

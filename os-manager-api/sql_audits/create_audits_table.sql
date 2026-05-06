-- TABELA DE AUDITORIA (Laravel Auditing)
-- Schema: core 

CREATE TABLE IF NOT EXISTS core.audits (
    id              BIGSERIAL       PRIMARY KEY,
    user_type       VARCHAR(255)    NULL,
    user_id         BIGINT          NULL,
    event           VARCHAR(255)    NOT NULL,
    auditable_type  VARCHAR(255)    NOT NULL,
    auditable_id    BIGINT          NOT NULL,
    old_values       TEXT           NULL,
    new_values       TEXT           NULL,
    url              TEXT           NULL,
    ip_address      VARCHAR(45)     NULL,
    user_agent       TEXT           NULL,
    tags            VARCHAR(255)    NULL,
    created_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA PERFORMANCE

CREATE INDEX IF NOT EXISTS idx_audits_auditable
    ON core.audits (auditable_type, auditable_id);

CREATE INDEX IF NOT EXISTS idx_audits_user
    ON core.audits (user_type, user_id);

CREATE INDEX IF NOT EXISTS idx_audits_created_at
    ON core.audits (created_at);

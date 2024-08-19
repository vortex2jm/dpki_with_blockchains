CREATE TABLE IF NOT EXISTS Certificates (
    id TEXT PRIMARY KEY,
    raw_cert TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    locality TEXT NOT NULL,
    organization TEXT NOT NULL,
    common_name TEXT NOT NULL,
    active BOOLEAN NOT NULL,
    generation_date TEXT NOT NULL,
    expiration_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
)

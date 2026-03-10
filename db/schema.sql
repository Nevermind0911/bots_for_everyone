-- BotWork database schema
-- Применяется автоматически при первом запуске app.py

CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    contact     TEXT    NOT NULL,
    bot_type    TEXT,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    contact    TEXT    NOT NULL,
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

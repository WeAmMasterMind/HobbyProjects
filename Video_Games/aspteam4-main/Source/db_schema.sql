PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    user_score INTEGER NOT NULL
);

INSERT INTO users ('user_name','user_score') VALUES ('Nelson', '176');
INSERT INTO users ('user_name','user_score') VALUES ('Wiam', '150');
COMMIT;
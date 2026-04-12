-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed with initial user (password: #Reviews@2026!! hashed with SHA-256)
INSERT INTO users (email, password_hash, name)
VALUES (
  'marketing@andofoods.co',
  '6b0ed8737ffbe4a69ab232f1d883b3393faf1924a9cb44cea8e7d5262ccbce37',
  'Marketing'
);

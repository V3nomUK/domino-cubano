CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  edit_token_hash TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at);

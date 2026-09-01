-- Paper-trading state. Stores only basic data; all valuation is computed live
-- from the latest index value at request time (no prices are stored here).

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT UNIQUE NOT NULL,
  pass_hash  TEXT NOT NULL,
  cash       REAL NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);

-- One row per (user, index, weighting method): net units + total cost basis.
CREATE TABLE IF NOT EXISTS positions (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  weighting TEXT NOT NULL,
  units     REAL NOT NULL DEFAULT 0,
  cost      REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, slug, weighting)
);

CREATE TABLE IF NOT EXISTS trades (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  weighting TEXT NOT NULL,
  side      TEXT NOT NULL,          -- 'buy' | 'sell'
  units     REAL NOT NULL,
  price     REAL NOT NULL,          -- spot price per unit at trade time
  amount    REAL NOT NULL,          -- units * price
  ts        INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_ts ON trades(user_id, ts DESC);

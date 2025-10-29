CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  wallet_address TEXT,
  kyc_status TEXT DEFAULT 'unverified'
);

CREATE TABLE IF NOT EXISTS balances (
  user_id TEXT REFERENCES users(id),
  currency TEXT NOT NULL,
  amount_hot NUMERIC DEFAULT 0,
  amount_cold NUMERIC DEFAULT 0,
  PRIMARY KEY (user_id, currency)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  onchain_tx TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdraw_requests (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  amount NUMERIC NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  server_seed_hash TEXT NOT NULL,
  server_seed TEXT,
  nonce INT DEFAULT 0,
  status TEXT,
  start_at TIMESTAMP,
  resolve_at TIMESTAMP,
  result NUMERIC
);

CREATE TABLE IF NOT EXISTS bets (
  id TEXT PRIMARY KEY,
  round_id TEXT REFERENCES rounds(id),
  user_id TEXT REFERENCES users(id),
  amount NUMERIC NOT NULL,
  choice TEXT,
  status TEXT
);

-- seed demo user
INSERT INTO users(id, wallet_address, kyc_status) VALUES ('demo','linera_demo','verified') ON CONFLICT (id) DO NOTHING;
INSERT INTO balances(user_id, currency, amount_hot, amount_cold) VALUES ('demo','PRED',1000,0) ON CONFLICT (user_id, currency) DO NOTHING;

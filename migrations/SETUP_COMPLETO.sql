-- =============================================
-- SETUP COMPLETO DO BANCO - TOCA ESSA
-- Cole todo este conteúdo no Console do D1
-- =============================================

-- TABELAS PRINCIPAIS
CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  user_id INTEGER,
  active INTEGER DEFAULT 1,
  license_amount DECIMAL(10,2) DEFAULT 199.00,
  qr_code_data TEXT,
  qr_code_generated_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'artist',
  email_verified INTEGER DEFAULT 0,
  license_paid INTEGER DEFAULT 0,
  license_paid_at DATETIME,
  license_payment_id TEXT,
  account_paid INTEGER DEFAULT 0,
  payment_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_date DATETIME,
  payment_method TEXT,
  payment_transaction_id TEXT,
  license_status TEXT DEFAULT 'pending',
  license_payment_proof TEXT,
  license_paid_date DATETIME,
  license_approved_date DATETIME,
  license_approved_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  genre TEXT,
  duration INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS song_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  song_id INTEGER NOT NULL,
  requester_name TEXT,
  requester_message TEXT,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  tip_message TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  sender_name TEXT,
  message TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  account_type TEXT NOT NULL,
  pix_key TEXT,
  pix_key_type TEXT,
  bank_code TEXT,
  bank_name TEXT,
  agency TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  account_holder_document TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  venue_name TEXT NOT NULL,
  show_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS license_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 199.00,
  payment_proof TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_date DATETIME,
  approved_by INTEGER,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_bank_account (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_type TEXT NOT NULL,
  pix_key TEXT,
  pix_type TEXT,
  bank_name TEXT,
  agency TEXT,
  account_number TEXT,
  account_holder TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_artist_id ON song_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_tips_artist_id ON tips(artist_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_artist_id ON bank_accounts(artist_id);
CREATE INDEX IF NOT EXISTS idx_license_payments_user_id ON license_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

-- DADOS INICIAIS
INSERT OR IGNORE INTO app_settings (setting_key, setting_value, description) VALUES
  ('app_name', 'TOCA ESSA', 'Nome do aplicativo'),
  ('primary_color', '#3B82F6', 'Cor primária'),
  ('secondary_color', '#10B981', 'Cor secundária'),
  ('logo_url', '', 'URL do logo'),
  ('welcome_message', 'Escolha o artista que está tocando agora', 'Mensagem de boas-vindas'),
  ('footer_text', '© 2024 TOCA ESSA', 'Texto do rodapé'),
  ('enable_tips', 'true', 'Habilitar gorjetas'),
  ('min_tip_amount', '5', 'Valor mínimo de gorjeta');

INSERT OR IGNORE INTO admin_bank_account (account_type, pix_key, pix_type) VALUES
  ('pix', 'admin@tocaessa.com', 'email');

INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
  ('admin_pix_key', '04940013138', 'Chave PIX admin'),
  ('admin_pix_key_type', 'cpf', 'Tipo da chave PIX'),
  ('admin_pix_name', 'Douglas Felipe Nogueira da Silva', 'Nome beneficiário PIX'),
  ('license_amount', '199.00', 'Valor da licença'),
  ('license_description', 'Licença Vitalícia TOCA ESSA', 'Descrição do pagamento');

-- USUÁRIO ADMIN PADRÃO
-- Senha: admin123 (hash SHA-256)
INSERT OR IGNORE INTO users (email, password_hash, full_name, role, email_verified, license_status, license_paid, account_paid)
VALUES (
  'admin@tocaessa.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Administrador',
  'admin',
  1,
  'approved',
  1,
  1
);

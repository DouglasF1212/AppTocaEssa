-- Tabela de configurações globais do app
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conta bancária para receber assinaturas
CREATE TABLE IF NOT EXISTS admin_bank_account (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_type TEXT NOT NULL, -- 'pix' ou 'bank_transfer'
  pix_key TEXT,
  pix_type TEXT, -- 'email', 'phone', 'cpf', 'random'
  bank_name TEXT,
  agency TEXT,
  account_number TEXT,
  account_holder TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar campo 'role' na tabela users se não existir (admin, artist, user)
-- Nota: SQLite não suporta ALTER COLUMN, então vamos apenas documentar que 'admin' é um valor válido

-- Inserir configurações padrão do layout
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('app_name', 'TOCA ESSA', 'Nome do aplicativo'),
  ('primary_color', '#3B82F6', 'Cor primária do tema (azul)'),
  ('secondary_color', '#10B981', 'Cor secundária do tema (verde)'),
  ('logo_url', '', 'URL do logo do app'),
  ('welcome_message', 'Escolha o artista que está tocando agora', 'Mensagem de boas-vindas na home'),
  ('footer_text', '© 2024 TOCA ESSA - Conectando artistas e público', 'Texto do rodapé'),
  ('enable_tips', 'true', 'Habilitar sistema de gorjetas'),
  ('min_tip_amount', '5', 'Valor mínimo de gorjeta em reais'),
  ('subscription_price', '59.90', 'Preço da assinatura mensal');

-- Inserir conta bancária padrão (vazia, será configurada pelo admin)
INSERT INTO admin_bank_account (account_type, pix_key, pix_type) VALUES
  ('pix', 'admin@tocaessa.com', 'email');

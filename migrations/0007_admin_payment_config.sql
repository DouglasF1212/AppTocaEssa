-- Admin payment configuration for license payments

-- Create system_config table for admin settings
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin payment configuration
INSERT INTO system_config (config_key, config_value, description) VALUES 
  ('admin_pix_key', '04940013138', 'Chave PIX do admin para receber pagamentos de licença'),
  ('admin_pix_key_type', 'cpf', 'Tipo da chave PIX (cpf, email, phone, random)'),
  ('admin_pix_name', 'Douglas Felipe Nogueira da Silva', 'Nome do beneficiário para pagamentos PIX'),
  ('license_amount', '199.00', 'Valor da licença em reais'),
  ('license_description', 'Licença Vitalícia TOCA ESSA', 'Descrição do pagamento da licença');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

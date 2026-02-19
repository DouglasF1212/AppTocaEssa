-- Migration 0009: Adiciona campos de contato de suporte no system_config
INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
  ('support_whatsapp', '', 'Número WhatsApp de suporte (ex: 5541999999999)'),
  ('support_email',    '', 'Email de suporte para receber comprovantes');

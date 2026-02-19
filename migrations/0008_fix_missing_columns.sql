-- Migration 0008: Adiciona coluna updated_at na tabela artists (usada no código mas ausente no schema original)
-- Nota: As outras colunas (license_paid, account_paid, qr_code_data, etc.) já foram adicionadas
-- nas migrations 0003_add_license_payment e 0004_remove_subscriptions_add_qrcode

ALTER TABLE artists ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

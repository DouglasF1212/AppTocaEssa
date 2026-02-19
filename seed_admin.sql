-- Inserir usuário admin padrão
-- Email: admin@tocaessa.com
-- Senha: admin123
-- Hash SHA-256 de "admin123": 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

INSERT OR IGNORE INTO users (email, password_hash, full_name, role, email_verified)
VALUES ('admin@tocaessa.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador', 'admin', 1);

-- Atualizar usuário João Silva para garantir que ele tem role 'artist'
UPDATE users SET role = 'artist' WHERE email = 'joao@tocaessa.com';

-- Atualizar usuário Maria Santos para garantir que ela tem role 'artist'
UPDATE users SET role = 'artist' WHERE email = 'maria@tocaessa.com';

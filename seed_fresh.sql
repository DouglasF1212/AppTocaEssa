-- Seed completo para banco limpo
-- Password hash para "password123": ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- 1. Criar usuários
INSERT INTO users (id, email, password_hash, full_name, role, email_verified) VALUES 
  (1, 'joao@tocaessa.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'João Silva', 'artist', 1),
  (2, 'maria@tocaessa.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Maria Santos', 'artist', 1);

-- 2. Criar artistas
INSERT INTO artists (id, user_id, name, slug, bio, photo_url, active) VALUES 
  (1, 1, 'João Silva', 'joao-silva', 'Cantor de MPB e sertanejo', 'https://via.placeholder.com/150', 1),
  (2, 2, 'Maria Santos', 'maria-santos', 'Cantora de MPB e Jazz', 'https://via.placeholder.com/150', 1);

-- 3. Adicionar músicas para João Silva
INSERT INTO songs (artist_id, title, artist_name, genre, duration) VALUES 
  (1, 'Evidências', 'Chitãozinho & Xororó', 'Sertanejo', 240),
  (1, 'Cheia de Manias', 'Raça Negra', 'Pagode', 210),
  (1, 'Como É Grande o Meu Amor Por Você', 'Roberto Carlos', 'MPB', 180),
  (1, 'Eu Sei Que Vou Te Amar', 'Tom Jobim', 'Bossa Nova', 165),
  (1, 'Exagerado', 'Cazuza', 'Rock', 195),
  (1, 'Fico Assim Sem Você', 'Claudinho e Buchecha', 'Pagode', 200),
  (1, 'Lanterna dos Afogados', 'Paralamas do Sucesso', 'Rock', 205),
  (1, 'Quando a Chuva Passar', 'Ivete Sangalo', 'Axé', 190),
  (1, 'Sozinho', 'Caetano Veloso', 'MPB', 175),
  (1, 'Apenas Mais Uma de Amor', 'Lulu Santos', 'Pop Rock', 220);

-- 4. Adicionar músicas para Maria Santos
INSERT INTO songs (artist_id, title, artist_name, genre, duration) VALUES 
  (2, 'Garota de Ipanema', 'Tom Jobim', 'Bossa Nova', 300),
  (2, 'Águas de Março', 'Elis Regina', 'MPB', 210),
  (2, 'Corcovado', 'Tom Jobim', 'Bossa Nova', 240),
  (2, 'Wave', 'Tom Jobim', 'Jazz', 180),
  (2, 'Só Danço Samba', 'Tom Jobim', 'Samba', 150);

-- 5. Adicionar contas bancárias
INSERT INTO bank_accounts (artist_id, account_type, pix_key, pix_key_type, account_holder_name, account_holder_document, is_active) VALUES 
  (1, 'pix', 'joao@tocaessa.com', 'email', 'João Silva', '123.456.789-00', 1),
  (2, 'pix', '11999999999', 'phone', 'Maria Santos', '987.654.321-00', 1);

-- 6. Criar assinaturas ativas
INSERT INTO subscriptions (user_id, plan_name, plan_price, status, current_period_start, current_period_end) VALUES 
  (1, 'Plano Mensal', 59.90, 'active', datetime('now'), datetime('now', '+30 days')),
  (2, 'Plano Mensal', 59.90, 'active', datetime('now'), datetime('now', '+30 days'));

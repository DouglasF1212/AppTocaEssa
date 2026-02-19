-- Seed data for TOCA ESSA (without license system)

-- Insert admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role) VALUES 
(1, 'admin@tocaessa.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador', 'admin');

-- Insert artist users (password: password123 for all)
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role) VALUES 
(2, 'joao@tocaessa.com', 'ef92b778bafe771e89245b89ecbb697e7a3b1649517a7c8656f55ae5fc22303a', 'João Silva', 'artist'),
(3, 'maria@tocaessa.com', 'ef92b778bafe771e89245b89ecbb697e7a3b1649517a7c8656f55ae5fc22303a', 'Maria Santos', 'artist'),
(4, 'contatodfns@gmail.com', 'ef92b778bafe771e89245b89ecbb697e7a3b1649517a7c8656f55ae5fc22303a', 'Douglas Felipe Nogueira da Silva', 'artist');

-- Insert artist profiles
INSERT OR IGNORE INTO artists (id, name, slug, bio, user_id, active, qr_code_data) VALUES 
(1, 'João Silva', 'joao-silva', 'Cantor de MPB e samba', 2, 1, 'http://localhost:3000/joao-silva'),
(2, 'Maria Santos', 'maria-santos', 'Cantora de sertanejo universitário', 3, 1, 'http://localhost:3000/maria-santos'),
(3, 'Douglas Felipe', 'douglas-felipe', 'Cantor de sertanejo, pop rock', 4, 1, 'http://localhost:3000/douglas-felipe');

-- Insert sample songs for Douglas
INSERT OR IGNORE INTO songs (title, artist_name, artist_id) VALUES 
('Evidências', 'Chitãozinho e Xororó', 3),
('Fico Assim Sem Você', 'Adriana Calcanhoto', 3),
('Garota de Ipanema', 'Tom Jobim', 3),
('Você Não Vale Nada', 'Calcinha Preta', 3),
('Te Amo', 'Fábio Jr', 3);

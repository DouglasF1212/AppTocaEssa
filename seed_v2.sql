-- Create sample users
INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, email_verified) VALUES 
  (1, 'joao@tocaessa.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'João Silva', 'artist', 1),
  (2, 'maria@tocaessa.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Maria Santos', 'artist', 1);
-- Password is: password123

-- Update existing artist with user_id
UPDATE artists SET user_id = 1 WHERE id = 1;

-- Add another artist
INSERT OR IGNORE INTO artists (id, name, slug, bio, photo_url, active, user_id) VALUES 
  (2, 'Maria Santos', 'maria-santos', 'Cantora de MPB e Jazz', 'https://via.placeholder.com/150', 1, 2);

-- Add bank accounts for artists
INSERT OR IGNORE INTO bank_accounts (artist_id, account_type, pix_key, pix_key_type, account_holder_name, account_holder_document) VALUES 
  (1, 'pix', 'joao@tocaessa.com', 'email', 'João Silva', '123.456.789-00'),
  (2, 'pix', '11999999999', 'phone', 'Maria Santos', '987.654.321-00');

-- Add some songs for Maria Santos
INSERT OR IGNORE INTO songs (artist_id, title, artist_name, genre, duration) VALUES 
  (2, 'Garota de Ipanema', 'Tom Jobim', 'Bossa Nova', 300),
  (2, 'Águas de Março', 'Elis Regina', 'MPB', 210),
  (2, 'Corcovado', 'Tom Jobim', 'Bossa Nova', 240),
  (2, 'Wave', 'Tom Jobim', 'Jazz', 180),
  (2, 'Só Danço Samba', 'Tom Jobim', 'Samba', 150);

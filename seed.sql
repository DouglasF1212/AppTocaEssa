-- Sample artist
INSERT OR IGNORE INTO artists (id, name, slug, bio, photo_url, active) VALUES 
  (1, 'João Silva', 'joao-silva', 'Cantor de MPB e sertanejo', 'https://via.placeholder.com/150', 1);

-- Sample songs
INSERT OR IGNORE INTO songs (artist_id, title, artist_name, genre, duration) VALUES 
  (1, 'Evidências', 'Chitãozinho & Xororó', 'Sertanejo', 240),
  (1, 'Cheia de Manias', 'Raça Negra', 'Pagode', 210),
  (1, 'Como É Grande o Meu Amor Por Você', 'Roberto Carlos', 'MPB', 180),
  (1, 'Exagerado', 'Cazuza', 'Rock', 195),
  (1, 'Eu Sei Que Vou Te Amar', 'Tom Jobim', 'Bossa Nova', 165),
  (1, 'Apenas Mais Uma de Amor', 'Lulu Santos', 'Pop Rock', 220),
  (1, 'Fico Assim Sem Você', 'Claudinho e Buchecha', 'Pagode', 200),
  (1, 'Quando a Chuva Passar', 'Ivete Sangalo', 'Axé', 190),
  (1, 'Sozinho', 'Caetano Veloso', 'MPB', 175),
  (1, 'Lanterna dos Afogados', 'Paralamas do Sucesso', 'Rock', 205);

-- Sample show
INSERT OR IGNORE INTO shows (artist_id, venue_name, show_date, start_time, status) VALUES
  (1, 'Bar do João', '2026-02-17', '20:00:00', 'ongoing');

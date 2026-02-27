CREATE TABLE IF NOT EXISTS custom_song_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  requester_name TEXT,
  requester_message TEXT,
  custom_song_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, known, unknown
  linked_song_id INTEGER,
  linked_request_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_song_id) REFERENCES songs(id) ON DELETE SET NULL,
  FOREIGN KEY (linked_request_id) REFERENCES song_requests(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_song_requests_artist_id ON custom_song_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_custom_song_requests_status ON custom_song_requests(status);

-- Migration 0011: Sistema de notificações admin → artistas
-- O admin pode enviar notificações para todos ou para um usuário específico
-- As notificações são exibidas no dashboard/manage do artista

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,              -- NULL = para todos os usuários
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',     -- 'info', 'warning', 'success', 'error'
  link TEXT,                    -- URL opcional para ação
  read_at TEXT,                 -- NULL = não lida, ISO timestamp = lida
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT               -- NULL = não expira
);

-- Index para busca por user_id (queries do frontend artista)
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

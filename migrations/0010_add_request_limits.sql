-- Migration 0010: Adiciona controle de limite de pedidos por show
-- O artista pode configurar quantos pedidos aceitar no show de hoje
-- e ativar/desativar o recebimento de pedidos a qualquer momento

ALTER TABLE artists ADD COLUMN max_requests INTEGER DEFAULT 0; -- 0 = sem limite
ALTER TABLE artists ADD COLUMN requests_open INTEGER DEFAULT 1; -- 1 = aberto, 0 = fechado

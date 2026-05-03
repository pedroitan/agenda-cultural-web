-- Adicionar campos para submissão manual de eventos
-- Execute este script no Supabase SQL Editor

ALTER TABLE events ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Criar índice para busca por eventos pendentes
CREATE INDEX IF NOT EXISTS idx_events_is_approved ON events(is_approved);

-- Criar índice para busca por eventos marcados
CREATE INDEX IF NOT EXISTS idx_events_is_flagged ON events(is_flagged);

-- Criar índice para busca por email de contato (para rate limiting)
CREATE INDEX IF NOT EXISTS idx_events_contact_email ON events(contact_email);

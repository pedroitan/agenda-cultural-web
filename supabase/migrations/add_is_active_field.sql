-- Adicionar campo is_active para soft delete de eventos
-- Execute este script no Supabase SQL Editor

ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Criar índice para busca por eventos ativos
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

-- Atualizar eventos existentes para is_active=true
UPDATE events SET is_active = true WHERE is_active IS NULL;

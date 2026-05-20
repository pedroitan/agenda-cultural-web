-- ==============================================================
-- Reset click counts (dados poluídos por bots) + limpeza
-- Aplicar no Supabase SQL Editor após deploy do código novo
-- ==============================================================

-- 1) Reset de todos os contadores de clique
UPDATE events
SET click_count = 0,
    cta_click_count = 0;

-- 2) Remover função RPC obsoleta (se existir)
DROP FUNCTION IF EXISTS increment_event_click(UUID);

-- 3) Garantir que increment_click_count existe (idempotente)
CREATE OR REPLACE FUNCTION increment_click_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

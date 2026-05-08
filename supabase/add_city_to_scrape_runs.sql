-- Adicionar coluna city à tabela scrape_runs (multi-cidade support)
ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'salvador';

-- Renomear colunas antigas para novos nomes usados pelo scraper
-- Usar DROP + ADD para evitar erro se coluna não existir
DO $$
BEGIN
  -- events_found -> items_fetched
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scrape_runs' AND column_name = 'events_found') THEN
    ALTER TABLE scrape_runs RENAME COLUMN events_found TO items_fetched;
  END IF;
  
  -- events_inserted -> items_valid
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scrape_runs' AND column_name = 'events_inserted') THEN
    ALTER TABLE scrape_runs RENAME COLUMN events_inserted TO items_valid;
  END IF;
  
  -- events_updated -> items_upserted
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scrape_runs' AND column_name = 'events_updated') THEN
    ALTER TABLE scrape_runs RENAME COLUMN events_updated TO items_upserted;
  END IF;
  
  -- Adicionar colunas que faltam
  ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS items_invalid INTEGER DEFAULT 0;
  ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS items_upserted INTEGER DEFAULT 0;
END $$;

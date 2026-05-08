-- =====================================================
-- MIGRAÇÃO COMPLETA - SUPABASE RJ
-- Adiciona tudo que o scraper precisa em uma única execução
-- =====================================================

-- 1. Tabela scrape_runs - adicionar coluna city
ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'salvador';

-- 2. Tabela scrape_runs - renomear colunas antigas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scrape_runs' AND column_name = 'events_found') THEN
    ALTER TABLE scrape_runs RENAME COLUMN events_found TO items_fetched;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scrape_runs' AND column_name = 'events_inserted') THEN
    ALTER TABLE scrape_runs RENAME COLUMN events_inserted TO items_valid;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scrape_runs' AND column_name = 'events_updated') THEN
    ALTER TABLE scrape_runs RENAME COLUMN events_updated TO items_upserted;
  END IF;
  
  ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS items_invalid INTEGER DEFAULT 0;
END $$;

-- 3. Tabela events - adicionar coluna raw_payload
ALTER TABLE events ADD COLUMN IF NOT EXISTS raw_payload JSONB;

-- 4. Tabela events - índice único para upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id ON events(source, external_id) WHERE external_id IS NOT NULL;

-- 5. Tabela events - outros índices que podem faltar
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_district ON events(district);
CREATE INDEX IF NOT EXISTS idx_events_coordinates ON events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_clicks ON events(click_count DESC);
CREATE INDEX IF NOT EXISTS idx_events_cta_clicks ON events(cta_click_count DESC);

-- Adicionar índice único para evitar duplicatas (usado pelo scraper upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id ON events(source, external_id) WHERE external_id IS NOT NULL;

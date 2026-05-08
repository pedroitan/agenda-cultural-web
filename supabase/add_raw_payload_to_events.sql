-- Adicionar coluna raw_payload à tabela events (usada pelo scraper)
ALTER TABLE events ADD COLUMN IF NOT EXISTS raw_payload JSONB;

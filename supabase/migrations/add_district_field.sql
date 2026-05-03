-- Adicionar campo district para identificar região do evento
-- Regiões: comercio, centro, barroquinha, nazare, outros

ALTER TABLE events
ADD COLUMN district TEXT;

-- Criar índice para filtrar por district
CREATE INDEX idx_events_district ON events(district);

-- Adicionar comentário
COMMENT ON COLUMN events.district IS 'Região do evento: comercio, centro, barroquinha, nazare, outros';

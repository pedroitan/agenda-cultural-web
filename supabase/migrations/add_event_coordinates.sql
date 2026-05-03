-- Adicionar campos de coordenadas para mapa de eventos
-- Latitude e longitude para exibir eventos no mapa

ALTER TABLE events
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Criar índice para consultas de proximidade (futuro)
CREATE INDEX idx_events_coordinates ON events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN events.latitude IS 'Latitude do local do evento (para mapa)';
COMMENT ON COLUMN events.longitude IS 'Longitude do local do evento (para mapa)';

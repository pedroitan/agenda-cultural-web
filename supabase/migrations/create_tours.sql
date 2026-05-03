-- Tabela de roteiros curados
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  curator_name TEXT NOT NULL,
  curator_bio TEXT,
  description TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de paradas do roteiro
CREATE TABLE IF NOT EXISTS tour_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id),
  horario TEXT, -- ex: "14:00"
  duracao_min INTEGER, -- duração em minutos
  deslocamento_proximo_min INTEGER, -- tempo de deslocamento para próxima parada
  modo_deslocamento TEXT, -- ex: "caminhando", "uber", "ônibus"
  order_index INTEGER NOT NULL, -- ordem na timeline
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tours_published ON tours(is_published);
CREATE INDEX idx_tour_stops_tour ON tour_stops(tour_id);
CREATE INDEX idx_tour_stops_event ON tour_stops(event_id);
CREATE INDEX idx_tour_stops_order ON tour_stops(tour_id, order_index);

-- RLS
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_stops ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - tours
CREATE POLICY "Todos podem ver roteiros publicados"
ON tours FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins podem gerenciar roteiros"
ON tours FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas RLS - tour_stops
CREATE POLICY "Todos podem ver paradas de roteiros publicados"
ON tour_stops FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tours WHERE tours.id = tour_stops.tour_id AND tours.is_published = true
  )
);

CREATE POLICY "Admins podem gerenciar paradas"
ON tour_stops FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON tours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIX: Recria tabelas tours/tour_stops com schema esperado pelo frontend
-- O schema-full.sql original não bate com o que app/roteiros/page.tsx espera
-- ============================================

-- Backup nada — apaga e recria (não há dados úteis ainda)
DROP TABLE IF EXISTS tour_stops CASCADE;
DROP TABLE IF EXISTS tours CASCADE;

-- ─── TOURS ──────────────────────────────────────
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  curator_name TEXT NOT NULL,
  curator_bio TEXT,
  description TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  city TEXT DEFAULT 'salvador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tours_published ON tours(is_published);
CREATE INDEX idx_tours_city ON tours(city);

-- ─── TOUR_STOPS ─────────────────────────────────
CREATE TABLE tour_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  horario TEXT,
  duracao_min INTEGER,
  deslocamento_proximo_min INTEGER,
  modo_deslocamento TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tour_stops_tour ON tour_stops(tour_id);
CREATE INDEX idx_tour_stops_event ON tour_stops(event_id);
CREATE INDEX idx_tour_stops_order ON tour_stops(tour_id, order_index);

-- ─── RLS ────────────────────────────────────────
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_stops ENABLE ROW LEVEL SECURITY;

-- Leitura pública para tours publicados
CREATE POLICY "Public read published tours" ON tours
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public read stops of published tours" ON tour_stops
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_stops.tour_id AND tours.is_published = true)
  );

-- Service role bypass (admins gerenciam tudo)
CREATE POLICY "Service role full access tours" ON tours
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access stops" ON tour_stops
  FOR ALL USING (auth.role() = 'service_role');

-- ─── TRIGGER updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_tours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tours_updated_at_trigger
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_tours_updated_at();

-- Verificar
SELECT 'tours' as tabela, count(*) FROM tours
UNION ALL
SELECT 'tour_stops', count(*) FROM tour_stops;

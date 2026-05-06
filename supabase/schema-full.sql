-- =====================================================
-- SCHEMA COMPLETO - Agenda Cultural (Multi-Tenant)
-- Execute este arquivo no SQL Editor do Supabase
-- de qualquer cidade (RJ, SP, etc.)
-- =====================================================

-- ─── TABELA PRINCIPAL: events ─────────────────────
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP,
  venue_name TEXT,
  venue_address TEXT,
  city TEXT,
  category TEXT,
  price_text TEXT,
  is_free BOOLEAN DEFAULT false,
  image_url TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  external_id TEXT,
  click_count INTEGER DEFAULT 0,
  cta_click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  district TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_district ON events(district);
CREATE INDEX IF NOT EXISTS idx_events_coordinates ON events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_cta_clicks ON events(cta_click_count DESC);

-- Constraint de unicidade para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id ON events(source, external_id) WHERE external_id IS NOT NULL;

-- ─── TABELA: scrape_runs ──────────────────────────
CREATE TABLE IF NOT EXISTS scrape_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success' | 'error'
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  events_found INTEGER DEFAULT 0,
  events_inserted INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_source ON scrape_runs(source);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_status ON scrape_runs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_ended_at ON scrape_runs(ended_at DESC);

-- ─── TABELA: event_submissions (formulário público) ─
CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP,
  venue_name TEXT,
  venue_address TEXT,
  category TEXT,
  price_text TEXT,
  is_free BOOLEAN DEFAULT false,
  image_url TEXT,
  url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON event_submissions(status);

-- ─── TABELA: ads (anúncios) ───────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT NOT NULL,
  position TEXT NOT NULL, -- 'banner_top' | 'inline_1' | 'inline_2' | 'sidebar'
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  advertiser_name TEXT,
  advertiser_email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_position ON ads(position);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);

-- ─── TABELA: tours (roteiros curados) ────────────
CREATE TABLE IF NOT EXISTS tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  duration_hours DECIMAL(4,1),
  difficulty TEXT DEFAULT 'easy', -- 'easy' | 'medium' | 'hard'
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tour_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_stops_tour_id ON tour_stops(tour_id);

-- ─── FUNÇÕES ──────────────────────────────────────

-- Incrementar click_count (card view)
CREATE OR REPLACE FUNCTION increment_click_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrementar cta_click_count (botão comprar)
CREATE OR REPLACE FUNCTION increment_cta_click_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET cta_click_count = COALESCE(cta_click_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrementar impressão de anúncio
CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ads
  SET impression_count = COALESCE(impression_count, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrementar clique em anúncio
CREATE OR REPLACE FUNCTION increment_ad_click(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ads
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── RLS (Row Level Security) ─────────────────────

-- Events: leitura pública, escrita apenas service_role
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Service role full access events" ON events USING (auth.role() = 'service_role');

-- Scrape runs: leitura pública
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read scrape_runs" ON scrape_runs FOR SELECT USING (true);
CREATE POLICY "Service role full access scrape_runs" ON scrape_runs USING (auth.role() = 'service_role');

-- Submissions: inserção pública, leitura apenas service_role
ALTER TABLE event_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert submissions" ON event_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access submissions" ON event_submissions USING (auth.role() = 'service_role');

-- Ads: leitura pública
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ads" ON ads FOR SELECT USING (true);
CREATE POLICY "Service role full access ads" ON ads USING (auth.role() = 'service_role');

-- Tours: leitura pública
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tours" ON tours FOR SELECT USING (true);
CREATE POLICY "Service role full access tours" ON tours USING (auth.role() = 'service_role');

ALTER TABLE tour_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tour_stops" ON tour_stops FOR SELECT USING (true);
CREATE POLICY "Service role full access tour_stops" ON tour_stops USING (auth.role() = 'service_role');

-- ─── CONCLUÍDO ────────────────────────────────────
-- Schema completo criado com sucesso!

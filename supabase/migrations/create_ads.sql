-- Criar tabela para anúncios
-- Execute este script no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'sidebar', 'featured', 'sponsored')),
  
  -- Configurações de exibição
  position TEXT, -- 'top', 'sidebar', 'between_events', etc.
  priority INTEGER DEFAULT 0, -- Maior = mais prioritário
  
  -- Configurações de tempo
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Contadores
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Informações do anunciante
  advertiser_name TEXT NOT NULL,
  advertiser_email TEXT,
  advertiser_phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'expired')),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_ad_type ON ads(ad_type);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC);

-- Habilitar RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem ver anúncios ativos" ON ads
  FOR SELECT USING (is_active = true AND status = 'active');

CREATE POLICY "Admins podem ver todos os anúncios" ON ads
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar impressões
CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads 
  SET impressions = impressions + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar cliques
CREATE OR REPLACE FUNCTION increment_ad_click(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads 
  SET clicks = clicks + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

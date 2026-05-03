-- Criar tabela para submissões de eventos por usuários
-- Execute este script no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  venue_address TEXT,
  image_url TEXT,
  category TEXT,
  price_text TEXT,
  is_free BOOLEAN DEFAULT false,
  url TEXT NOT NULL,
  source TEXT DEFAULT 'user_submission',
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Campos de moderação
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,
  flagged_reason TEXT,
  
  -- Campos de IA
  ai_moderation_score DECIMAL(3,2),
  ai_flagged_reasons JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_event_submissions_status ON event_submissions(status);
CREATE INDEX IF NOT EXISTS idx_event_submissions_created_at ON event_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_submissions_contact_email ON event_submissions(contact_email);

-- Habilitar RLS
ALTER TABLE event_submissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (simplificadas - ajustar conforme necessário)
CREATE POLICY "Todos podem ver submissões aprovadas" ON event_submissions
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins podem ver todas as submissões" ON event_submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_submissions_updated_at
  BEFORE UPDATE ON event_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

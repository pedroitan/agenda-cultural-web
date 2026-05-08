-- ============================================
-- Migration Completa: Roteiros Curados Multi-Cidade
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para cada projeto: Salvador, Rio de Janeiro, São Paulo
-- ============================================

-- 1. Verificar se tabela tours existe e se tem a estrutura correta
DO $$
BEGIN
  -- Se a tabela não existe, criar
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tours') THEN
    CREATE TABLE tours (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      curator_name TEXT NOT NULL,
      curator_bio TEXT,
      description TEXT,
      image_url TEXT,
      is_published BOOLEAN DEFAULT false,
      city TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  -- Se a tabela existe mas não tem curator_name, recriar sem preservar dados
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'curator_name'
  ) THEN
    -- Recriar tabela (dados antigos não são críticos para tours)
    DROP TABLE tours CASCADE;
    CREATE TABLE tours (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      curator_name TEXT NOT NULL,
      curator_bio TEXT,
      description TEXT,
      image_url TEXT,
      is_published BOOLEAN DEFAULT false,
      city TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 2. Adicionar colunas que podem estar faltando
DO $$
BEGIN
  -- Adicionar city se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'city'
  ) THEN
    ALTER TABLE tours ADD COLUMN city TEXT;
  END IF;

  -- Adicionar is_published se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE tours ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;

  -- Adicionar curator_bio se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'curator_bio'
  ) THEN
    ALTER TABLE tours ADD COLUMN curator_bio TEXT;
  END IF;

  -- Adicionar description se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'description'
  ) THEN
    ALTER TABLE tours ADD COLUMN description TEXT;
  END IF;

  -- Adicionar image_url se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE tours ADD COLUMN image_url TEXT;
  END IF;

  -- Adicionar updated_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tours' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tours ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 3. Verificar se tabela tour_stops existe e recriar se necessário
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tour_stops') THEN
    CREATE TABLE tour_stops (
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
  END IF;
END $$;

-- 4. Adicionar colunas que podem estar faltando em tour_stops
DO $$
BEGIN
  -- Adicionar tour_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'tour_id'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN tour_id UUID REFERENCES tours(id) ON DELETE CASCADE;
  END IF;

  -- Adicionar event_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN event_id UUID REFERENCES events(id);
  END IF;

  -- Adicionar horario se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'horario'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN horario TEXT;
  END IF;

  -- Adicionar duracao_min se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'duracao_min'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN duracao_min INTEGER;
  END IF;

  -- Adicionar deslocamento_proximo_min se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'deslocamento_proximo_min'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN deslocamento_proximo_min INTEGER;
  END IF;

  -- Adicionar modo_deslocamento se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'modo_deslocamento'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN modo_deslocamento TEXT;
  END IF;

  -- Adicionar order_index se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tour_stops' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN order_index INTEGER;
  END IF;
END $$;

-- 5. Atualizar tours existentes para Salvador (apenas no projeto SSA)
UPDATE tours SET city = 'salvador' WHERE city IS NULL;

-- 6. Adicionar índices (só se as colunas existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'is_published') THEN
    CREATE INDEX IF NOT EXISTS idx_tours_published ON tours(is_published);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'city') THEN
    CREATE INDEX IF NOT EXISTS idx_tours_city ON tours(city);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_stops' AND column_name = 'tour_id') THEN
    CREATE INDEX IF NOT EXISTS idx_tour_stops_tour ON tour_stops(tour_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_stops' AND column_name = 'event_id') THEN
    CREATE INDEX IF NOT EXISTS idx_tour_stops_event ON tour_stops(event_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tour_stops' AND column_name = 'order_index') THEN
    CREATE INDEX IF NOT EXISTS idx_tour_stops_order ON tour_stops(tour_id, order_index);
  END IF;
END $$;

-- 7. Adicionar constraint para garantir que city não seja nulo em novos registros
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'city') THEN
    ALTER TABLE tours ALTER COLUMN city SET NOT NULL;
  END IF;
END $$;

-- 8. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON tours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed de Roteiros Curados por Cidade
-- ============================================

DO $$
DECLARE
  tour1_id UUID := gen_random_uuid();
  tour2_id UUID := gen_random_uuid();
  tour3_id UUID := gen_random_uuid();
  tour4_id UUID := gen_random_uuid();
  tour5_id UUID := gen_random_uuid();
  event_samba_lua UUID;
  event_os_thiagos UUID;
  event_largo_tieta UUID;
  event_teatro_sesc UUID;
  event_ifa_reggae UUID;
  event_quincas UUID;
BEGIN
  -- Buscar IDs de eventos reais (apenas para Salvador)
  SELECT id INTO event_samba_lua FROM events 
    WHERE title ILIKE '%samba de lua%' 
    AND start_datetime > NOW() 
    ORDER BY start_datetime LIMIT 1;

  SELECT id INTO event_os_thiagos FROM events 
    WHERE title ILIKE '%os thiagos%' 
    AND start_datetime > NOW() 
    ORDER BY start_datetime LIMIT 1;

  SELECT id INTO event_largo_tieta FROM events 
    WHERE venue_name ILIKE '%largo da tieta%' 
    AND start_datetime > NOW() 
    ORDER BY start_datetime LIMIT 1;

  SELECT id INTO event_teatro_sesc FROM events 
    WHERE venue_name ILIKE '%teatro sesc%senac%pelourinho%' 
    AND start_datetime > NOW() 
    ORDER BY start_datetime LIMIT 1;

  SELECT id INTO event_ifa_reggae FROM events 
    WHERE title ILIKE '%ifá%' OR title ILIKE '%sessão reggae%'
    AND start_datetime > NOW() 
    ORDER BY start_datetime LIMIT 1;

  SELECT id INTO event_quincas FROM events 
    WHERE venue_name ILIKE '%quincas berro%' 
    AND start_datetime > NOW() 
    ORDER BY start_datetime LIMIT 1;

  -- ROTEIRO 1: Noite de Samba no Pelourinho (Salvador)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour1_id,
    'Noite de Samba no Pelourinho',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Um mergulho na tradição do samba baiano. Comece com o Samba de Lua no Clube do Samba, vá para o Largo da Tieta e termine com Os Thiagos. Uma noite inesquecível no coração do Pelourinho.',
    true,
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    'salvador'
  );

  IF event_samba_lua IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, event_samba_lua, '20:00', 90, 10, 'caminhando', 1);
  END IF;

  IF event_largo_tieta IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, event_largo_tieta, '21:30', 60, 10, 'caminhando', 2);
  END IF;

  IF event_os_thiagos IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, event_os_thiagos, '22:30', 90, NULL, NULL, 3);
  END IF;

  -- ROTEIRO 2: Cultura e Teatro no Centro Histórico (Salvador)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour2_id,
    'Cultura e Teatro no Centro Histórico',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Experiência completa de arte e cultura no Pelourinho. Teatro, música e a riqueza histórica do centro de Salvador em uma só noite.',
    true,
    'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800',
    'salvador'
  );

  IF event_teatro_sesc IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event_teatro_sesc, '19:00', 90, 15, 'caminhando', 1);
  END IF;

  IF event_quincas IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event_quincas, '21:00', 90, NULL, NULL, 2);
  END IF;

  -- ROTEIRO 3: Reggae e Afrobrasilidade (Salvador)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour3_id,
    'Reggae e Afrobrasilidade',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Uma viagem pela sonoridade negra de Salvador. Reggae, samba e as raízes culturais da capital baiana em roteiro imperdível.',
    true,
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    'salvador'
  );

  IF event_ifa_reggae IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event_ifa_reggae, '21:00', 120, 10, 'caminhando', 1);
  END IF;

  IF event_samba_lua IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event_samba_lua, '23:00', 90, NULL, NULL, 2);
  END IF;

  -- ROTEIRO 4: Noite de Samba na Lapa (Rio de Janeiro) - sem paradas (placeholder)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour4_id,
    'Noite de Samba na Lapa',
    'Agenda Cultural RJ',
    'Curadoria local do Rio de Janeiro',
    'Uma noite inesquecível na Lapa, o coração boêmio do Rio. Samba, choro e a energia vibrante da noite carioca.',
    true,
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    'rio-de-janeiro'
  );

  -- ROTEIRO 5: Arte e Cultura em Pinheiros (São Paulo) - sem paradas (placeholder)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour5_id,
    'Arte e Cultura em Pinheiros',
    'Agenda Cultural SP',
    'Curadoria local de São Paulo',
    'Roteiro cultural pelo vibrante bairro de Pinheiros. Galerias, teatros e a cena artística paulistana em uma só experiência.',
    true,
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    'sao-paulo'
  );

END $$;

-- Verificar roteiros criados
SELECT t.title, t.curator_name, t.city, COUNT(ts.id) as paradas
FROM tours t
LEFT JOIN tour_stops ts ON ts.tour_id = t.id
GROUP BY t.id, t.title, t.curator_name, t.city
ORDER BY t.city, t.created_at;

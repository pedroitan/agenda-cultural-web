-- ============================================
-- Roteiros Curados para Salvador - Fim de Semana 16-17 Maio 2026
-- 4 perfis distintos baseados em eventos reais
-- ============================================

-- 1. Limpar roteiros antigos de Salvador (datas passadas)
DELETE FROM tour_stops WHERE tour_id IN (
  SELECT id FROM tours WHERE city = 'salvador'
);
DELETE FROM tours WHERE city = 'salvador';

-- 2. Criar roteiros novos
DO $$
DECLARE
  -- Roteiro 1: Sábado Tropical no Rio Vermelho (jovens, bairro hipster)
  tour1_id UUID := gen_random_uuid();
  e1_1 UUID;
  e1_2 UUID;
  e1_3 UUID;

  -- Roteiro 2: Sábado em Família (diurno, cultural)
  tour2_id UUID := gen_random_uuid();
  e2_1 UUID;
  e2_2 UUID;
  e2_3 UUID;

  -- Roteiro 3: Pelourinho Boêmio (centro histórico, samba)
  tour3_id UUID := gen_random_uuid();
  e3_1 UUID;
  e3_2 UUID;
  e3_3 UUID;

  -- Roteiro 4: Domingo Cultural (teatro, espetáculos)
  tour4_id UUID := gen_random_uuid();
  e4_1 UUID;
  e4_2 UUID;
  e4_3 UUID;
BEGIN

  -- ════════════════════════════════════════════════
  -- ROTEIRO 1: Sábado Tropical no Rio Vermelho
  -- Perfil: Jovens (25-35), boêmios, bairro hipster
  -- ════════════════════════════════════════════════
  
  -- Esquenta com música ao vivo (21h)
  SELECT id INTO e1_1 FROM events
    WHERE venue_name ILIKE '%rio vermelho%'
    AND start_datetime >= '2026-05-16 18:00:00'
    AND start_datetime < '2026-05-16 22:00:00'
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Show principal (23h)
  SELECT id INTO e1_2 FROM events
    WHERE venue_name ILIKE '%rio vermelho%'
    AND start_datetime >= '2026-05-16 22:00:00'
    AND start_datetime < '2026-05-17 01:00:00'
    AND id != COALESCE(e1_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Madrugada/balada (01h+)
  SELECT id INTO e1_3 FROM events
    WHERE venue_name ILIKE '%rio vermelho%'
    AND start_datetime >= '2026-05-17 00:00:00'
    AND start_datetime < '2026-05-17 04:00:00'
    AND id NOT IN (
      COALESCE(e1_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(e1_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour1_id,
    'Sábado Tropical no Rio Vermelho',
    'Agenda Cultural Salvador',
    'Curadoria local',
    'Para quem quer viver a vibe boêmia do bairro mais animado de Salvador. Comece com um esquenta de samba ou MPB, parta para um show principal em uma das casas tradicionais, e termine madrugada adentro. O Rio Vermelho num só roteiro.',
    true,
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop',
    'salvador'
  );

  IF e1_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, e1_1, '21:00', 120, 15, 'caminhando', 1);
  END IF;
  IF e1_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, e1_2, '23:00', 120, 10, 'caminhando', 2);
  END IF;
  IF e1_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, e1_3, '01:00', 180, NULL, NULL, 3);
  END IF;

  -- ════════════════════════════════════════════════
  -- ROTEIRO 2: Sábado em Família (diurno cultural)
  -- Perfil: Famílias com crianças, casais com filhos
  -- ════════════════════════════════════════════════
  
  -- Atividade matinal (manhã)
  SELECT id INTO e2_1 FROM events
    WHERE start_datetime >= '2026-05-16 09:00:00'
    AND start_datetime < '2026-05-16 12:00:00'
    AND (
      title ILIKE '%brincant%' OR title ILIKE '%infantil%' OR
      title ILIKE '%criança%' OR title ILIKE '%família%' OR
      category ILIKE '%infantil%' OR title ILIKE '%manhã%'
    )
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Almoço/atividade (meio-dia)
  SELECT id INTO e2_2 FROM events
    WHERE start_datetime >= '2026-05-16 12:00:00'
    AND start_datetime < '2026-05-16 16:00:00'
    AND (
      category ILIKE '%teatro%' OR category ILIKE '%cultura%' OR
      title ILIKE '%infantil%' OR title ILIKE '%bento%' OR
      title ILIKE '%totó%' OR venue_name ILIKE '%shopping%'
    )
    AND id != COALESCE(e2_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Tarde cultural (tarde)
  SELECT id INTO e2_3 FROM events
    WHERE start_datetime >= '2026-05-16 16:00:00'
    AND start_datetime < '2026-05-16 20:00:00'
    AND (
      category ILIKE '%teatro%' OR category ILIKE '%cultura%' OR
      venue_name ILIKE '%teatro%' OR venue_name ILIKE '%sesc%'
    )
    AND id NOT IN (
      COALESCE(e2_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(e2_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour2_id,
    'Sábado em Família',
    'Agenda Cultural Salvador',
    'Curadoria local',
    'Diversão garantida do café da manhã ao fim da tarde. Comece com uma atividade lúdica para os pequenos, almoce e curtam um espetáculo infantil ou apresentação cultural. Programação leve, segura e divertida para toda a família.',
    true,
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop',
    'salvador'
  );

  IF e2_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, e2_1, '09:00', 120, 60, 'carro', 1);
  END IF;
  IF e2_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, e2_2, '12:00', 120, 45, 'carro', 2);
  END IF;
  IF e2_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, e2_3, '16:00', 120, NULL, NULL, 3);
  END IF;

  -- ════════════════════════════════════════════════
  -- ROTEIRO 3: Pelourinho Boêmio (samba e centro histórico)
  -- Perfil: Adultos, turistas, amantes da cultura baiana
  -- ════════════════════════════════════════════════
  
  -- Início no Pelourinho (entardecer)
  SELECT id INTO e3_1 FROM events
    WHERE (
      venue_name ILIKE '%pelourinho%' OR venue_name ILIKE '%pelô%' OR
      venue_name ILIKE '%solar%' OR venue_name ILIKE '%terreiro%' OR
      venue_name ILIKE '%largo%'
    )
    AND start_datetime >= '2026-05-16 17:00:00'
    AND start_datetime < '2026-05-16 21:00:00'
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Show principal (noite)
  SELECT id INTO e3_2 FROM events
    WHERE (
      venue_name ILIKE '%pelourinho%' OR venue_name ILIKE '%clube do samba%' OR
      venue_name ILIKE '%sesc%' OR venue_name ILIKE '%largo%' OR
      venue_name ILIKE '%terreiro%'
    )
    AND start_datetime >= '2026-05-16 20:00:00'
    AND start_datetime < '2026-05-16 23:00:00'
    AND id != COALESCE(e3_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Pós show (noite tarde)
  SELECT id INTO e3_3 FROM events
    WHERE (
      venue_name ILIKE '%pelourinho%' OR venue_name ILIKE '%clube do samba%' OR
      title ILIKE '%samba%' OR title ILIKE '%pagode%'
    )
    AND start_datetime >= '2026-05-16 22:00:00'
    AND start_datetime < '2026-05-17 02:00:00'
    AND id NOT IN (
      COALESCE(e3_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(e3_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour3_id,
    'Pelourinho Boêmio',
    'Agenda Cultural Salvador',
    'Curadoria local',
    'A Salvador mais autêntica num só roteiro. Suba os paralelepípedos do Centro Histórico, sinta o samba ecoar nas casas tradicionais do Pelô e termine a noite no berço do samba baiano. Para quem quer experimentar a alma da cidade.',
    true,
    'https://images.unsplash.com/photo-1591789532213-30fb73e6ca12?w=800&auto=format&fit=crop',
    'salvador'
  );

  IF e3_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, e3_1, '18:00', 90, 20, 'caminhando', 1);
  END IF;
  IF e3_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, e3_2, '20:30', 150, 15, 'caminhando', 2);
  END IF;
  IF e3_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, e3_3, '23:30', 150, NULL, NULL, 3);
  END IF;

  -- ════════════════════════════════════════════════
  -- ROTEIRO 4: Domingo Cultural (teatro e espetáculos)
  -- Perfil: Casais, adultos cultos, apreciadores das artes
  -- ════════════════════════════════════════════════
  
  -- Matinê cultural (manhã/tarde)
  SELECT id INTO e4_1 FROM events
    WHERE start_datetime >= '2026-05-17 10:00:00'
    AND start_datetime < '2026-05-17 16:00:00'
    AND (
      category ILIKE '%teatro%' OR category ILIKE '%cultura%' OR
      category ILIKE '%arte%' OR venue_name ILIKE '%teatro%' OR
      venue_name ILIKE '%sesc%' OR venue_name ILIKE '%pelourinho%'
    )
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Espetáculo principal (tarde/início noite)
  SELECT id INTO e4_2 FROM events
    WHERE start_datetime >= '2026-05-17 16:00:00'
    AND start_datetime < '2026-05-17 20:00:00'
    AND (
      category ILIKE '%teatro%' OR category ILIKE '%show%' OR
      category ILIKE '%cultura%' OR title ILIKE '%espetáculo%' OR
      venue_name ILIKE '%teatro%' OR venue_name ILIKE '%concha%'
    )
    AND id != COALESCE(e4_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;
  
  -- Encerramento musical (noite)
  SELECT id INTO e4_3 FROM events
    WHERE start_datetime >= '2026-05-17 19:00:00'
    AND start_datetime < '2026-05-17 23:00:00'
    AND (
      category ILIKE '%show%' OR title ILIKE '%mpb%' OR
      title ILIKE '%jazz%' OR title ILIKE '%musical%' OR
      venue_name ILIKE '%teatro%' OR venue_name ILIKE '%sesc%' OR
      venue_name ILIKE '%casa%'
    )
    AND id NOT IN (
      COALESCE(e4_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(e4_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND is_active = true
    AND city = 'salvador'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour4_id,
    'Domingo Cultural',
    'Agenda Cultural Salvador',
    'Curadoria local',
    'Um domingo dedicado às artes em Salvador. Comece com uma matinê em um dos teatros emblemáticos, siga para um espetáculo de teatro ou dança no fim da tarde, e encerre com um show de música ao vivo. Cultura para fechar o fim de semana com chave de ouro.',
    true,
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
    'salvador'
  );

  IF e4_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour4_id, e4_1, '15:00', 120, 30, 'carro', 1);
  END IF;
  IF e4_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour4_id, e4_2, '17:30', 120, 30, 'carro', 2);
  END IF;
  IF e4_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour4_id, e4_3, '20:00', 120, NULL, NULL, 3);
  END IF;

END $$;

-- Verificar resultado
SELECT 
  t.title,
  t.city,
  COUNT(ts.id) as paradas,
  STRING_AGG(e.title, ' → ' ORDER BY ts.order_index) as percurso
FROM tours t
LEFT JOIN tour_stops ts ON ts.tour_id = t.id
LEFT JOIN events e ON e.id = ts.event_id
WHERE t.city = 'salvador'
GROUP BY t.id, t.title, t.city, t.created_at
ORDER BY t.created_at DESC;

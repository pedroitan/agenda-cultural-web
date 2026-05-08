-- ============================================
-- Seed de Roteiros Curados para Salvador - Final de Semana
-- 4 roteiros com perfis diferentes de idade e lugares
-- ============================================

DO $$
DECLARE
  -- Roteiro 1: Jovens/Noturno (Lapa/Barra)
  tour1_id UUID := gen_random_uuid();
  event1_1 UUID; -- Primeiro evento noturno
  event1_2 UUID; -- Segundo evento noturno
  event1_3 UUID; -- Terceiro evento noturno

  -- Roteiro 2: Família/Diurno (Parques/Cultura)
  tour2_id UUID := gen_random_uuid();
  event2_1 UUID; -- Evento cultural diurno
  event2_2 UUID; -- Evento ao ar livre
  event2_3 UUID; -- Atividade familiar

  -- Roteiro 3: Adultos/Casais (Gastronomia/Arte)
  tour3_id UUID := gen_random_uuid();
  event3_1 UUID; -- Evento de arte
  event3_2 UUID; -- Jantar/Gastronomia
  event3_3 UUID; -- Show/Música

  -- Roteiro 4: Alternativo/Underground (Bairros hipsters)
  tour4_id UUID := gen_random_uuid();
  event4_1 UUID; -- Evento indie/underground
  event4_2 UUID; -- Show alternativo
  event4_3 UUID; -- Evento em bairro hipster
BEGIN
  -- Buscar eventos para Roteiro 1: Jovens/Noturno (Lapa/Barra)
  -- Shows, festas, eventos noturnos na Lapa ou Barra
  SELECT id INTO event1_1 FROM events 
    WHERE (
      venue_name ILIKE '%lapa%' OR 
      venue_name ILIKE '%barra%' OR
      category ILIKE '%show%' OR
      category ILIKE '%festa%' OR
      category ILIKE '%balada%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event1_2 FROM events 
    WHERE id != COALESCE(event1_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      venue_name ILIKE '%lapa%' OR 
      venue_name ILIKE '%barra%' OR
      category ILIKE '%show%' OR
      category ILIKE '%festa%' OR
      category ILIKE '%balada%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event1_3 FROM events 
    WHERE id NOT IN (COALESCE(event1_1, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(event1_2, '00000000-0000-0000-0000-000000000000'::UUID))
    AND (
      venue_name ILIKE '%lapa%' OR 
      venue_name ILIKE '%barra%' OR
      category ILIKE '%show%' OR
      category ILIKE '%festa%' OR
      category ILIKE '%balada%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  -- Roteiro 1: Jovens/Noturno (Lapa/Barra)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour1_id,
    'Noite Jovem na Lapa e Barra',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Uma noite imperdível para quem curte balada e shows. Comece na Lapa com a vibe boêmia, depois vá para a Barra para curtir até de manhã. O melhor da noite soteropolitana em um só roteiro.',
    true,
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
    'salvador'
  );

  IF event1_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, event1_1, '21:00', 120, 20, 'uber', 1);
  END IF;

  IF event1_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, event1_2, '23:30', 180, 15, 'caminhando', 2);
  END IF;

  IF event1_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour1_id, event1_3, '02:00', 120, NULL, NULL, 3);
  END IF;

  -- Buscar eventos para Roteiro 2: Família/Diurno (Parques/Cultura)
  -- Eventos culturais, parques, atividades em família durante o dia
  SELECT id INTO event2_1 FROM events 
    WHERE (
      category ILIKE '%cultura%' OR
      category ILIKE '%exposição%' OR
      category ILIKE '%teatro%' OR
      venue_name ILIKE '%museu%' OR
      venue_name ILIKE '%parque%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    AND EXTRACT(HOUR FROM start_datetime) BETWEEN 9 AND 17
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event2_2 FROM events 
    WHERE id != COALESCE(event2_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      category ILIKE '%cultura%' OR
      category ILIKE '%exposição%' OR
      category ILIKE '%teatro%' OR
      venue_name ILIKE '%museu%' OR
      venue_name ILIKE '%parque%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    AND EXTRACT(HOUR FROM start_datetime) BETWEEN 9 AND 17
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event2_3 FROM events 
    WHERE id NOT IN (COALESCE(event2_1, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(event2_2, '00000000-0000-0000-0000-000000000000'::UUID))
    AND (
      category ILIKE '%cultura%' OR
      category ILIKE '%exposição%' OR
      category ILIKE '%teatro%' OR
      venue_name ILIKE '%museu%' OR
      venue_name ILIKE '%parque%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    AND EXTRACT(HOUR FROM start_datetime) BETWEEN 9 AND 17
    ORDER BY start_datetime ASC
    LIMIT 1;

  -- Roteiro 2: Família/Diurno (Parques/Cultura)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour2_id,
    'Dia Cultural em Família',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Um roteiro perfeito para curtir com a família. Comece visitando um museuou exposição cultural, depois aproveite um parque ao ar livre e termine com uma atividade divertida. Cultura e lazer para todas as idades.',
    true,
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800',
    'salvador'
  );

  IF event2_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event2_1, '09:00', 90, 15, 'carro', 1);
  END IF;

  IF event2_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event2_2, '11:00', 120, 20, 'carro', 2);
  END IF;

  IF event2_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event2_3, '14:00', 90, NULL, NULL, 3);
  END IF;

  -- Buscar eventos para Roteiro 3: Adultos/Casais (Gastronomia/Arte)
  -- Eventos de arte, gastronomia, música para casais
  SELECT id INTO event3_1 FROM events 
    WHERE (
      category ILIKE '%arte%' OR
      category ILIKE '%galeria%' OR
      category ILIKE '%gastronomia%' OR
      category ILIKE '%jantar%' OR
      venue_name ILIKE '%restaurante%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event3_2 FROM events 
    WHERE id != COALESCE(event3_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      category ILIKE '%arte%' OR
      category ILIKE '%galeria%' OR
      category ILIKE '%gastronomia%' OR
      category ILIKE '%jantar%' OR
      venue_name ILIKE '%restaurante%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event3_3 FROM events 
    WHERE id NOT IN (COALESCE(event3_1, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(event3_2, '00000000-0000-0000-0000-000000000000'::UUID))
    AND (
      category ILIKE '%arte%' OR
      category ILIKE '%galeria%' OR
      category ILIKE '%gastronomia%' OR
      category ILIKE '%jantar%' OR
      venue_name ILIKE '%restaurante%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  -- Roteiro 3: Adultos/Casais (Gastronomia/Arte)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour3_id,
    'Arte e Gastronomia para Casais',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Um roteiro romântico para casais que apreciam arte e boa comida. Comece visitando uma galeria ou exposição, depois jante em um restaurante especial e termine com música ao vivo. Uma noite inesquecível a dois.',
    true,
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'salvador'
  );

  IF event3_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event3_1, '18:00', 90, 15, 'uber', 1);
  END IF;

  IF event3_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event3_2, '20:00', 120, 10, 'caminhando', 2);
  END IF;

  IF event3_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event3_3, '22:00', 90, NULL, NULL, 3);
  END IF;

  -- Buscar eventos para Roteiro 4: Alternativo/Underground (Bairros hipsters)
  -- Eventos indie, underground em bairros como Rio Vermelho, Barra, Itapuã
  SELECT id INTO event4_1 FROM events 
    WHERE (
      venue_name ILIKE '%rio vermelho%' OR
      venue_name ILIKE '%itapuã%' OR
      venue_name ILIKE '%barra%' OR
      category ILIKE '%indie%' OR
      category ILIKE '%underground%' OR
      category ILIKE '%alternativo%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event4_2 FROM events 
    WHERE id != COALESCE(event4_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      venue_name ILIKE '%rio vermelho%' OR
      venue_name ILIKE '%itapuã%' OR
      venue_name ILIKE '%barra%' OR
      category ILIKE '%indie%' OR
      category ILIKE '%underground%' OR
      category ILIKE '%alternativo%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  SELECT id INTO event4_3 FROM events 
    WHERE id NOT IN (COALESCE(event4_1, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(event4_2, '00000000-0000-0000-0000-000000000000'::UUID))
    AND (
      venue_name ILIKE '%rio vermelho%' OR
      venue_name ILIKE '%itapuã%' OR
      venue_name ILIKE '%barra%' OR
      category ILIKE '%indie%' OR
      category ILIKE '%underground%' OR
      category ILIKE '%alternativo%'
    )
    AND start_datetime >= NOW() 
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC
    LIMIT 1;

  -- Roteiro 4: Alternativo/Underground (Bairros hipsters)
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (
    tour4_id,
    'Vibe Underground: Rio Vermelho e Arredores',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Para quem curte o alternativo e o underground. Comece no Rio Vermelho com shows indie, depois explore a cena alternativa da Barra ou Itapuã. O lado mais autêntico e cool de Salvador.',
    true,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'salvador'
  );

  IF event4_1 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour4_id, event4_1, '20:00', 120, 25, 'uber', 1);
  END IF;

  IF event4_2 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour4_id, event4_2, '22:30', 120, 20, 'uber', 2);
  END IF;

  IF event4_3 IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour4_id, event4_3, '01:00', 90, NULL, NULL, 3);
  END IF;

END $$;

-- Verificar roteiros criados
SELECT t.title, t.curator_name, t.city, COUNT(ts.id) as paradas
FROM tours t
LEFT JOIN tour_stops ts ON ts.tour_id = t.id
WHERE t.city = 'salvador'
GROUP BY t.id, t.title, t.curator_name, t.city
ORDER BY t.created_at DESC
LIMIT 10;

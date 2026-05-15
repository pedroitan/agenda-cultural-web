-- ============================================
-- Reset completo e re-seed de Roteiros Salvador
-- Execute no Supabase SSA
-- ============================================

-- 1. Limpar tudo
TRUNCATE TABLE tour_stops CASCADE;
TRUNCATE TABLE tours CASCADE;

-- 2. Inserir os 4 roteiros do final de semana
DO $$
DECLARE
  tour1_id UUID := gen_random_uuid();
  tour2_id UUID := gen_random_uuid();
  tour3_id UUID := gen_random_uuid();
  tour4_id UUID := gen_random_uuid();

  event1_1 UUID; event1_2 UUID; event1_3 UUID;
  event2_1 UUID; event2_2 UUID; event2_3 UUID;
  event3_1 UUID; event3_2 UUID; event3_3 UUID;
  event4_1 UUID; event4_2 UUID; event4_3 UUID;
BEGIN

  -- =============================================
  -- ROTEIRO 1: Noite Jovem na Lapa e Barra
  -- =============================================
  SELECT id INTO event1_1 FROM events
    WHERE (venue_name ILIKE '%lapa%' OR venue_name ILIKE '%barra%'
        OR category ILIKE '%show%' OR category ILIKE '%festa%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event1_2 FROM events
    WHERE id != COALESCE(event1_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (venue_name ILIKE '%lapa%' OR venue_name ILIKE '%barra%'
        OR category ILIKE '%show%' OR category ILIKE '%festa%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event1_3 FROM events
    WHERE id NOT IN (
      COALESCE(event1_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(event1_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND (venue_name ILIKE '%lapa%' OR venue_name ILIKE '%barra%'
        OR category ILIKE '%show%' OR category ILIKE '%festa%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (tour1_id, 'Noite Jovem na Lapa e Barra', 'Agenda Cultural', 'Curadoria local de Salvador',
    'Uma noite imperdível para quem curte balada e shows. Comece na Lapa com a vibe boêmia, depois vá para a Barra para curtir até de manhã. O melhor da noite soteropolitana em um só roteiro.',
    true, 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', 'salvador');

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

  -- =============================================
  -- ROTEIRO 2: Dia Cultural em Família
  -- =============================================
  SELECT id INTO event2_1 FROM events
    WHERE (category ILIKE '%cultura%' OR category ILIKE '%exposição%'
        OR category ILIKE '%teatro%' OR venue_name ILIKE '%museu%' OR venue_name ILIKE '%parque%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    AND EXTRACT(HOUR FROM start_datetime) BETWEEN 9 AND 17
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event2_2 FROM events
    WHERE id != COALESCE(event2_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (category ILIKE '%cultura%' OR category ILIKE '%exposição%'
        OR category ILIKE '%teatro%' OR venue_name ILIKE '%museu%' OR venue_name ILIKE '%parque%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    AND EXTRACT(HOUR FROM start_datetime) BETWEEN 9 AND 17
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event2_3 FROM events
    WHERE id NOT IN (
      COALESCE(event2_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(event2_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND (category ILIKE '%cultura%' OR category ILIKE '%exposição%'
        OR category ILIKE '%teatro%' OR venue_name ILIKE '%museu%' OR venue_name ILIKE '%parque%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    AND EXTRACT(HOUR FROM start_datetime) BETWEEN 9 AND 17
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (tour2_id, 'Dia Cultural em Família', 'Agenda Cultural', 'Curadoria local de Salvador',
    'Um roteiro perfeito para curtir com a família. Museu, parque ao ar livre e atividade cultural. Entretenimento para todas as idades em Salvador.',
    true, 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800', 'salvador');

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

  -- =============================================
  -- ROTEIRO 3: Arte e Gastronomia para Casais
  -- =============================================
  SELECT id INTO event3_1 FROM events
    WHERE (category ILIKE '%arte%' OR category ILIKE '%galeria%'
        OR category ILIKE '%gastronomia%' OR venue_name ILIKE '%restaurante%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event3_2 FROM events
    WHERE id != COALESCE(event3_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (category ILIKE '%arte%' OR category ILIKE '%galeria%'
        OR category ILIKE '%gastronomia%' OR venue_name ILIKE '%restaurante%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event3_3 FROM events
    WHERE id NOT IN (
      COALESCE(event3_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(event3_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND (category ILIKE '%arte%' OR category ILIKE '%galeria%'
        OR category ILIKE '%gastronomia%' OR venue_name ILIKE '%restaurante%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (tour3_id, 'Arte e Gastronomia para Casais', 'Agenda Cultural', 'Curadoria local de Salvador',
    'Um roteiro romântico para casais. Galeria de arte, jantar especial e música ao vivo. Uma noite inesquecível a dois em Salvador.',
    true, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'salvador');

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

  -- =============================================
  -- ROTEIRO 4: Vibe Underground - Rio Vermelho e Arredores
  -- =============================================
  SELECT id INTO event4_1 FROM events
    WHERE (venue_name ILIKE '%rio vermelho%' OR venue_name ILIKE '%itapuã%'
        OR venue_name ILIKE '%barra%' OR category ILIKE '%indie%' OR category ILIKE '%alternativo%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event4_2 FROM events
    WHERE id != COALESCE(event4_1, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (venue_name ILIKE '%rio vermelho%' OR venue_name ILIKE '%itapuã%'
        OR venue_name ILIKE '%barra%' OR category ILIKE '%indie%' OR category ILIKE '%alternativo%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  SELECT id INTO event4_3 FROM events
    WHERE id NOT IN (
      COALESCE(event4_1, '00000000-0000-0000-0000-000000000000'::UUID),
      COALESCE(event4_2, '00000000-0000-0000-0000-000000000000'::UUID)
    )
    AND (venue_name ILIKE '%rio vermelho%' OR venue_name ILIKE '%itapuã%'
        OR venue_name ILIKE '%barra%' OR category ILIKE '%indie%' OR category ILIKE '%alternativo%')
    AND start_datetime >= NOW()
    AND start_datetime <= NOW() + INTERVAL '3 days'
    ORDER BY start_datetime ASC LIMIT 1;

  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url, city)
  VALUES (tour4_id, 'Vibe Underground: Rio Vermelho e Arredores', 'Agenda Cultural', 'Curadoria local de Salvador',
    'Para quem curte o alternativo e o underground. Shows indie no Rio Vermelho, eventos alternativos na Barra e Itapuã. O lado mais autêntico e cool de Salvador.',
    true, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'salvador');

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

-- Verificar resultado final
SELECT t.title, t.city, COUNT(ts.id) as paradas
FROM tours t
LEFT JOIN tour_stops ts ON ts.tour_id = t.id
GROUP BY t.id, t.title, t.city
ORDER BY t.created_at;

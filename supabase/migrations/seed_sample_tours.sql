-- Roteiros curados baseados em eventos reais do banco
-- IMPORTANTE: Execute SOMENTE após ter eventos com district='comercio'

DO $$
DECLARE
  tour1_id UUID := gen_random_uuid();
  tour2_id UUID := gen_random_uuid();
  tour3_id UUID := gen_random_uuid();
  event_samba_lua UUID;
  event_os_thiagos UUID;
  event_largo_tieta UUID;
  event_teatro_sesc UUID;
  event_ifa_reggae UUID;
  event_quincas UUID;
BEGIN
  -- Buscar IDs de eventos reais
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

  -- ROTEIRO 1: Noite de Samba no Pelourinho
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url)
  VALUES (
    tour1_id,
    'Noite de Samba no Pelourinho',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Um mergulho na tradição do samba baiano. Comece com o Samba de Lua no Clube do Samba, vá para o Largo da Tieta e termine com Os Thiagos. Uma noite inesquecível no coração do Pelourinho.',
    true,
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
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

  -- ROTEIRO 2: Cultura e Teatro no Centro Histórico
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url)
  VALUES (
    tour2_id,
    'Cultura e Teatro no Centro Histórico',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Experiência completa de arte e cultura no Pelourinho. Teatro, música e a riqueza histórica do centro de Salvador em uma só noite.',
    true,
    'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800'
  );

  IF event_teatro_sesc IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event_teatro_sesc, '19:00', 90, 15, 'caminhando', 1);
  END IF;

  IF event_quincas IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour2_id, event_quincas, '21:00', 90, NULL, NULL, 2);
  END IF;

  -- ROTEIRO 3: Reggae e Afrobrasilidade
  INSERT INTO tours (id, title, curator_name, curator_bio, description, is_published, image_url)
  VALUES (
    tour3_id,
    'Reggae e Afrobrasilidade',
    'Agenda Cultural',
    'Curadoria local de Salvador',
    'Uma viagem pela sonoridade negra de Salvador. Reggae, samba e as raízes culturais da capital baiana em roteiro imperdível.',
    true,
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800'
  );

  IF event_ifa_reggae IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event_ifa_reggae, '21:00', 120, 10, 'caminhando', 1);
  END IF;

  IF event_samba_lua IS NOT NULL THEN
    INSERT INTO tour_stops (tour_id, event_id, horario, duracao_min, deslocamento_proximo_min, modo_deslocamento, order_index)
    VALUES (tour3_id, event_samba_lua, '23:00', 90, NULL, NULL, 2);
  END IF;

END $$;

-- Verificar roteiros criados
SELECT t.title, t.curator_name, COUNT(ts.id) as paradas
FROM tours t
LEFT JOIN tour_stops ts ON ts.tour_id = t.id
GROUP BY t.id, t.title, t.curator_name;

-- Atualizar campo district baseado em palavras-chave no nome do local
-- Isso atribui automaticamente o distrito correto aos eventos existentes

-- Distrito do Comércio (Centro Histórico, Pelourinho, Terreiro de Jesus, Rua Chile)
UPDATE events
SET district = 'comercio'
WHERE venue_name ILIKE '%pelourinho%'
   OR venue_name ILIKE '%terreiro de jesus%'
   OR venue_name ILIKE '%rua chile%'
   OR venue_name ILIKE '%centro histórico%'
   OR venue_name ILIKE '%são joaquim%'
   OR venue_name ILIKE '%praça da sé%'
   OR venue_name ILIKE '%catedral basílica%';

-- Centro
UPDATE events
SET district = 'centro'
WHERE venue_name ILIKE '%centro%'
   OR venue_name ILIKE '%barra%'
   OR venue_name ILIKE '%rio vermelho%'
   OR venue_name ILIKE '%farol da barra%';

-- Barroquinha
UPDATE events
SET district = 'barroquinha'
WHERE venue_name ILIKE '%barroquinha%'
   OR venue_name ILIKE '%lavradio%';

-- Nazaré
UPDATE events
SET district = 'nazare'
WHERE venue_name ILIKE '%nazare%'
   OR venue_name ILIKE '%cabula%'
   OR venue_name ILIKE '%pitu%';

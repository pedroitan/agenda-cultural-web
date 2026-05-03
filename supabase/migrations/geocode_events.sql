-- Geocoding automático de eventos baseado em palavras-chave no venue_name
-- Atribui latitude/longitude para locais conhecidos de Salvador

-- Pelourinho / Centro Histórico
UPDATE events
SET latitude = -12.9724, longitude = -38.5014
WHERE venue_name ILIKE '%pelourinho%'
   OR venue_name ILIKE '%terreiro de jesus%'
   OR venue_name ILIKE '%praça da sé%'
   OR venue_name ILIKE '%centro histórico%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Barra
UPDATE events
SET latitude = -13.0028, longitude = -38.5116
WHERE venue_name ILIKE '%farol da barra%'
   OR venue_name ILIKE '%barra%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Rio Vermelho
UPDATE events
SET latitude = -13.0119, longitude = -38.4650
WHERE venue_name ILIKE '%rio vermelho%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Campo Grande
UPDATE events
SET latitude = -12.9834, longitude = -38.4630
WHERE venue_name ILIKE '%campo grande%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Pituaçu
UPDATE events
SET latitude = -12.9333, longitude = -38.3833
WHERE venue_name ILIKE '%pituaçu%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Itaigara
UPDATE events
SET latitude = -13.0083, longitude = -38.4567
WHERE venue_name ILIKE '%itaigara%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Caminho das Árvores
UPDATE events
SET latitude = -12.9983, longitude = -38.4567
WHERE venue_name ILIKE '%caminho das árvores%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Liberdade
UPDATE events
SET latitude = -12.9556, longitude = -38.5028
WHERE venue_name ILIKE '%liberdade%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Nazaré
UPDATE events
SET latitude = -12.9750, longitude = -38.4944
WHERE venue_name ILIKE '%nazare%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Cabula
UPDATE events
SET latitude = -12.9250, longitude = -38.4083
WHERE venue_name ILIKE '%cabula%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Centro (geral)
UPDATE events
SET latitude = -12.9714, longitude = -38.5014
WHERE venue_name ILIKE '%centro%'
   AND venue_name NOT ILIKE '%centro histórico%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Brotas
UPDATE events
SET latitude = -13.0000, longitude = -38.4833
WHERE venue_name ILIKE '%brotas%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Ondina
UPDATE events
SET latitude = -13.0083, longitude = -38.4750
WHERE venue_name ILIKE '%ondina%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Amaralina
UPDATE events
SET latitude = -13.0167, longitude = -38.4667
WHERE venue_name ILIKE '%amaralina%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Pituba
UPDATE events
SET latitude = -13.0056, longitude = -38.4389
WHERE venue_name ILIKE '%pituba%'
   AND (latitude IS NULL OR longitude IS NULL);

-- Ver resultado
SELECT 
  COUNT(*) as total,
  COUNT(latitude) as com_coordenadas,
  COUNT(*) - COUNT(latitude) as sem_coordenadas
FROM events
WHERE start_datetime > NOW();

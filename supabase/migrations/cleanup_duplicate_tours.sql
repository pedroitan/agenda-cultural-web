-- ============================================
-- Limpar tours duplicados - manter apenas 1 de cada título por cidade
-- ============================================

DELETE FROM tour_stops
WHERE tour_id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title, city ORDER BY created_at ASC) AS rn
    FROM tours
  ) t
  WHERE rn > 1
);

DELETE FROM tours
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title, city ORDER BY created_at ASC) AS rn
    FROM tours
  ) t
  WHERE rn > 1
);

-- Verificar resultado
SELECT title, city, COUNT(*) FROM tours GROUP BY title, city ORDER BY city, title;

-- Diagnóstico de cliques
-- Cole este SQL no Supabase SQL Editor

-- 1. Resumo geral
SELECT 
  COUNT(*) as total_eventos,
  COUNT(CASE WHEN click_count > 0 THEN 1 END) as eventos_com_cliques,
  SUM(click_count) as soma_total_cliques,
  MAX(click_count) as max_cliques_em_evento,
  AVG(click_count) as media_cliques
FROM events;

-- 2. Top 20 eventos com mais cliques (para comparar com o dashboard)
SELECT 
  id,
  title,
  click_count,
  source,
  start_datetime,
  created_at
FROM events
WHERE click_count > 0
ORDER BY click_count DESC
LIMIT 20;

-- 3. Verificar se há eventos duplicados (mesmo external_id)
SELECT 
  external_id,
  COUNT(*) as duplicatas,
  SUM(click_count) as cliques_somados,
  STRING_AGG(id::text, ', ') as ids
FROM events
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1
ORDER BY duplicatas DESC
LIMIT 10;

-- 4. Distribuição de cliques por fonte
SELECT 
  source,
  COUNT(*) as eventos,
  SUM(click_count) as total_cliques,
  AVG(click_count) as media_cliques
FROM events
GROUP BY source
ORDER BY total_cliques DESC;

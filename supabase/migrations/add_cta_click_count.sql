-- Adicionar campo para rastrear cliques no botão CTA (Comprar Ingresso)
-- Diferente de click_count (clicar no card para ver detalhes)

ALTER TABLE events
ADD COLUMN cta_click_count INTEGER DEFAULT 0;

-- Criar índice para ordenar por CTA clicks
CREATE INDEX idx_events_cta_clicks ON events(cta_click_count DESC);

-- Adicionar comentário
COMMENT ON COLUMN events.cta_click_count IS 'Cliques no botão CTA (Comprar Ingresso) - métrica de conversão separada de click_count (visualização)';

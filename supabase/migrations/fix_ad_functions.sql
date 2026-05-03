-- Atualizar funções de tracking de anúncios com SECURITY DEFINER
-- Execute este script no Supabase SQL Editor se a contagem de cliques não está funcionando

-- Recriar função de impressões com SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads 
  SET impressions = impressions + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar função de cliques com SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_ad_click(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads 
  SET clicks = clicks + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

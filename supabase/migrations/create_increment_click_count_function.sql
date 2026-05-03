-- Função SQL para incremento atômico de click_count
-- Evita race conditions e garante contagem precisa

CREATE OR REPLACE FUNCTION increment_click_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

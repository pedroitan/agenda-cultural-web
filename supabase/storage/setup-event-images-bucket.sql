-- Criar bucket de imagens de eventos no Supabase Storage
-- Execute este script no Supabase SQL Editor

-- 1. Criar o bucket 'event-images' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar política de acesso público para leitura
CREATE POLICY IF NOT EXISTS "Public Read Access for Event Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- 3. Criar política de acesso para upload (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated Upload for Event Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- 4. Criar política de acesso para deletar (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated Delete for Event Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');

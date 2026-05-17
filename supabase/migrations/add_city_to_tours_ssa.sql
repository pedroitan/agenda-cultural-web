-- Adiciona coluna city à tabela tours (necessária para multi-tenant)
-- Aplicar no Supabase SSA (ifocsakyvzkqdhrfmgbz)

ALTER TABLE tours ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'salvador';
CREATE INDEX IF NOT EXISTS idx_tours_city ON tours(city);

-- Atualizar tours existentes (caso haja algum sem city)
UPDATE tours SET city = 'salvador' WHERE city IS NULL;

-- Verificar
SELECT id, title, city FROM tours;

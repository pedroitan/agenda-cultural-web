-- Adicionar campo city à tabela tours para suportar multi-cidade
ALTER TABLE tours ADD COLUMN IF NOT EXISTS city TEXT;

-- Atualizar tours existentes para Salvador
UPDATE tours SET city = 'salvador' WHERE city IS NULL;

-- Adicionar índice para city
CREATE INDEX IF NOT EXISTS idx_tours_city ON tours(city);

-- Adicionar constraint para garantir que city não seja nulo em novos registros
ALTER TABLE tours ALTER COLUMN city SET NOT NULL;

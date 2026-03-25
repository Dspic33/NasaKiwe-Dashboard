-- ACTUALIZACIÓN PARA SEPARAR POR PROYECTO
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Agregar la columna proyecto_id
ALTER TABLE evidencias_obra 
ADD COLUMN IF NOT EXISTS proyecto_id TEXT;

-- 2. (Opcional) Asignar los registros existentes al proyecto 1 si son de Vitoncó
UPDATE evidencias_obra SET proyecto_id = '1' WHERE proyecto_id IS NULL;

-- 3. Refrescar esquema
NOTIFY pgrst, 'reload schema';

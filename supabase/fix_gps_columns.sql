-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE PARA ARREGLAR EL ERROR DE COLUMNAS
-- Esto agregará las columnas de GPS que faltan en la tabla existente.

ALTER TABLE evidencias_obra 
ADD COLUMN IF NOT EXISTS latitud DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitud DOUBLE PRECISION;

-- Forzar recarga del esquema (opcional, pero recomendado si el error persiste)
NOTIFY pgrst, 'reload schema';

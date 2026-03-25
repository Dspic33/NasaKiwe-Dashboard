-- ACTUALIZACIÓN PARA 3 FOTOS Y PROGRESO MANUAL
ALTER TABLE evidencias_obra 
ADD COLUMN IF NOT EXISTS foto_url_2 TEXT,
ADD COLUMN IF NOT EXISTS foto_url_3 TEXT,
ADD COLUMN IF NOT EXISTS progreso INTEGER DEFAULT 0;

-- Opcional: Si quieres que los registros viejos se marquen como 100%
UPDATE evidencias_obra SET progreso = 100 WHERE progreso IS NULL OR progreso = 0;

-- Notificar recarga de caché
NOTIFY pgrst, 'reload schema';

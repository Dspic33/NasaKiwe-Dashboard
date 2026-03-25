-- REINICIO TOTAL DE EVIDENCIAS Y AVANCE
-- ADVERTENCIA: Esto borrará todas las fotos y registros de la base de datos.
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Vaciar la tabla de evidencias
TRUNCATE TABLE evidencias_obra;

-- 2. Refrescar caché de la API
NOTIFY pgrst, 'reload schema';

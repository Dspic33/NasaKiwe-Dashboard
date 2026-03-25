-- TABLA SIMPLE PARA EVIDENCIAS DE APP MÓVIL
-- Ejecuta esto en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS evidencias_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_num TEXT NOT NULL,          -- Ej: '01', '02', '03'
  actividad_id TEXT NOT NULL,          -- UUID del catálogo de actividades
  actividad_nombre TEXT,               -- Nombre de la actividad para facilidad
  foto_url TEXT,                        -- URL pública de Supabase Storage
  comentario TEXT,
  latitud DOUBLE PRECISION,
  longitud DOUBLE PRECISION,
  fecha_captura TIMESTAMPTZ DEFAULT NOW(),
  usuario_id UUID,                      -- Opcional
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar acceso público para pruebas
ALTER TABLE evidencias_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert" ON evidencias_obra FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Select" ON evidencias_obra FOR SELECT USING (true);

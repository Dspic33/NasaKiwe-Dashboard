-- TABLAS PRINCIPALES

-- 1. Proyectos
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  estado TEXT DEFAULT 'ACTIVO', -- ACTIVO, SUSPENDIDO, FINALIZADO
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Viviendas
CREATE TABLE viviendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL,
  direccion TEXT,
  estado TEXT DEFAULT 'PENDIENTE',
  contratista_id UUID, -- Referencia a auth.users (o tabla perfiles)
  residente_id UUID,   -- Referencia a auth.users (o tabla perfiles)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Catálogo de Actividades (Plantilla secuencial)
CREATE TABLE actividades_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  duracion_dias_estimada INTEGER DEFAULT 1
);

-- 4. Actividades por Vivienda (Instancia real)
CREATE TABLE actividades_vivienda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_id UUID REFERENCES viviendas(id) ON DELETE CASCADE,
  catalogo_id UUID REFERENCES actividades_catalogo(id),
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance BETWEEN 0 AND 100),
  estado TEXT DEFAULT 'BLOQUEADA', -- BLOQUEADA, EN_PROGRESO, COMPLETADA, VALIDADA
  desbloqueada_en TIMESTAMPTZ,
  validada_por UUID,
  validada_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Registros de Bitácora (Avances diarios/frecuentes)
CREATE TABLE registros_bitacora (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_vivienda_id UUID REFERENCES actividades_vivienda(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  comentario TEXT,
  porcentaje_registrado INTEGER,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  latitud DOUBLE PRECISION,
  longitud DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Fotos de Registro
CREATE TABLE fotos_registro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID REFERENCES registros_bitacora(id) ON DELETE CASCADE,
  url_storage TEXT NOT NULL,
  nombre_archivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Actas (Generadas por el Asesor)
CREATE TABLE actas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_id UUID REFERENCES viviendas(id),
  tipo TEXT NOT NULL, -- PARCIAL, PROACTA, FINAL
  generada_por UUID,
  actividades_incluidas JSONB, -- Lista de IDs de actividades
  fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
  url_pdf TEXT,
  firmada BOOLEAN DEFAULT FALSE,
  observaciones TEXT
);

-- 8. Perfiles de Usuario (Extensión de Auth)
CREATE TABLE usuarios_perfiles (
  id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT NOT NULL, -- RESIDENTE, CONTRATISTA, ASESOR, INSPECTOR
  proyecto_asignado_id UUID REFERENCES proyectos(id)
);

-- RLS POLICIES (Básico)
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON proyectos FOR SELECT USING (true);

ALTER TABLE viviendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON viviendas FOR SELECT USING (true);

ALTER TABLE registros_bitacora ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated Insert" ON registros_bitacora FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated Select" ON registros_bitacora FOR SELECT TO authenticated USING (true);

-- STORAGE BUCKET
-- (Debe ser configurado via consola o API de Supabase)
-- Bucket: fotos-bitacora

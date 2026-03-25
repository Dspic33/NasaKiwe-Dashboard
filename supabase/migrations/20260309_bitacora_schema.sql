-- Esquema de Base de Datos para Bitácora Nasa Kiwe

-- 1. PROYECTOS (Contratos de Obra)
CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_contrato TEXT UNIQUE NOT NULL,
    objeto TEXT NOT NULL,
    municipio TEXT NOT NULL,
    estado TEXT DEFAULT 'ACTIVO',
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. VIVIENDAS (Unidades habitacionales por proyecto)
CREATE TABLE viviendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    identificador TEXT NOT NULL, -- Ej: "Casa 01", "Casa 02"
    estado TEXT DEFAULT 'EN_PROGRESO', -- EN_PROGRESO, COMPLETADA, BLOQUEADA
    avance_porcentaje INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(proyecto_id, identificador)
);

-- 3. ACTIVIDADES_CATALOGO (Definición técnica de los ítems de obra)
CREATE TABLE actividades_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL, -- Ej: "1.01", "2.01"
    capitulo TEXT NOT NULL, -- Ej: "Preliminares", "Cimentación"
    descripcion TEXT NOT NULL,
    unidad_medida TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. REGISTRO_AVANCES (Seguimiento diario por vivienda y actividad)
CREATE TABLE registro_avances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vivienda_id UUID REFERENCES viviendas(id) ON DELETE CASCADE,
    actividad_id UUID REFERENCES actividades_catalogo(id),
    residente_id UUID NOT NULL, -- ID del usuario que reporta
    completada BOOLEAN DEFAULT FALSE,
    fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    observaciones TEXT,
    -- Campos para sincronización offline
    local_id TEXT, -- ID generado por el móvil para evitar duplicados en sync
    sincronizado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. FOTOS_EVIDENCIA (Almacenamiento de metadatos de imágenes)
CREATE TABLE fotos_evidencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registro_id UUID REFERENCES registro_avances(id) ON DELETE CASCADE,
    url_foto TEXT NOT NULL, -- URL del bucket de Supabase Storage
    latitud DECIMAL(9,6), -- Georreferenciación (opcional para control)
    longitud DECIMAL(9,6),
    tomada_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. INDICES PARA RENDIMIENTO
CREATE INDEX idx_viviendas_proyecto ON viviendas(proyecto_id);
CREATE INDEX idx_avances_vivienda ON registro_avances(vivienda_id);
CREATE INDEX idx_fotos_registro ON fotos_evidencia(registro_id);

-- 7. REGLAS DE SEGURIDAD (RLS)
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE viviendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_avances ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_evidencia ENABLE ROW LEVEL SECURITY;

-- Los residentes pueden insertar avances y fotos
-- Los asesores y supervisores pueden ver todo

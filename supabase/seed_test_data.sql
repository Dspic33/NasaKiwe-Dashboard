-- SCRIPT DE DATOS DE PRUEBA (PARA TESTEO DE APK)
-- Copia y pega esto en el SQL Editor de Supabase y dale a 'Run'

-- 1. Crear un proyecto de prueba
INSERT INTO proyectos (id, nombre, ubicacion, estado)
VALUES ('55615705-5c1a-4286-990a-6e5a6a6a6a70', 'Proyecto Nasa Kiwe - Demo', 'Popayán', 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

-- 2. Crear una vivienda (Casa 01)
INSERT INTO viviendas (id, proyecto_id, numero_lote, estado)
VALUES ('55615705-5c1a-4286-990a-6e5a6a6a6a7a', '55615705-5c1a-4286-990a-6e5a6a6a6a70', 'Casa 01', 'EN_PROGRESO')
ON CONFLICT (id) DO NOTHING;

-- 3. Crear actividades en el catálogo
INSERT INTO actividades_catalogo (id, nombre, orden)
VALUES ('55615705-5c1a-4286-990a-6e5a6a6a6a01', 'Localización y replanteo', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Vincular actividad a la vivienda (Aquí es donde la APK guardará los datos)
INSERT INTO actividades_vivienda (id, vivienda_id, catalogo_id, estado, porcentaje_avance)
VALUES ('55615705-5c1a-4286-990a-6e5a6a6a6a6a', '55615705-5c1a-4286-990a-6e5a6a6a6a7a', '55615705-5c1a-4286-990a-6e5a6a6a6a01', 'EN_PROGRESO', 45)
ON CONFLICT (id) DO NOTHING;

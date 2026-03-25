-- SCRIPT DE SINCRONIZACIÓN WEB -> MÓVIL
-- Este script inserta el proyecto que referencia el contrato demo de la web

-- 1. Insertar Proyecto
INSERT INTO proyectos (id, nombre, municipio, resguardo, numero_proceso, estado)
VALUES (
    '6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f7a', 
    'Proyecto Habitacional Popayán Fase II', 
    'Popayán', 
    'Pueblo Nasa', 
    'CD-VIV-2026-N391', 
    'ACTIVO'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    municipio = EXCLUDED.municipio;

-- 2. Insertar Viviendas de ejemplo
INSERT INTO viviendas (id, proyecto_id, numero_lote, beneficiario, municipio, estado)
VALUES 
    ('6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f71', '6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f7a', '01', 'María Fernanda Castro', 'Popayán', 'EN_PROGRESO'),
    ('6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f72', '6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f7a', '02', 'Juan Camilo Manzano', 'Popayán', 'PENDIENTE'),
    ('6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f73', '6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f7a', '03', 'Claudia Jiménez', 'Popayán', 'PENDIENTE')
ON CONFLICT (id) DO NOTHING;

-- SCRIPT DE DATOS DE PRUEBA (15 VIVIENDAS VITONCÓ)
-- Copia y pega esto en el SQL Editor de Supabase y dale a 'Run'

-- 1. Crear el proyecto "Resguardo Vitoncó"
INSERT INTO proyectos (id, nombre, ubicacion, estado)
VALUES ('p1', 'Resguardo Vitoncó - 15 Viviendas', 'Páez, Cauca', 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

-- 2. Crear las 15 viviendas asociadas al proyecto "p1"
INSERT INTO viviendas (id, proyecto_id, numero, estado, numero_lote) VALUES
('v1', 'p1', '01', 'EN_PROGRESO', 'Lote 01'),
('v2', 'p1', '02', 'EN_PROGRESO', 'Lote 02'),
('v3', 'p1', '03', 'EN_PROGRESO', 'Lote 03'),
('v4', 'p1', '04', 'PLANEADA', 'Lote 04'),
('v5', 'p1', '05', 'PLANEADA', 'Lote 05'),
('v6', 'p1', '06', 'PLANEADA', 'Lote 06'),
('v7', 'p1', '07', 'PLANEADA', 'Lote 07'),
('v8', 'p1', '08', 'PLANEADA', 'Lote 08'),
('v9', 'p1', '09', 'PLANEADA', 'Lote 09'),
('v10', 'p1', '10', 'PLANEADA', 'Lote 10'),
('v11', 'p1', '11', 'PLANEADA', 'Lote 11'),
('v12', 'p1', '12', 'PLANEADA', 'Lote 12'),
('v13', 'p1', '13', 'PLANEADA', 'Lote 13'),
('v14', 'p1', '14', 'PLANEADA', 'Lote 14'),
('v15', 'p1', '15', 'PLANEADA', 'Lote 15')
ON CONFLICT (id) DO NOTHING;

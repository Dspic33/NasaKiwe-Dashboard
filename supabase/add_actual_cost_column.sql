-- SQL to update the activity catalog with precise costs and names
-- This script adds the columns and populates the catalog with the 80+ activities provided by the user.

-- 1. Add cost columns if they don't exist
ALTER TABLE proyectos 
ADD COLUMN IF NOT EXISTS valor_estimado FLOAT DEFAULT 95000000,
ADD COLUMN IF NOT EXISTS valor_ejecutado_total FLOAT DEFAULT 0;

ALTER TABLE actividades_catalogo
ADD COLUMN IF NOT EXISTS valor_estimado FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS capitulo TEXT;

ALTER TABLE actividades_vivienda
ADD COLUMN IF NOT EXISTS valor_ejecutado FLOAT DEFAULT 0;

-- 2. Clear existing catalog to avoid duplicates (optional, but recommended for clean start)
-- DELETE FROM actividades_catalogo;

-- 3. Insert/Upsert Catalog
INSERT INTO actividades_catalogo (id, capitulo, nombre, orden, valor_estimado)
VALUES 
-- 1. PRELIMINARES
('55615705-5c1a-4286-990a-6e5a6a6a6a6a', '1. Preliminares', '1.01 Localización y replanteo', 1, 203176),
('55615705-5c1a-4286-990a-6e5a6a6a6a6b', '1. Preliminares', '1.02 Excavación manual', 2, 266935),
('55615705-5c1a-4286-990a-6e5a6a6a6a6c', '1. Preliminares', '1.03 Relleno con material de sitio', 3, 250627),
('55615705-5c1a-4286-990a-6e5a6a6a6a6d', '1. Preliminares', '1.04 Sobre acarreo de materiales', 4, 81872),

-- 2. CIMENTACION
('55615705-5c1a-4286-990a-6e5a6a6a6a6e', '2. Cimentación', '2.01 Solado de limpieza', 5, 695281),
('55615705-5c1a-4286-990a-6e5a6a6a6a6f', '2. Cimentación', '2.02 Viga de cimentación 0.20*0.25m', 6, 5063720),
('55615705-5c1a-4286-990a-6e5a6a6a6a60', '2. Cimentación', '2.03 Viga de cimentación 0.20*0.20m', 7, 903408),
('55615705-5c1a-4286-990a-6e5a6a6a6a61', '2. Cimentación', '2.04 Concreto Ciclópeo', 8, 1834952),

-- 3. ESTRUCTURA
('55615705-5c1a-4286-990a-6e5a6a6a6a62', '3. Estructura', '3.01 Viga de amarre', 9, 3509252),
('55615705-5c1a-4286-990a-6e5a6a6a6a63', '3. Estructura', '3.02 Viga cumbrera', 10, 645200),
('55615705-5c1a-4286-990a-6e5a6a6a6a64', '3. Estructura', '3.03 Columna 0.20*0.20m', 11, 338697),
('55615705-5c1a-4286-990a-6e5a6a6a6a65', '3. Estructura', '3.04 Columna 0.12*0.20m', 12, 3596784),
('55615705-5c1a-4286-990a-6e5a6a6a6a66', '3. Estructura', '3.05 Cinta de amarre', 13, 1272571),
('55615705-5c1a-4286-990a-6e5a6a6a6a67', '3. Estructura', '3.06 Acero de refuerzo Grado 60', 14, 7528934),

-- 4. CUBIERTA
('55615705-5c1a-4286-990a-6e5a6a6a6a68', '4. Cubierta', '4.01 Correas tipo Perlín', 15, 2674871),
('55615705-5c1a-4286-990a-6e5a6a6a6a69', '4. Cubierta', '4.02 Teja de fibrocemento P7', 16, 4515180),
('55615705-5c1a-4286-990a-6e5a6a6a6b6a', '4. Cubierta', '4.03 Caballete fijo', 17, 483694),
('55615705-5c1a-4286-990a-6e5a6a6a6b6b', '4. Cubierta', '4.04 Cumbreras y limatesas', 18, 246339),
('55615705-5c1a-4286-990a-6e5a6a6a6b6c', '4. Cubierta', '4.05 Solapa en lámina metálica', 19, 56080),

-- 5. PISOS
('55615705-5c1a-4286-990a-6e5a6a6a6b6d', '5. Pisos', '5.01 Piso primario e=0.07m', 20, 2701419),
('55615705-5c1a-4286-990a-6e5a6a6a6b6e', '5. Pisos', '5.02 Piso cerámico comercial', 21, 3859200),
('55615705-5c1a-4286-990a-6e5a6a6a6b6f', '5. Pisos', '5.03 Guardaescoba cerámico', 22, 668928),
('55615705-5c1a-4286-990a-6e5a6a6a6b70', '5. Pisos', '5.04 Andén en concreto 21MPa', 23, 852377),

-- 6. MAMPOSTERÍA (Nuevas)
(gen_random_uuid(), '6. Mampostería', '6.01 Muro ladrillo', 24, 8046374),
(gen_random_uuid(), '6. Mampostería', '6.02 Mezón de cocina concreto', 25, 0), -- Ajustar si llega valor
(gen_random_uuid(), '6. Mampostería', '6.03 Repello Muro en mortero 1:3', 26, 224826),

-- 7. HIDROSANITARIO (Nuevas)
(gen_random_uuid(), '7. Hidrosanitario', '7.01 Punto sanitario PVC 4"', 27, 71434),
(gen_random_uuid(), '7. Hidrosanitario', '7.02 Punto sanitario PVC 2"', 28, 181085),
(gen_random_uuid(), '7. Hidrosanitario', '7.03 Puntos hidráulicos PVC 1/2" RDE13.5', 29, 219250),
(gen_random_uuid(), '7. Hidrosanitario', '7.04 Red hidráulica PVC-P 1/2"', 30, 85778),
(gen_random_uuid(), '7. Hidrosanitario', '7.05 Red sanitaria PVC-S 2" pesado', 31, 181102),
(gen_random_uuid(), '7. Hidrosanitario', '7.06 Red de aguas lluvias PVC 3"', 32, 957704),
(gen_random_uuid(), '7. Hidrosanitario', '7.07 Red sanitaria PVC-S 4" pesado', 33, 465215),
(gen_random_uuid(), '7. Hidrosanitario', '7.08 Caja de inspección 0,50*0,50m', 34, 715002),
(gen_random_uuid(), '7. Hidrosanitario', '7.09 Rejilla metálica con sosco 2"', 35, 20259),
(gen_random_uuid(), '7. Hidrosanitario', '7.10 Llaves de paso 1/2"', 36, 49290),
(gen_random_uuid(), '7. Hidrosanitario', '7.11 Ducha + registro y pomo', 37, 94858),

-- 8. ELÉCTRICAS (Nuevas)
(gen_random_uuid(), '8. Eléctricas', '8.01 Acometida de medidor 1X8f+8n', 38, 30000),
(gen_random_uuid(), '8. Eléctricas', '8.02 Sistema de aterrizaje tablero', 39, 170892),
(gen_random_uuid(), '8. Eléctricas', '8.03 Tablero eléctrico 1f,6', 40, 290647),
(gen_random_uuid(), '8. Eléctricas', '8.04 Salida toma monofásica doble', 41, 1265470),
(gen_random_uuid(), '8. Eléctricas', '8.05 Salida toma monofásica doble GFSI', 42, 168422),
(gen_random_uuid(), '8. Eléctricas', '8.06 Salida para lámpara pvc', 43, 1189179),

-- 9. CARPINTERIA (Nuevas)
(gen_random_uuid(), '9. Carpintería', '9.01 Puerta lamina de acero C=20', 44, 1617853),
(gen_random_uuid(), '9. Carpintería', '9.02 Luceta lamina de acero C=20', 45, 84461),
(gen_random_uuid(), '9. Carpintería', '9.03 Ventana metálica de C=20', 46, 1571776),
(gen_random_uuid(), '9. Carpintería', '9.04 Canal metálico C= 20', 47, 2111476),
(gen_random_uuid(), '9. Carpintería', '9.05 Vidrio liso de 4 Mm', 48, 510377),

-- 10. ENCHAPES Y APARATOS (Nuevas)
(gen_random_uuid(), '10. Enchapes', '10.01 Enchape piso-muro tradicional', 49, 907074),
(gen_random_uuid(), '10. Enchapes', '10.02 Combo sanitario + accesorios', 50, 353762),
(gen_random_uuid(), '10. Enchapes', '10.03 Lavaplatos acero inox 60*40', 51, 285701),
(gen_random_uuid(), '10. Enchapes', '10.04 Revestimiento graniplast', 52, 798267),
(gen_random_uuid(), '10. Enchapes', '10.05 Lavadero prefabricado enchapado', 53, 318322),

-- 11. SANEAMIENTO (Nuevas)
(gen_random_uuid(), '11. Saneamiento', '11.01 Excavación manual Saneamiento', 54, 190831),
(gen_random_uuid(), '11. Saneamiento', '11.02 Relleno compactación manual', 55, 134379),
(gen_random_uuid(), '11. Saneamiento', '11.03 Red hidráulica PVC 1/2"', 56, 46788),
(gen_random_uuid(), '11. Saneamiento', '11.04 Tubería PVC 110 mm', 57, 473892),
(gen_random_uuid(), '11. Saneamiento', '11.05 Tubería PVC-S 4" pesado', 58, 94364),
(gen_random_uuid(), '11. Saneamiento', '11.06 Tubería PVC-S 2" pesado', 59, 100612),
(gen_random_uuid(), '11. Saneamiento', '11.07 Adaptador PVC 110 mm x 4"', 60, 25632),
(gen_random_uuid(), '11. Saneamiento', '11.08 Tee PVC-S 4" pesado', 61, 42452),
(gen_random_uuid(), '11. Saneamiento', '11.09 Tee PVC-S 2" pesado', 62, 38058),
(gen_random_uuid(), '11. Saneamiento', '11.10 Codo PVC-S 4" pesado', 63, 51126),
(gen_random_uuid(), '11. Saneamiento', '11.11 Codo PVC-S 2"*90 pesado', 64, 38058),
(gen_random_uuid(), '11. Saneamiento', '11.12 Trampa de grasas 105L', 65, 238200),
(gen_random_uuid(), '11. Saneamiento', '11.13 Tanque Séptico 1000L', 66, 729603),
(gen_random_uuid(), '11. Saneamiento', '11.14 FAFA 1000L', 67, 930664),
(gen_random_uuid(), '11. Saneamiento', '11.15 Rosetón en Polietileno', 68, 576314),
(gen_random_uuid(), '11. Saneamiento', '11.16 Arena Gruesa tanques', 69, 39450),
(gen_random_uuid(), '11. Saneamiento', '11.17 Caja de inspección 0,70 x 0,70 m', 70, 515702),

-- 12. OTROS (Nuevas)
(gen_random_uuid(), '12. Otros', '12.01 Aseo general', 71, 45000),
(gen_random_uuid(), '12. Otros', '12.02 Elaboración de planos récord', 72, 90000),
(gen_random_uuid(), '12. Otros', '12.03 Ensayos de laboratorio', 73, 1504325),

-- AUI (Calculados sobre el total directo si es necesario, o puestos como items finales)
(gen_random_uuid(), '13. AUI', 'Administración (24%)', 74, 17149304),
(gen_random_uuid(), '13. AUI', 'Imprevistos (3%)', 75, 2143663),
(gen_random_uuid(), '13. AUI', 'Utilidad (5%)', 76, 3572771),
(gen_random_uuid(), '13. AUI', 'IVA sobre Utilidad', 77, 678826)

ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  capitulo = EXCLUDED.capitulo,
  valor_estimado = EXCLUDED.valor_estimado,
  orden = EXCLUDED.orden;

-- 4. Notify schema reload
NOTIFY pgrst, 'reload schema';

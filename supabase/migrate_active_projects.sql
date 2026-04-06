-- ====================================================================
-- SCRIPT DE MIGRACIÓN: NasaKiwe - Catálogo de 77 Actividades
-- ====================================================================
-- Este script agrega las actividades faltantes a todas las viviendas 
-- existentes para que coincidan con el nuevo catálogo de 77 actividades.
-- ====================================================================

DO $$
DECLARE
    v_vivienda_record RECORD;
    v_actividad_catalogo RECORD;
BEGIN
    RAISE NOTICE 'Iniciando migración de actividades para viviendas existentes...';

    -- 1. Iterar sobre todos los registros de viviendas actuales
    FOR v_vivienda_record IN SELECT id FROM viviendas LOOP
        
        RAISE NOTICE 'Procesando Vivienda ID: %', v_vivienda_record.id;

        -- 2. Para cada actividad en el catálogo oficial
        FOR v_actividad_catalogo IN SELECT id, nombre FROM actividades_catalogo LOOP
            
            -- 3. Verificar si la vivienda ya tiene esta actividad
            IF NOT EXISTS (
                SELECT 1 FROM actividades_vivienda 
                WHERE vivienda_id = v_vivienda_record.id 
                AND catalogo_id = v_actividad_catalogo.id
            ) THEN
                -- 4. Insertar la actividad faltante con progreso 0 y estado BLOQUEADA
                INSERT INTO actividades_vivienda (
                    vivienda_id,
                    catalogo_id,
                    estado,
                    porcentaje_avance,
                    created_at
                ) VALUES (
                    v_vivienda_record.id,
                    v_actividad_catalogo.id,
                    'BLOQUEADA',
                    0,
                    NOW()
                );
                
                RAISE NOTICE '  + Agregada actividad: %', v_actividad_catalogo.nombre;
            END IF;

        END LOOP;
    END LOOP;

    RAISE NOTICE 'Migración completada exitosamente.';
END $$;

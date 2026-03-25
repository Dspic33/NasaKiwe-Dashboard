-- =========================================================
-- Función: crear_proyecto_completo
-- Crea un proyecto y sus viviendas en una sola transacción.
-- Devuelve el UUID del proyecto creado.
-- =========================================================

CREATE OR REPLACE FUNCTION crear_proyecto_completo(
    p_nombre TEXT,
    p_municipio TEXT,
    p_resguardo TEXT,
    p_numero_proceso TEXT,
    p_valor_estimado FLOAT DEFAULT 0,
    p_descripcion_objeto TEXT DEFAULT '',
    p_casas JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_proyecto_id UUID;
    v_casa JSONB;
    v_idx INTEGER := 1;
BEGIN
    -- 1. Insertar el proyecto
    INSERT INTO proyectos (
        nombre,
        municipio,
        resguardo,
        numero_proceso,
        valor_estimado,
        descripcion_objeto,
        estado,
        created_at
    ) VALUES (
        p_nombre,
        p_municipio,
        p_resguardo,
        p_numero_proceso,
        p_valor_estimado,
        p_descripcion_objeto,
        'ACTIVO',
        NOW()
    )
    RETURNING id INTO v_proyecto_id;

    -- 2. Insertar cada vivienda del JSON
    FOR v_casa IN SELECT * FROM jsonb_array_elements(p_casas)
    LOOP
        INSERT INTO viviendas (
            proyecto_id,
            numero_lote,
            beneficiario,
            interventor,
            departamento,
            municipio,
            resguardo,
            estado,
            created_at
        ) VALUES (
            v_proyecto_id,
            COALESCE(v_casa->>'numero', LPAD(v_idx::TEXT, 2, '0')),
            COALESCE(v_casa->>'beneficiario', ''),
            COALESCE(v_casa->>'interventor', ''),
            COALESCE(v_casa->>'departamento', ''),
            COALESCE(v_casa->>'municipio', p_municipio),
            COALESCE(v_casa->>'resguardo', p_resguardo),
            'PENDIENTE',
            NOW()
        );
        v_idx := v_idx + 1;
    END LOOP;

    RETURN v_proyecto_id;
END;
$$;

-- Dar permisos a los roles necesarios
GRANT EXECUTE ON FUNCTION crear_proyecto_completo TO authenticated;
GRANT EXECUTE ON FUNCTION crear_proyecto_completo TO service_role;

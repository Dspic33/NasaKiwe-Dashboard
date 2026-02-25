export const ESTADOS_CONTRATACION = {
    BORRADOR: 'BORRADOR',
    EN_REVISION_JURIDICA: 'EN_REVISION_JURIDICA',
    EN_REVISION_DIRECTORA: 'EN_REVISION_DIRECTORA',
    APROBADO: 'APROBADO',
    DEVUELTO_CORRECCIONES: 'DEVUELTO_CORRECCIONES',
    DEVUELTO_REVISION_DIRECTORA: 'DEVUELTO_REVISION_DIRECTORA',
    DOCUMENTOS_GENERADOS: 'DOCUMENTOS_GENERADOS'
}

export const ESTADOS_LABELS = {
    [ESTADOS_CONTRATACION.BORRADOR]: 'Borrador',
    [ESTADOS_CONTRATACION.EN_REVISION_JURIDICA]: 'Revisión Jurídica',
    [ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA]: 'Revisión Directora',
    [ESTADOS_CONTRATACION.APROBADO]: 'Aprobado',
    [ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES]: 'Devuelto (Correcciones)',
    [ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA]: 'Devuelto por Directora',
    [ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS]: 'Completado (Docs Generados)'
}

export const ROLES_USUARIO = {
    ASESOR_VIVIENDA: 'asesor_vivienda',
    JURIDICO: 'juridico',
    DIRECTORA: 'directora',
    ADMIN: 'admin'
}

// Mock initial data
export const MOCK_CONTRATOS = [
    {
        id: '123e4567-e89b-12d3-a456-426614174000',
        numero_proceso: 'CD-VIV-2026-001',
        fecha: '2026-02-21',
        descripcion_objeto: 'Prestación de servicios para la interventoría técnica, administrativa y financiera del proyecto de vivienda VIS rural.',
        lugar_ejecucion: 'Municipio de Páez, Resguardo Indígena de Vitoncó',
        valor_estimado: 45000000,
        estado: ESTADOS_CONTRATACION.EN_REVISION_JURIDICA,
        creado_por: 'u1', // Matches MOCK_CURRENT_USER.id
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: null,
        ultima_actualizacion: '2026-02-21T10:30:00Z',
        dias_en_etapa: 2,
        materiales: [],
        observaciones_juridico: '',
        observaciones_directora: '',
        historial_cambios: [
            { fecha: '2026-02-19T09:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación de borrador' },
            { fecha: '2026-02-21T10:30:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Enviado a revisión jurídica' }
        ]
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174001',
        numero_proceso: 'CD-VIV-2026-002',
        fecha: '2026-02-22',
        descripcion_objeto: 'Construcción de 15 soluciones de vivienda rural dispersa en el municipio de Inzá.',
        lugar_ejecucion: 'Municipio de Inzá',
        valor_estimado: 125000000,
        estado: ESTADOS_CONTRATACION.BORRADOR,
        creado_por: 'u1',
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: null,
        ultima_actualizacion: '2026-02-22T08:15:00Z',
        dias_en_etapa: 3,
        materiales: [],
        observaciones_juridico: '',
        observaciones_directora: '',
        historial_cambios: [
            { fecha: '2026-02-22T08:15:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación de borrador' }
        ]
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174002',
        numero_proceso: 'CD-INF-2026-003',
        fecha: '2026-02-20',
        descripcion_objeto: 'Adecuación y mejoramiento del centro de salud comunitario.',
        lugar_ejecucion: 'Municipio de Toribío',
        valor_estimado: 85000000,
        estado: ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES,
        creado_por: 'u1',
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: 'u2',
        nombre_revisor: 'Abg. María López',
        ultima_actualizacion: '2026-02-23T11:40:00Z',
        dias_en_etapa: 1,
        materiales: [],
        observaciones_juridico: 'Falta adjuntar el certificado de disponibilidad presupuestal (CDP) y detallar más las especificaciones técnicas en el anexo 1.',
        observaciones_directora: '',
        historial_cambios: [
            { fecha: '2026-02-20T10:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación de borrador' },
            { fecha: '2026-02-22T14:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Enviado a revisión jurídica' },
            { fecha: '2026-02-23T11:40:00Z', usuario: ROLES_USUARIO.JURIDICO, nombre: 'Abg. María López', accion: 'Devuelto con 2 observaciones' }
        ]
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174003',
        numero_proceso: 'CD-VIV-2026-004',
        fecha: '2026-02-18',
        descripcion_objeto: 'Suministro de materiales de construcción (cemento, ladrillo, varilla) para obras preventivas.',
        lugar_ejecucion: 'Almacén Central Popayán',
        valor_estimado: 32000000,
        estado: ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA,
        creado_por: 'u1',
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: 'u2',
        nombre_revisor: 'Abg. María López',
        ultima_actualizacion: '2026-02-24T09:20:00Z',
        dias_en_etapa: 1,
        materiales: [],
        observaciones_juridico: '',
        observaciones_directora: '',
        historial_cambios: [
            { fecha: '2026-02-18T08:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación de borrador' },
            { fecha: '2026-02-19T10:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Enviado a revisión jurídica' },
            { fecha: '2026-02-24T09:20:00Z', usuario: ROLES_USUARIO.JURIDICO, nombre: 'Abg. María López', accion: 'Aprobado jurídicamente y enviado a Directora' }
        ]
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174004',
        numero_proceso: 'CD-VIV-2026-005',
        fecha: '2026-02-15',
        descripcion_objeto: 'Estudios topográficos y de suelos para reubicación de familias.',
        lugar_ejecucion: 'Municipio de Silvia',
        valor_estimado: 18000000,
        estado: ESTADOS_CONTRATACION.APROBADO,
        creado_por: 'u1',
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: 'u2',
        nombre_revisor: 'Abg. María López',
        ultima_actualizacion: '2026-02-25T15:00:00Z',
        dias_en_etapa: 0,
        materiales: [],
        observaciones_juridico: '',
        observaciones_directora: '',
        historial_cambios: [
            { fecha: '2026-02-15T09:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación de borrador' },
            { fecha: '2026-02-16T11:00:00Z', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Enviado a revisión jurídica' },
            { fecha: '2026-02-18T10:00:00Z', usuario: ROLES_USUARIO.JURIDICO, nombre: 'Abg. María López', accion: 'Aprobado jurídicamente y enviado a Directora' },
            { fecha: '2026-02-25T15:00:00Z', usuario: ROLES_USUARIO.DIRECTORA, nombre: 'Dra. Ana Silva', accion: 'Aprobado por Dirección' }
        ]
    }
]

// Mock Auth logic
export const MOCK_CURRENT_USER = {
    id: 'u1',
    nombre: 'Arq Juan Camilo Manzano T.',
    rol: ROLES_USUARIO.ASESOR_VIVIENDA
}

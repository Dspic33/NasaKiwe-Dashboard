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
    ADMIN: 'admin',
    INSPECTOR: 'inspector',
    RESIDENTE: 'residente',
    CONTRATISTA: 'contratista'
}

// Mock initial data - Conservando solo el aprobado solicitado
export const MOCK_CONTRATOS = [
    {
        id: '98b50e2d-dc99-43ef-b387-052637738f61',
        numero_proceso: 'CD-VIV-2026-N391',
        fecha: '2026-03-02',
        descripcion_objeto: 'RECONSTRUCCIÓN DE VIVIENDAS EN SITIO PROPIO: Proyecto Habitacional Popayán Fase II.',
        lugar_ejecucion: 'Popayán, Cauca',
        valor_estimado: 125400000,
        estado: ESTADOS_CONTRATACION.APROBADO,
        creado_por: 'u1',
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: 'u2',
        ultima_actualizacion: new Date().toISOString(),
        dias_en_etapa: 0,
        materiales: [],
        observaciones_juridico: 'Revisado y aprobado para firma.',
        observaciones_directora: 'Procesar con prioridad.',
        historial_cambios: [
            { fecha: '2026-03-01', usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación' },
            { fecha: '2026-03-02', usuario: ROLES_USUARIO.JURIDICO, nombre: 'Carlos Aztaiza C.', accion: 'Aprobación Jurídica' }
        ]
    }
]

// Mock Auth logic
export const MOCK_CURRENT_USER = {
    id: 'u1',
    nombre: 'Arq Juan Camilo Manzano T.',
    rol: ROLES_USUARIO.ASESOR_VIVIENDA
}

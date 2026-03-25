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

// Mock initial data
export const MOCK_CONTRATOS = [
    {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        numero_proceso: 'CD-VIV-2026-PRUEBA',
        fecha: new Date().toISOString().split('T')[0],
        descripcion_objeto: 'PROCESO DE PRUEBA: Construcción y mejoramiento de soluciones de vivienda rural.',
        lugar_ejecucion: 'Popayán, Cauca',
        valor_estimado: 50000000,
        estado: ESTADOS_CONTRATACION.BORRADOR,
        creado_por: 'u1',
        nombre_creador: 'Arq Juan Camilo Manzano T.',
        revisado_por: null,
        ultima_actualizacion: new Date().toISOString(),
        dias_en_etapa: 0,
        materiales: [],
        observaciones_juridico: '',
        observaciones_directora: '',
        historial_cambios: [
            { fecha: new Date().toISOString(), usuario: ROLES_USUARIO.ASESOR_VIVIENDA, nombre: 'Arq Juan Camilo Manzano T.', accion: 'Creación de borrador de prueba' }
        ]
    }
]

// Mock Auth logic
export const MOCK_CURRENT_USER = {
    id: 'u1',
    nombre: 'Arq Juan Camilo Manzano T.',
    rol: ROLES_USUARIO.ASESOR_VIVIENDA
}

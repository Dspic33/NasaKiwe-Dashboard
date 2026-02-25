export const AREAS_INFRAESTRUCTURA = [
    {
        id: 'vivienda',
        titulo: 'Área de Vivienda y Electrificación',
        descripcion: 'Gestión de proyectos habitacionales y redes de energía.',
        icono: 'Home',
        banner: '/assets/imagenes/imagen4.png',
        equipo: [
            { id: 'asesor', nombre: 'Asesor de Vivienda', cargo: 'Asesor Técnico', foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200' },
            { id: 'ingeniero_electrico', nombre: 'Ing. Eléctrico', cargo: 'Ingeniero Eléctrico', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
            { id: 'ingeniero', nombre: 'Ing. Mateo Gómez', cargo: 'Ingeniero Civil', foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
            { id: 'perfil', nombre: 'Arq Juan Camilo Manzano T.', cargo: 'Arquitecto de Vivienda', foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' },
            { id: 'secretaria', nombre: 'Secretario(a)', cargo: 'Apoyo Administrativo', foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
            { id: 'apoyo_financiero', nombre: 'Apoyo Financiero', cargo: 'Gestión Presupuestal', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' }
        ]
    },
    {
        id: 'educacion',
        titulo: 'Área de Educación',
        descripcion: 'Infraestructura educativa y dotación escolar.',
        icono: 'GraduationCap',
        equipo: [
            { id: 'asesor', nombre: 'Asesor Educación', cargo: 'Asesor Técnico', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
            { id: 'secretaria', nombre: 'Secretaría Educación', cargo: 'Apoyo Administrativo', foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' }
        ]
    },
    {
        id: 'vias',
        titulo: 'Área de Vías',
        descripcion: 'Mantenimiento y construcción de malla vial regional.',
        icono: 'Road',
        equipo: [
            { id: 'ingeniero', nombre: 'Coordinador de Vías', cargo: 'Ingeniero de Vías', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
            { id: 'secretaria', nombre: 'Secretaría de Vías', cargo: 'Apoyo Administrativo', foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' }
        ]
    },
    {
        id: 'salud',
        titulo: 'Área de Salud',
        descripcion: 'Centros de salud y saneamiento básico.',
        icono: 'Activity',
        equipo: [
            { id: 'asesor', nombre: 'Especialista Salud', cargo: 'Comité Técnico Salud', foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' }
        ]
    },
    {
        id: 'dibujo',
        titulo: 'Apoyo Dibujo Técnico',
        descripcion: 'Soporte de diseño y planimetría para todas las áreas.',
        icono: 'PenTool',
        equipo: [
            { id: 'dibujante', nombre: 'Delineante Técnico', cargo: 'Técnico en Dibujo', foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' }
        ]
    }
];

export const EQUIPO_APOYO = [
    {
        id: 'secretaria',
        nombre: 'Claudia Jiménez',
        cargo: 'Secretaria Ejecutiva',
        area: 'Apoyo Administrativo - Infraestructura',
        email: 'secretaria.infra@nasakiwe.gov.co',
        funciones: [
            'Gestionar la correspondencia externa e interna del área.',
            'Organizar y mantener el archivo documental MECI.',
            'Atender y direccionar solicitudes de la comunidad.',
            'Apoyar la logística de reuniones y comités técnicos.'
        ]
    },
    {
        id: 'apoyo_financiero',
        nombre: 'Ricardo Morales',
        cargo: 'Apoyo Financiero',
        area: 'Gestión Financiera - Infraestructura',
        email: 'finanzas.infra@nasakiwe.gov.co',
        funciones: [
            'Seguimiento presupuestal de contratos de obra.',
            'Tramitar cuentas de cobro y registros presupuestales.',
            'Elaborar informes financieros para los OCAD.',
            'Verificar el cumplimiento de pólizas y garantías.'
        ]
    }
];

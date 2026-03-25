import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../../../services/supabaseClient'
import {
    Home,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Camera,
    MessageSquare,
    FileText,
    ChevronRight,
    Search,
    MapPin,
    Users,
    Calendar,
    Settings,
    DollarSign,
    Hammer,
    CheckCircle,
    Check,
    AlertCircle
} from 'lucide-react'

import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ReferenceLine, AreaChart, Area
} from 'recharts'

// Mock Data for Construction Modules
import { MOCK_CONTRATOS, ESTADOS_CONTRATACION, ESTADOS_LABELS, ROLES_USUARIO } from '../../../data/contratosMock'

const ACTIVIDADES_CATALOGO = [
    // 1. PRELIMINARES
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6a', capitulo: '1. Preliminares', nombre: '1.01 Localización y replanteo', descripcion: 'Trazo, nivelación y replanteo de la vivienda según planos.', orden: 1, duracion_dias: 3 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6b', capitulo: '1. Preliminares', nombre: '1.02 Excavación manual', descripcion: 'Excavación manual para cimientos en terreno firme.', orden: 2, duracion_dias: 5 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6c', capitulo: '1. Preliminares', nombre: '1.03 Relleno con material de sitio', descripcion: 'Compactación manual del material de sitio controlado.', orden: 3, duracion_dias: 4 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6d', capitulo: '1. Preliminares', nombre: '1.04 Sobre acarreo de materiales', descripcion: 'Traslado de materiales hasta el sitio exacto de la obra.', orden: 4, duracion_dias: 6 },

    // 2. CIMENTACION
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6e', capitulo: '2. Cimentación', nombre: '2.01 Solado de limpieza', descripcion: 'Solado de limpieza e=0.05m en concreto de 14MPa.', orden: 5, duracion_dias: 2 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a6f', capitulo: '2. Cimentación', nombre: '2.02 Viga de cimentación 0.20*0.25m', descripcion: 'Concreto de 21MPa, incluye formaleta y mezclado mecánico.', orden: 6, duracion_dias: 8 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a60', capitulo: '2. Cimentación', nombre: '2.03 Viga de cimentación 0.20*0.20m', descripcion: 'Concreto de 21MPa, incluye formaleta y mezclado mecánico.', orden: 7, duracion_dias: 7 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a61', capitulo: '2. Cimentación', nombre: '2.04 Concreto Ciclópeo', descripcion: '60% concreto 17.5MPa y 40% piedra, según diseño.', orden: 8, duracion_dias: 10 },

    // 3. ESTRUCTURA EN CONCRETO
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a62', capitulo: '3. Estructura', nombre: '3.01 Viga de amarre', descripcion: 'Concreto 21MPa de 0.12*0.20m, incluye formaleta.', orden: 9, duracion_dias: 5 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a63', capitulo: '3. Estructura', nombre: '3.02 Viga cumbrera', descripcion: 'Concreto 21MPa de 0.12*0.23m, incluye formaleta.', orden: 10, duracion_dias: 6 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a64', capitulo: '3. Estructura', nombre: '3.03 Columna 0.20*0.20m', descripcion: 'Concreto 21MPa, incluye formaleta y mezclado.', orden: 11, duracion_dias: 8 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a65', capitulo: '3. Estructura', nombre: '3.04 Columna 0.12*0.20m', descripcion: 'Concreto 21MPa, incluye formaleta y mezclado.', orden: 12, duracion_dias: 8 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a66', capitulo: '3. Estructura', nombre: '3.05 Cinta de amarre', descripcion: 'Concreto 21MPa 0.12*0.10m, incluye formaleta.', orden: 13, duracion_dias: 4 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a67', capitulo: '3. Estructura', nombre: '3.06 Acero de refuerzo Grado 60', descripcion: 'Figurado e instalado, incluye alambre de amarre.', orden: 14, duracion_dias: 12 },

    // 4. CUBIERTA
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a68', capitulo: '4. Cubierta', nombre: '4.01 Correas tipo Perlín', descripcion: 'C120*60*20*1.5mm, incluye soldadura y anticorrosivo.', orden: 15, duracion_dias: 7 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6a69', capitulo: '4. Cubierta', nombre: '4.02 Teja de fibrocemento P7', descripcion: 'Pintada internamente con vinilo Tipo 3, incluye ganchos.', orden: 16, duracion_dias: 6 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6a', capitulo: '4. Cubierta', nombre: '4.03 Caballete fijo', descripcion: 'Suministro e instalación en fibrocemento.', orden: 17, duracion_dias: 3 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6b', capitulo: '4. Cubierta', nombre: '4.04 Cumbreras y limatesas', descripcion: 'Suministro e instalación en fibrocemento.', orden: 18, duracion_dias: 4 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6c', capitulo: '4. Cubierta', nombre: '4.05 Solapa en lámina metálica', descripcion: 'Cal. 35, incluye elementos de fijación.', orden: 19, duracion_dias: 3 },

    // 5. PISOS
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6d', capitulo: '5. Pisos', nombre: '5.01 Piso primario e=0.07m', descripcion: 'Concreto de 21Mpa. Incluye mezclado mecánico.', orden: 20, duracion_dias: 5 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6e', capitulo: '5. Pisos', nombre: '5.02 Piso cerámico comercial', descripcion: 'Incluye mortero 1:3, material de pega y fragua.', orden: 21, duracion_dias: 8 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b6f', capitulo: '5. Pisos', nombre: '5.03 Guardaescoba cerámico', descripcion: 'Suministro e instalación, incluye pega y fragua.', orden: 22, duracion_dias: 4 },
    { id: '55615705-5c1a-4286-990a-6e5a6a6a6b70', capitulo: '5. Pisos', nombre: '5.04 Andén en concreto 21MPa', descripcion: 'e=0.08m, con dilataciones y escobillado.', orden: 23, duracion_dias: 3 },
]


const BitacoraView = ({ currentUser, initialProjectId = null }) => {
    const [view, setView] = useState('overview'); // 'overview' o 'project'
    const [proyectosDB, setProyectosDB] = useState([])
    const [selectedProyecto, setSelectedProyecto] = useState(null)
    const [viviendasDB, setViviendasDB] = useState([])
    const [selectedVivienda, setSelectedVivienda] = useState(null)
    const [viewingPhoto, setViewingPhoto] = useState(null)
    
    // Estados para el Modal de Editar Viviendas
    const [showEditHousesModal, setShowEditHousesModal] = useState(false)
    const [editedViviendas, setEditedViviendas] = useState([])
    const [editingHousesProject, setEditingHousesProject] = useState(null)
    const [isSavingHouses, setIsSavingHouses] = useState(false)
    
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newProject, setNewProject] = useState({
        nombre: '',
        municipio: '',
        resguardo: '',
        numero_proceso: '',
        valor_estimado: 0,
        descripcion_objeto: '',
        contratista: '',
        supervisor: '',
        plazo: '',
        fecha_inicio: '',
        fecha_fin: '',
        interventor_principal: '',
        numCasas: 1,
        fecha_estudio: '',
        lugar_ejecucion: '',
        viviendas: [{ numero: '01', beneficiario: '', interventor: '' }]
    })
    const [creatingProject, setCreatingProject] = useState(false)

    const [collapsedChapters, setCollapsedChapters] = useState({
        '1. Preliminares': true,
        '2. Cimentación': true,
        '3. Estructura': true,
        '4. Cubierta': true,
        '5. Pisos': true
    })
    const [expandedPhotos, setExpandedPhotos] = useState({})
    const [registrosSincronizados, setRegistrosSincronizados] = useState([])
    const [cargandoRegistros, setCargandoRegistros] = useState(false)
    const [realtimeConectado, setRealtimeConectado] = useState(false)
    const [searchProyecto, setSearchProyecto] = useState('')
    const [activeTab, setActiveTab] = useState('Tiempo')

    // Data global para la vista general (Overview)
    const [allViviendas, setAllViviendas] = useState([])
    const [allEvidencias, setAllEvidencias] = useState([])

    // Estados para edición de detalle del proyecto
    const [isEditingSummary, setIsEditingSummary] = useState(false)
    const [editSummaryData, setEditSummaryData] = useState(null)
    const [isUpdatingSummary, setIsUpdatingSummary] = useState(false)

    // Función para guardar cambios en resumen del proyecto
    const handleUpdateSummary = async () => {
        setIsUpdatingSummary(true);
        console.log('Iniciando actualización de resumen para proyecto:', selectedProyecto.id);
        
        try {
            // Solo actualizamos campos esenciales inicialmente para asegurar éxito
            const updatePayload = {
                contratista: editSummaryData.contratista,
                supervisor: editSummaryData.supervisor,
                interventor_principal: editSummaryData.interventor_principal,
                fecha_inicio: editSummaryData.fecha_inicio || null,
                fecha_fin: editSummaryData.fecha_fin || null,
                plazo: editSummaryData.plazo
            };

            // Intentamos actualizar
            const { error } = await supabase
                .from('proyectos')
                .update(updatePayload)
                .eq('id', selectedProyecto.id);

            if (error) {
                console.error('Error de Supabase al actualizar:', error);
                throw error;
            }

            // Intentar actualizar campos adicionales (opcionales) en un segundo paso
            // Esto evita que si una columna no existe, falle todo el proceso principal
            try {
                await supabase
                    .from('proyectos')
                    .update({
                        lugar_ejecucion: editSummaryData.lugar_ejecucion,
                        fecha_estudio: editSummaryData.fecha_estudio || null
                    })
                    .eq('id', selectedProyecto.id);
            } catch (secondaryError) {
                console.warn('Error al actualizar campos secundarios (lugar/fecha estudio):', secondaryError);
            }

            // Actualizar estado local
            const updatedProject = { ...selectedProyecto, ...editSummaryData };
            setSelectedProyecto(updatedProject);
            setProyectosDB(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
            setIsEditingSummary(false);
            alert('Detalles del proyecto actualizados correctamente');

        } catch (error) {
            console.error('Error fatal al actualizar resumen:', error);
            // Mostrar mensaje detallado si es posible
            const msg = error.message || 'Error desconocido';
            alert(`Error al guardar los cambios: ${msg}\n\nPor favor, asegúrate de haber ejecutado el script SQL proporcionado.`);
        } finally {
            setIsUpdatingSummary(false);
        }
    };

    // Función para calcular el progreso de una vivienda
    const calculateHouseProgress = (vivienda) => {
        if (!registrosSincronizados || !registrosSincronizados.length) return 0;
        
        const TOTAL_ACTIVIDADES = ACTIVIDADES_CATALOGO.length; // 23
        const reportesVivienda = registrosSincronizados.filter(r => 
            parseInt(r.vivienda_num) === parseInt(vivienda.numero_lote)
        );

        if (!reportesVivienda || !reportesVivienda.length) return 0;

        const totalPorActividad = {};
        reportesVivienda.forEach(r => {
            const current = totalPorActividad[r.actividad_id] || 0;
            const nuevoTotal = current + (r.progreso || 0);
            totalPorActividad[r.actividad_id] = nuevoTotal > 100 ? 100 : nuevoTotal;
        });

        const sumaProgresos = Object.values(totalPorActividad).reduce((acc, val) => acc + val, 0);
        return Math.round(sumaProgresos / TOTAL_ACTIVIDADES);
    };

    // Funciones globales para la vista general (Overview)
    const calculateGlobalHouseProgress = (vivienda, evidenciasProyecto) => {
        if (!evidenciasProyecto || !evidenciasProyecto.length) return 0;
        
        const TOTAL_ACTIVIDADES = ACTIVIDADES_CATALOGO.length;
        const reportesVivienda = evidenciasProyecto.filter(r => 
            parseInt(r.vivienda_num) === parseInt(vivienda.numero_lote)
        );

        if (!reportesVivienda.length) return 0;

        const totalPorActividad = {};
        reportesVivienda.forEach(r => {
            const current = totalPorActividad[r.actividad_id] || 0;
            const nuevoTotal = current + (r.progreso || 0);
            totalPorActividad[r.actividad_id] = nuevoTotal > 100 ? 100 : nuevoTotal;
        });

        return Math.round((Object.values(totalPorActividad).reduce((acc, val) => acc + val, 0)) / TOTAL_ACTIVIDADES);
    };

    const calculateGlobalProjectProgress = (projId) => {
        if (!projId || !allViviendas || !allViviendas.length) return 0;
        
        const casasProyecto = allViviendas.filter(v => v.proyecto_id === projId);
        if (!casasProyecto.length) return 0;

        const eviProyecto = allEvidencias.filter(e => e.proyecto_id === projId);
        
        let sumProgress = 0;
        casasProyecto.forEach(v => {
            sumProgress += calculateGlobalHouseProgress(v, eviProyecto);
        });
        
        return Math.round(sumProgress / casasProyecto.length);
    };

    // Nueva función para generar PDF de un proyecto completo
    const generateProjectPDF = async () => {
        if (!selectedProyecto) return;
        const p = selectedProyecto;
        const progress = calculateProjectProgress(p.id);
        const doc = new jsPDF();
        
        // Estilo Institucional
        const primaryColor = [45, 95, 62]; // #2D5F3E
        const secondaryColor = [216, 91, 29]; // #d85b1d
        
        // Header PDF
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('CORPORACIÓN NASA KIWE', 105, 18, { align: 'center' });
        doc.setFontSize(12);
        doc.text('BITÁCORA TÉCNICA Y SEGUIMIENTO DE OBRA', 105, 28, { align: 'center' });
        
        // Cuerpo del PDF
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.text('Información del Proyecto', 20, 55);
        doc.setLineWidth(0.5);
        doc.setDrawColor(...primaryColor);
        doc.line(20, 58, 60, 58);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATO:', 20, 70);
        doc.setFont('helvetica', 'normal');
        doc.text(p.numero_proceso || 'N/A', 60, 70);
        
        doc.setFont('helvetica', 'bold');
        doc.text('OBJETO:', 20, 80);
        doc.setFont('helvetica', 'normal');
        const splitObjeto = doc.splitTextToSize(p.descripcion_objeto || p.nombre || '', 130);
        doc.text(splitObjeto, 60, 80);
        
        const yPos = 80 + (splitObjeto.length * 5);
        
        doc.setFont('helvetica', 'bold');
        doc.text('MUNICIPIO:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(p.municipio || 'N/A', 60, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('RESGUARDO:', 20, yPos + 10);
        doc.setFont('helvetica', 'normal');
        doc.text(p.resguardo || 'N/A', 60, yPos + 10);
        
        doc.setFont('helvetica', 'bold');
        doc.text('AVANCE FÍSICO:', 20, yPos + 20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...secondaryColor);
        doc.text(`${progress}% COMPLETADO`, 60, yPos + 20);
        
        // Tabla de Viviendas (Ejemplo básico)
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.text('Resumen por Vivienda', 20, yPos + 40);
        
        const tableBody = viviendasDB.map(v => [
            `Casa ${v.numero_lote || 'N/A'}`,
            v.beneficiario || 'Sin asignar',
            v.municipio || p.municipio,
            `${calculateHouseProgress(v)}%`
        ]);
        
        doc.autoTable({
            startY: yPos + 45,
            head: [['Unidad', 'Beneficiario', 'Ubicación', 'Avance %']],
            body: tableBody,
            headStyles: { fillColor: primaryColor },
            theme: 'striped'
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Corporación Nasa Kiwe - Calle 1AN No. 2 – 39. Popayán, Cauca', 105, 285, { align: 'center' });
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        doc.save(`Reporte_NasaKiwe_${p.numero_proceso}.pdf`);
    };

    const calculateProjectProgress = (projId) => {
        if (!registrosSincronizados || !registrosSincronizados.length) return 0;
        
        const reportesProyecto = registrosSincronizados.filter(r => r.proyecto_id === projId);
        if (reportesProyecto.length === 0) return 0;

        // Necesitamos saber cuántas viviendas tiene el proyecto (placeholder o promedio móvil)
        const actividadesPorVivienda = {};
        reportesProyecto.forEach(r => {
            const vKey = r.vivienda_num;
            if (!actividadesPorVivienda[vKey]) actividadesPorVivienda[vKey] = {};
            
            const current = actividadesPorVivienda[vKey][r.actividad_id] || 0;
            const nuevoTotal = current + (r.progreso || 0);
            actividadesPorVivienda[vKey][r.actividad_id] = nuevoTotal > 100 ? 100 : nuevoTotal;
        });

        const numViviendas = Object.keys(actividadesPorVivienda).length;
        if (numViviendas === 0) return 0;

        const sumaTotalViviendas = Object.values(actividadesPorVivienda).reduce((acc, acts) => {
            const sumActs = Object.values(acts).reduce((s, v) => s + v, 0);
            return acc + (sumActs / ACTIVIDADES_CATALOGO.length);
        }, 0);

        return Math.round(sumaTotalViviendas / numViviendas);
    };

    const getDashboardMetrics = () => {
        const totalProyectos = proyectosDB.length;
        
        // Calcular progreso físico promedio de todos los proyectos
        const projectProgresses = proyectosDB.map(p => calculateProjectProgress(p.id));
        const avgPhysicalProgress = totalProyectos > 0 
            ? projectProgresses.reduce((acc, val) => acc + val, 0) / totalProyectos 
            : 0;

        // Metas e índices (Simulados basados en progreso real para que no sea siempre 1.0)
        // SPI = Progreso Real / Progreso Esperado (Simplificado: 0.95 de base + variación según progreso)
        const avgSPI = totalProyectos > 0 ? (0.92 + (avgPhysicalProgress / 1000)) : 1.0;
        const avgCPI = totalProyectos > 0 ? (0.94 + (avgPhysicalProgress / 2000)) : 1.0;

        const enAlerta = proyectosDB.filter((p, idx) => {
            const pProgress = projectProgresses[idx];
            return pProgress < 5; // Ejemplo: Proyectos con menos del 5% de avance
        }).length;
        
        const totalEstimado = proyectosDB.reduce((acc, p) => acc + (parseFloat(p.valor_estimado) || 0), 0);
        
        // Ejecución financiera vinculada al avance físico real
        const totalEjecutado = totalEstimado * (avgPhysicalProgress / 100);
        const ejecucionFinanciera = totalEjecutado > 0 && totalEstimado > 0 ? (totalEjecutado / totalEstimado) * 100 : 0;
        
        return {
            totalProyectos,
            enAlerta,
            totalEstimado,
            totalEjecutado,
            ejecucionFinanciera,
            avgSPI: avgSPI > 1 ? 1 : avgSPI,
            avgCPI: avgCPI > 1 ? 1 : avgCPI
        };
    };

    const metrics = getDashboardMetrics();

    const SummaryCard = ({ title, value, subtitle, icon: Icon, trend, color, accentColor }) => (
        <div className="summary-card" style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '12px', 
            borderLeft: `5px solid ${accentColor}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
                <div style={{ padding: '8px', background: `${accentColor}15`, borderRadius: '8px', color: accentColor }}>
                    <Icon size={18} />
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B' }}>{value}</span>
                {trend && <span style={{ fontSize: '12px', fontWeight: '600', color: trend.startsWith('▲') ? '#10B981' : '#F59E0B' }}>{trend}</span>}
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>{subtitle}</span>
        </div>
    );


    // Reiniciar el scroll al inicio solo cuando se seleccione un nuevo proyecto
    useEffect(() => {
        window.scrollTo(0, 0);
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.scrollTop = 0;
    }, [selectedProyecto]);

    // Función para crear proyecto completo
    const handleSaveProject = async () => {
        if (!newProject.nombre || !newProject.municipio) {
            alert('Por favor complete el nombre y municipio');
            return;
        }
        
        setCreatingProject(true);
        try {
            const formatCasas = newProject.viviendas.map(v => ({
                numero: v.numero || '00',
                beneficiario: v.beneficiario || 'Sin Nombre',
                interventor: v.interventor || 'No asignado'
            }));

            const { data, error } = await supabase.rpc('crear_proyecto_completo', {
                p_nombre: newProject.nombre,
                p_municipio: newProject.municipio,
                p_resguardo: newProject.resguardo,
                p_numero_proceso: newProject.numero_proceso,
                p_valor_estimado: parseFloat(newProject.valor_estimado) || 0,
                p_descripcion_objeto: newProject.descripcion_objeto,
                p_contratista: newProject.contratista,
                p_supervisor: newProject.supervisor,
                p_plazo: newProject.plazo,
                p_fecha_inicio: newProject.fecha_inicio || null,
                p_fecha_fin: newProject.fecha_fin || null,
                p_interventor_principal: newProject.interventor_principal,
                p_fecha_estudio: newProject.fecha_estudio || null,
                p_lugar_ejecucion: newProject.lugar_ejecucion,
                p_casas: formatCasas
            });

            if (error) throw error;

            alert('Proyecto creado exitosamente');
            setShowCreateModal(false);
            
            // Recargar proyectos
            const { data: projs } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
            if (projs) setProyectosDB(projs);

        } catch (err) {
            console.error('Error al crear proyecto:', err);
            alert('Error al crear proyecto: ' + err.message);
        } finally {
            setCreatingProject(false);
        }
    };

    // Función para guardar cambios en viviendas
    const handleSaveHouses = async () => {
        setIsSavingHouses(true);
        try {
            const updates = editedViviendas.map(v => 
                supabase.from('viviendas').update({
                    numero_lote: v.numero_lote,
                    beneficiario: v.beneficiario,
                    interventor: v.interventor,
                    departamento: v.departamento,
                    municipio: v.municipio,
                    resguardo: v.resguardo
                }).eq('id', v.id)
            );
            await Promise.all(updates);
            
            setShowEditHousesModal(false);
            
            // Recargar viviendas del proyecto actual
            if (selectedProyecto && selectedProyecto.id === editingHousesProject.id) {
                const { data } = await supabase
                    .from('viviendas')
                    .select('*')
                    .eq('proyecto_id', selectedProyecto.id)
                    .order('numero_lote', { ascending: true });
                if (data) setViviendasDB(data);
            }
        } catch (error) {
            console.error('Error al actualizar viviendas:', error);
            alert('Error al guardar los cambios de viviendas.');
        } finally {
            setIsSavingHouses(false);
        }
    };

    // Cargar datos globales al iniciar (Proyectos, todas las viviendas y todas las evidencias para el Overview)
    useEffect(() => {
        const fetchDatosGlobales = async () => {
            try {
                const [projsRes, vivsRes, evidsRes] = await Promise.all([
                    supabase.from('proyectos').select('*').order('created_at', { ascending: false }),
                    supabase.from('viviendas').select('*'),
                    supabase.from('evidencias_obra').select('*')
                ]);
                
                if (projsRes.data) setProyectosDB(projsRes.data);
                if (vivsRes.data) setAllViviendas(vivsRes.data);
                if (evidsRes.data) setAllEvidencias(evidsRes.data);
            } catch (error) {
                console.error("Error cargando datos globales:", error);
            }
        };
        fetchDatosGlobales();
    }, []);

    // Cargar viviendas cuando cambia el proyecto
    useEffect(() => {
        if (!selectedProyecto) {
            setViviendasDB([]);
            return;
        }

        const fetchViviendas = async () => {
            const { data, error } = await supabase
                .from('viviendas')
                .select('*')
                .eq('proyecto_id', selectedProyecto.id)
                .order('numero_lote', { ascending: true });
            
            if (!error && data) setViviendasDB(data);
        };
        fetchViviendas();
    }, [selectedProyecto]);

    // Selección inicial si viene una prop de initialProjectId
    useEffect(() => {
        if (initialProjectId && proyectosDB.length > 0 && !selectedProyecto) {
            const found = proyectosDB.find(p => p.id === initialProjectId);
            if (found) {
                setSelectedProyecto(found);
                console.log('🎯 Deep-link: Proyecto seleccionado automáticamente:', found.nombre);
            }
        }
    }, [initialProjectId, proyectosDB]);

    // Efecto para cargar datos del proyecto seleccionado
    useEffect(() => {
        if (!selectedProyecto) return;

        const cargarEvidencias = async () => {
            setCargandoRegistros(true);
            try {
                const { data, error } = await supabase
                    .from('evidencias_obra')
                    .select('*')
                    .eq('proyecto_id', selectedProyecto.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setRegistrosSincronizados(data || []);
            } catch (e) {
                console.error('Error cargando evidencias:', e);
            } finally {
                setCargandoRegistros(false);
            }
        };

        cargarEvidencias();

        // Suscripción en tiempo real — se activa automáticamente cuando el móvil sube algo
        const canal = supabase
            .channel(`evidencias-realtime-${selectedProyecto.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'evidencias_obra',
                filter: `proyecto_id=eq.${selectedProyecto.id}`
            },
                (payload) => {
                    console.log('📲 Nueva evidencia recibida desde móvil:', payload.new);
                    // Actualizar el estado global para auto-recalcular porcentaje físico
                    setRegistrosSincronizados(prev => [payload.new, ...prev]);
                }
            )
            .subscribe((status) => {
                setRealtimeConectado(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(canal);
            setRealtimeConectado(false);
        };
    }, [selectedProyecto, supabase]);

    const toggleChapter = (cap) => {
        setCollapsedChapters(prev => ({ ...prev, [cap]: !prev[cap] }))
    }

    const togglePhoto = (actId) => {
        setExpandedPhotos(prev => ({ ...prev, [actId]: !prev[actId] }))
    }

    // Real Photo from Resident (Asset integrated)
    const MOCK_PHOTO_URL = '/assets/evidencia_cimentacion.png'


    const renderTiempoTab = (projectPhysProgress) => {
        const p = selectedProyecto;
        const metrics = getDashboardMetrics();
        
        // Calcular SPI específico del proyecto (o usar el promedio si no hay específico)
        const spiValue = (0.92 + (projectPhysProgress / 1000));
        
        // PPC dinámico: Basado en el progreso actual distribuido en las últimas semanas
        const currentPPC = Math.min(Math.round(70 + (projectPhysProgress / 5)), 100);
        const ppcData = [
            { week: 'S-09', value: 82 },
            { week: 'S-10', value: 79 },
            { week: 'S-11', value: 88 },
            { week: 'S-12', value: 88 },
            { week: 'S-13', value: currentPPC },
        ];

        return (
            <div className="tiempo-tab-content fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 380px', gap: '32px', alignItems: 'flex-start' }}>
                {/* Charts Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px' }}>
                        {/* SPI Gauge */}
                        <div style={{ textAlign: 'center', position: 'relative' }}>
                            <div style={{ height: '140px', width: '220px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: spiValue },
                                                { value: 1.2 - spiValue }
                                            ]}
                                            cx="50%"
                                            cy="100%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            <Cell fill="#E67E22" />
                                            <Cell fill="#F1F5F9" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: '-20px' }}>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#B45309' }}>{spiValue.toFixed(2)}</div>
                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>SPI (Meta: 0.95)</div>
                            </div>
                        </div>

                        {/* PPC Summary */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: '800', color: '#1E293B' }}>74%</div>
                            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>PPC Última Semana</div>
                        </div>
                    </div>

                    {/* PPC Bar Chart */}
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#1E293B', fontWeight: '700' }}>PPC Semanal</h4>
                        <div style={{ height: '240px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ppcData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} />
                                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                                    <Bar dataKey="value" fill="#2D5F3E" radius={[4, 4, 0, 0]} barSize={40} />
                                    {/* Meta line */}
                                    <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Meta 80%', fill: '#EF4444', fontSize: 10 }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Acta Parcial Sidebar */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2D5F3E', marginBottom: '12px' }}>
                            <FileText size={20} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Acta Parcial en Curso</h3>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                            ACTA PARCIAL #03 — Periodo: Marzo 2026
                        </div>
                    </div>
                    
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {[
                                { label: 'Libro de cantidades firmado', checked: true },
                                { label: 'Registro fotográfico georreferenciado', checked: true },
                                { label: 'Informe de Valor Ganado (SPI + CPI)', checked: false, warning: true },
                                { label: 'Actas de comité de obra del mes', checked: true },
                                { label: 'Certificación de parafiscales vigente', checked: true },
                                { label: 'Informe de inversión del anticipos', checked: false, warning: true },
                                { label: 'Resultados de ensayos de laboratorio', checked: true },
                                { label: 'Registro de no conformidades actualizado', checked: false, warning: true },
                                { label: 'Actas de reunión comunitaria', checked: true },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {item.checked ? (
                                        <div style={{ background: '#3B82F6', borderRadius: '4px', padding: '2px' }}><Check size={12} color="white" /></div>
                                    ) : item.warning ? (
                                        <div style={{ background: '#F59E0B', borderRadius: '4px', padding: '2px' }}><AlertCircle size={12} color="white" /></div>
                                    ) : (
                                        <div style={{ width: '16px', height: '16px', border: '2px solid #CBD5E1', borderRadius: '4px' }} />
                                    )}
                                    <span style={{ fontSize: '13px', color: item.checked ? '#1E293B' : '#64748B', fontWeight: item.checked ? '500' : '400' }}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: '600' }}>
                                <span>Documentos cargados: 6 de 9</span>
                            </div>
                            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '66%', height: '100%', background: '#2D5F3E', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        <button style={{ 
                            width: '100%', 
                            padding: '14px', 
                            background: '#7FB798', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: '700', 
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: 0.8
                        }}>
                            RADICAR ACTA PARCIAL
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderFinancieroTab = (p, projectPhysProgress) => {
        // Calculate SPI (Schedule Performance Index) based on physical progress vs expected time elapsed
        const start = p.fecha_inicio ? new Date(p.fecha_inicio) : new Date(new Date().setMonth(new Date().getMonth() - 2));
        const end = p.fecha_fin ? new Date(p.fecha_fin) : new Date(new Date().setMonth(new Date().getMonth() + 4));
        const today = new Date();
        
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = Math.max(0, today.getTime() - start.getTime());
        const planProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        
        // CPI logic adapted for SPI (since we only track time delay)
        const cpiValue = planProgress > 0 ? (projectPhysProgress / planProgress) : 1.0;
        const boundedCpi = Math.min(1.2, Math.max(0, cpiValue));
        
        const valorTotal = parseFloat(p.valor_estimado) || 150000000;
        
        // Generate dynamic Cash Flow based on project dates
        const totalMonths = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24 * 30)));
        const currentMonthIdx = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24 * 30)));
        
        const fluxoCajaData = [{ name: 'Inicio', plan: 0, real: 0, pagado: 50 }]; // Anticipo
        
        for (let i = 1; i <= totalMonths; i++) {
            const isPastOrPresent = i <= currentMonthIdx;
            const expectedForMonth = Math.min(100, (i / totalMonths) * 100);
            
            // Real progress scales up to "projectPhysProgress" around the current month
            let realForMonth = null;
            let pagadoForMonth = null;
            if (isPastOrPresent) {
                // Approximate past real progress linearly, up to current projectPhysProgress
                const progressToDate = i === currentMonthIdx || currentMonthIdx === 0 ? projectPhysProgress : (projectPhysProgress * (i / currentMonthIdx));
                realForMonth = Math.min(100, Math.max(0, progressToDate));
                // Amortization: 50% advance means paid is 50% + (real * 0.5)
                pagadoForMonth = 50 + (realForMonth * 0.5);
            }
            
            fluxoCajaData.push({
                name: `Mes ${i}`,
                plan: parseFloat(expectedForMonth.toFixed(1)),
                real: realForMonth !== null ? parseFloat(realForMonth.toFixed(1)) : null,
                pagado: pagadoForMonth !== null ? parseFloat(pagadoForMonth.toFixed(1)) : null
            });
        }

        return (
            <div className="financiero-tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Top Section: CPI and Chart */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
                    {/* CPI Gauge Card */}
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ height: '140px', width: '220px', overflow: 'hidden' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                    <Pie
                                        data={[
                                            { value: boundedCpi },
                                            { value: Math.max(0, 1.2 - boundedCpi) }
                                        ]}
                                        cx="50%"
                                        cy="100%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#2D5F3E" stroke="none" />
                                        <Cell fill="#F1F5F9" stroke="none" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: '-20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: '#1E4129' }}>{boundedCpi.toFixed(2)}</div>
                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>SPI (Meta: &gt; 0.95)</div>
                        </div>
                    </div>

                    {/* Cash Flow Chart Card */}
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#1E293B', fontWeight: '700' }}>
                            Flujo de Caja — Planificado vs. Real vs. Pagado (%)
                        </h4>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={fluxoCajaData}>
                                    <defs>
                                        <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2D5F3E" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#2D5F3E" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPagado" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E67E22" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#E67E22" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="plan" stroke="#3B82F6" fillOpacity={1} fill="url(#colorPlan)" strokeWidth={2} name="Planificado" />
                                    <Area type="monotone" dataKey="real" stroke="#2D5F3E" fillOpacity={1} fill="url(#colorReal)" strokeWidth={2} name="Real" />
                                    <Area type="monotone" dataKey="pagado" stroke="#E67E22" fillOpacity={1} fill="url(#colorPagado)" strokeWidth={2} name="Pagado" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Advance Status Card */}
                <div style={{ background: '#F0F9F4', padding: '32px', borderRadius: '16px', border: '1px solid #DCF2E6' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Estado del Anticipo</h3>
                    {(() => {
                        const anticipoTotal = valorTotal * 0.5; // 50%
                        const amortizado = anticipoTotal * (projectPhysProgress / 100);
                        const saldo = anticipoTotal - amortizado;
                        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
                        
                        return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>Anticipo otorgado:</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>{formatter.format(anticipoTotal)} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748B' }}>(50%)</span></div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>Saldo por amortizar:</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>{formatter.format(saldo)}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>Amortizado a la fecha:</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>{formatter.format(amortizado)}</div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', background: '#DCF2E6', padding: '6px 12px', borderRadius: '6px', alignSelf: 'flex-start', marginTop: '4px' }}>
                                            <Check size={16} />
                                            <span style={{ fontSize: '15px', fontWeight: '700' }}>Normal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        );
    };

    const renderCalidadTab = (projectPhysProgress) => {

        const testData = [
            { ensayo: 'Compresión concreto', muestra: 'C-015-7D', resultado: '19.2 MPa', espec: '≥ 17.5 MPa', cumple: true },
            { ensayo: 'Compresión concreto', muestra: 'C-015-28D', resultado: 'Pendiente', espec: '≥ 21 MPa', cumple: 'pendiente' },
            { ensayo: 'Densidad compactación', muestra: 'S-003', resultado: '96.2%', espec: '≥ 95% Proctor', cumple: true },
            { ensayo: 'Compresión concreto', muestra: 'C-018-7D', resultado: '18.5 MPa', espec: '≥ 17.5 MPa', cumple: true },
            { ensayo: 'Granulometría agregado', muestra: 'AG-007', resultado: 'Dentro de franja', espec: 'NTC 174', cumple: true },
        ];

        return (
            <div className="calidad-tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Laboratory Tests Table */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Ensayos de Laboratorio</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Ensayo</th>
                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Muestra</th>
                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Resultado</th>
                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Especificación</th>
                                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Cumple</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>{row.ensayo}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{row.muestra}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: row.resultado === 'Pendiente' ? '#F59E0B' : '#1E293B', fontWeight: '600' }}>{row.resultado}</td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748B' }}>{row.espec}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {row.cumple === true ? (
                                            <div style={{ display: 'inline-flex', background: '#10B981', borderRadius: '4px', padding: '2px' }}>
                                                <Check size={14} color="white" />
                                            </div>
                                        ) : row.cumple === 'pendiente' ? (
                                            <div style={{ display: 'inline-flex', background: '#F59E0B', borderRadius: '4px', padding: '2px' }}>
                                                <Clock size={14} color="white" />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'inline-flex', background: '#EF4444', borderRadius: '4px', padding: '2px' }}>
                                                <AlertTriangle size={14} color="white" />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bottom row: Inspections and Dossier */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {/* Inspections Card */}
                    <div style={{ background: '#F0F9F4', padding: '32px', borderRadius: '16px', border: '1px solid #DCF2E6' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Inspecciones</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Programadas: 8 realizadas / 8 planificadas</span>
                                <div style={{ background: '#10B981', borderRadius: '4px', padding: '2px', display: 'flex' }}><Check size={12} color="white" /></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Sorpresivas: 1 realizada / 1 mínima</span>
                                <div style={{ background: '#10B981', borderRadius: '4px', padding: '2px', display: 'flex' }}><Check size={12} color="white" /></div>
                            </div>
                        </div>
                    </div>

                    {/* Dossier Card */}
                    <div style={{ background: '#F0F9F4', padding: '32px', borderRadius: '16px', border: '1px solid #DCF2E6' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Dossier de Calidad</h3>
                        <div style={{ height: '12px', background: 'white', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
                            <div style={{ width: `${Math.min(100, projectPhysProgress * 1.1).toFixed(0)}%`, height: '100%', background: '#2D5F3E', borderRadius: '6px' }}></div>
                        </div>
                        <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>{Math.min(100, projectPhysProgress * 1.1).toFixed(0)}% completado</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderHeader = () => {
        return (
        <div className="page-header" style={{ marginBottom: '16px', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                    Sistema de Control y Seguimiento de Obra
                </h1>
                {selectedProyecto ? (
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                        Proyecto: <strong>{selectedProyecto.nombre}</strong>
                        <button 
                            style={{ color: '#6c733d', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', fontSize: '12px' }}
                            onClick={() => setSelectedProyecto(null)}
                        >
                            ← Cambiar
                        </button>
                    </p>
                ) : (
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                        Selecciona un proyecto para ver el detalle de avance.
                    </p>
                )}
            </div>

            <div className="header-actions">
                {currentUser?.rol === 'asesor_vivienda' && (
                    <button 
                        className="btn-primary" 
                        onClick={() => setShowNuevoProyecto(true)}
                        style={{ padding: '10px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        <span>Nuevo Proyecto</span>
                    </button>
                )}
                <select 
                    className="selector-institucional"
                    value={selectedProyecto?.id || ''}
                    onChange={(e) => {
                        const proj = proyectosDB.find(p => p.id === e.target.value);
                        setSelectedProyecto(proj);
                        setSelectedVivienda(null);
                    }}
                >
                    <option value="">Seleccione Proyecto...</option>
                    {proyectosDB.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.municipio})</option>
                    ))}
                </select>
            </div>
        </div>
        );
    };

    const renderProyectosOverview = () => {
        const filteredProyectos = proyectosDB.filter(p => 
            (p.nombre?.toLowerCase() || '').includes(searchProyecto.toLowerCase()) ||
            (p.municipio?.toLowerCase() || '').includes(searchProyecto.toLowerCase())
        );

        return (
            <div className="proyectos-overview-container fade-in">
                {/* Dashboard Header Metrics */}
                <div className="dashboard-metrics-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    <SummaryCard 
                        title="Contratos Activos" 
                        value={metrics.totalProyectos}
                        subtitle={`${metrics.enAlerta} en alerta de desempeño`}
                        icon={FileText}
                        accentColor="#2D5F3E"
                    />
                    <SummaryCard 
                        title="Ejecución Financiera" 
                        value={`${metrics.ejecucionFinanciera.toFixed(1)}%`}
                        subtitle={`$${(metrics.totalEjecutado / 1e9).toFixed(1)}B de $${(metrics.totalEstimado / 1e9).toFixed(1)}B`}
                        icon={CheckCircle2}
                        accentColor="#2D5F3E"
                    />
                    <SummaryCard 
                        title="SPI Promedio" 
                        value={metrics.avgSPI.toFixed(2)}
                        trend={metrics.avgSPI >= 0.95 ? "▲ Meta: 0.95" : "▼ Meta: 0.95"}
                        subtitle="Índice Desempeño Cronograma"
                        icon={Clock}
                        accentColor={metrics.avgSPI >= 0.95 ? "#2D5F3E" : "#F59E0B"}
                    />
                    <SummaryCard 
                        title="CPI Promedio" 
                        value={metrics.avgCPI.toFixed(2)}
                        trend={metrics.avgCPI >= 0.95 ? "▲ Meta: 0.95" : "▼ Meta: 0.95"}
                        subtitle="Índice Desempeño Costos"
                        icon={AlertTriangle}
                        accentColor={metrics.avgCPI >= 0.95 ? "#2D5F3E" : "#F59E0B"}
                    />
                </div>

                {/* Charts Section */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 1fr', 
                    gap: '24px', 
                    marginBottom: '32px' 
                }}>
                    {/* Avance Físico vs Financiero */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#1E293B', fontWeight: '700' }}>Avance Físico vs. Financiero por Contrato</h4>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={proyectosDB.map(p => {
                                        const phys = calculateGlobalProjectProgress(p.id);
                                        const startDate = p.fecha_inicio ? new Date(p.fecha_inicio) : null;
                                        const endDate = p.fecha_fin ? new Date(p.fecha_fin) : null;
                                        const now = new Date();
                                        let planProg = 0;
                                        if (startDate && endDate) {
                                            const dur = endDate.getTime() - startDate.getTime();
                                            const el = Math.max(0, now.getTime() - startDate.getTime());
                                            planProg = Math.min(100, (el / dur) * 100);
                                        }
                                        return {
                                            name: (p.descripcion_objeto || p.nombre || '').substring(0, 15) + ((p.descripcion_objeto || p.nombre || '').length > 15 ? '...' : ''),
                                            id: p.id.substring(0, 6),
                                            fisico: parseFloat(phys.toFixed(1)),
                                            financiero: parseFloat(Math.max(0, phys - 2).toFixed(1)),
                                            planificado: parseFloat(planProg.toFixed(1))
                                        };
                                    })}
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis 
                                        dataKey="id" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#F8FAFC' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                    <Bar dataKey="fisico" name="Avance Físico" fill="#2D5F3E" radius={[0, 4, 4, 0]} barSize={10} />
                                    <Bar dataKey="financiero" name="Avance Financiero" fill="#7FB798" radius={[0, 4, 4, 0]} barSize={10} />
                                    <Bar dataKey="planificado" name="Planificado" fill="#93C5FD" radius={[0, 4, 4, 0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Contratos por Municipio */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#1E293B', fontWeight: '700' }}>Contratos por Municipio</h4>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(proyectosDB.reduce((acc, p) => {
                                            const muni = p.municipio || 'Otros';
                                            acc[muni] = (acc[muni] || 0) + 1;
                                            return acc;
                                        }, {})).map(([name, value]) => ({ name, value }))}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {[ '#2D5F3E', '#E67E22', '#10B981', '#3B82F6', '#6366F1' ].map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend align="right" verticalAlign="middle" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="overview-search-bar">
                    <div className="search-input-wrapper">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por contrato, objeto o municipio..." 
                            value={searchProyecto}
                            onChange={(e) => setSearchProyecto(e.target.value)}
                        />
                    </div>
                    <div className="overview-filters">
                        <button className="filter-btn active">Todos</button>
                    </div>
                </div>

                <div className="overview-table-wrapper">
                    <table className="overview-table">
                        <thead>
                            <tr>
                                <th>Contrato</th>
                                <th>Objeto</th>
                                <th>Municipio</th>
                                <th style={{ textAlign: 'center' }}>% Físico</th>
                                <th style={{ textAlign: 'center' }}>SPI</th>
                                <th style={{ textAlign: 'center' }}>CPI</th>
                                <th style={{ textAlign: 'center' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProyectos.map((p, idx) => {
                                const progress = calculateGlobalProjectProgress(p.id);
                                const statusColor = progress > 80 ? '#10B981' : progress > 40 ? '#F59E0B' : '#EF4444';
                                
                                // Recalcular CPI/SPI en base al progreso real si lo hay
                                const spi = progress > 0 ? (0.92 + (progress / 1000)).toFixed(2) : (0.9 + (idx * 0.02) % 0.1).toFixed(2);
                                const cpi = progress > 0 ? (0.94 + (progress / 2000)).toFixed(2) : (0.95 + (idx * 0.01) % 0.05).toFixed(2);

                                return (
                                    <tr key={p.id} onClick={() => setSelectedProyecto(p)}>
                                        <td className="font-mono">{p.numero_proceso || 'S/N'}</td>
                                        <td className="cell-objeto">
                                            <strong>{p.descripcion_objeto || p.nombre}</strong>
                                            <span>{p.numero_proceso}</span>
                                        </td>
                                        <td>{p.municipio}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="mini-progress-cell">
                                                <span className="progress-text">{progress}%</span>
                                                <div className="mini-bar-bg">
                                                    <div className="mini-bar-fill" style={{ width: `${progress}%`, background: statusColor }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{spi}</td>
                                        <td style={{ textAlign: 'center' }}>{cpi}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="status-dot-wrapper">
                                                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredProyectos.length === 0 && (
                        <div className="empty-table-state">
                            <Search size={32} />
                            <p>No se encontraron proyectos con ese criterio</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderProjectSummaryCard = () => {
        if (!selectedProyecto) return null;

        const p = selectedProyecto;
        
        return (
            <div className="project-summary-card-detailed fade-in" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E2E8F0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Header with Project ID and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1E293B', letterSpacing: '-0.5px' }}>
                            {p.numero_proceso || 'PROYECTO - ' + p.id.substring(0, 8)}
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#64748B', fontWeight: '500' }}>
                            {p.descripcion_objeto || p.nombre}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                            className="btn-primary" 
                            style={{ background: '#2D5F3E', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                            onClick={generateProjectPDF}
                        >
                            <FileText size={16} />
                            Reporte PDF
                        </button>

                        {currentUser?.rol === 'asesor_vivienda' && (
                            !isEditingSummary ? (
                                <button 
                                    className="btn-secondary btn-small"
                                    onClick={() => {
                                        setIsEditingSummary(true);
                                        setEditSummaryData({ ...p });
                                    }}
                                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: '600' }}
                                >
                                    Modificar
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        className="btn-text" 
                                        onClick={() => setIsEditingSummary(false)}
                                        style={{ fontSize: '12px', color: '#64748B' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="btn-primary btn-small"
                                        onClick={handleUpdateSummary}
                                        disabled={isUpdatingSummary}
                                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', background: '#2D5F3E' }}
                                    >
                                        {isUpdatingSummary ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            )
                        )}
                        <div style={{ 
                            background: (p.spi < 0.95 || p.cpi < 0.95) ? '#FFFBEB' : '#F0FDF4', 
                            color: (p.spi < 0.95 || p.cpi < 0.95) ? '#B45309' : '#15803D', 
                            padding: '6px 16px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            border: `1px solid ${(p.spi < 0.95 || p.cpi < 0.95) ? '#FDE68A' : '#BBF7D0'}`
                        }}>
                            {(p.spi < 0.95 || p.cpi < 0.95) ? 'ALERTA' : 'AL DÍA'}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '20px',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '20px'
                }}>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Contratista:</label>
                        {isEditingSummary ? (
                            <input 
                                value={editSummaryData.contratista || ''}
                                onChange={e => setEditSummaryData({...editSummaryData, contratista: e.target.value})}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.contratista || 'No registrado'}</span>
                        )}
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Supervisor:</label>
                        {isEditingSummary ? (
                            <input 
                                value={editSummaryData.supervisor || ''}
                                onChange={e => setEditSummaryData({...editSummaryData, supervisor: e.target.value})}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.supervisor || 'No registrado'}</span>
                        )}
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Municipio:</label>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.municipio}{p.resguardo ? `, ${p.resguardo}` : ''}</span>
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Valor:</label>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '800' }}>${(parseFloat(p.valor_estimado) || 0).toLocaleString('es-CO')}</span>
                    </div>

                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Plazo:</label>
                        {isEditingSummary ? (
                            <input 
                                value={editSummaryData.plazo || ''}
                                onChange={e => setEditSummaryData({...editSummaryData, plazo: e.target.value})}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.plazo || 'Sin definir'}</span>
                        )}
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Inicio:</label>
                        {isEditingSummary ? (
                            <input 
                                type="date"
                                value={editSummaryData.fecha_inicio || ''}
                                onChange={e => setEditSummaryData({...editSummaryData, fecha_inicio: e.target.value})}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.fecha_inicio || '--/--/--'}</span>
                        )}
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Fin:</label>
                        {isEditingSummary ? (
                            <input 
                                type="date"
                                value={editSummaryData.fecha_fin || ''}
                                onChange={e => setEditSummaryData({...editSummaryData, fecha_fin: e.target.value})}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.fecha_fin || '--/--/--'}</span>
                        )}
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Interventor:</label>
                        {isEditingSummary ? (
                            <input 
                                value={editSummaryData.interventor_principal || ''}
                                onChange={e => setEditSummaryData({...editSummaryData, interventor_principal: e.target.value})}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.interventor_principal || 'No registrado'}</span>
                        )}
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Lugar Ejecución:</label>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.lugar_ejecucion || 'No registrado'}</span>
                    </div>
                    <div className="info-item">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Fecha Estudio:</label>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>{p.fecha_estudio || 'No registrado'}</span>
                    </div>
                    <div className="info-item" style={{ borderLeft: '3px solid #E67E22', paddingLeft: '12px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#E67E22', textTransform: 'uppercase', marginBottom: '4px' }}>Estado Workflow:</label>
                        <span style={{ fontSize: '13px', color: '#D35400', fontWeight: '800' }}>{p.firmado_directora ? 'SOLICITUD FORMALIZADA' : 'EN PREPARACIÓN'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderActividadesTimeline = () => (
        <div className="activities-timeline-container">
            <div className="timeline-header">
                <h3>Cronograma de Ejecución: Casa Unidad {selectedVivienda.numero}</h3>
                <div className="header-actions">
                    <button className="btn-secondary btn-small">
                        <FileText size={16} /> Ver Historial
                    </button>
                </div>
            </div>
            <div className="timeline-items">
                {ACTIVIDADES_CATALOGO.map((act, index) => {
                    // normalize vivienda_num (can be '1' or '01') for comparison
                    const todosRegistrosActividad = registrosSincronizados.filter(
                        r => parseInt(r.vivienda_num) === parseInt(selectedVivienda.numero_lote) && r.actividad_id === act.id
                    );

                    // El "registroSync" es el más reciente para obtener comentarios/fotos actuales
                    const registroSync = todosRegistrosActividad.length > 0 ? todosRegistrosActividad[0] : null;

                    // CORRECCIÓN: Calcular progreso acumulado real sumando todos los reportes
                    const progresoAcumulado = todosRegistrosActividad.reduce((acc, r) => acc + (r.progreso || 0), 0);
                    const finalProgreso = progresoAcumulado > 100 ? 100 : progresoAcumulado;

                    const isCompleted = finalProgreso >= 100;
                    const isStarted = finalProgreso > 0;
                    
                    // Cálculo de Alerta de Cronograma (Delay Alert)
                    let hasDelayAlert = false;
                    let expectedFinishDate = null;
                    if (selectedProyecto.fecha_inicio) {
                        const start = new Date(selectedProyecto.fecha_inicio);
                        let cumulativeDays = 0;
                        for (let i = 0; i <= index; i++) {
                            cumulativeDays += ACTIVIDADES_CATALOGO[i].duracion_dias || 0;
                        }
                        expectedFinishDate = new Date(start.getTime() + cumulativeDays * 24 * 60 * 60 * 1000);
                        const today = new Date();
                        if (today > expectedFinishDate && !isCompleted) {
                            hasDelayAlert = true;
                        }
                    }

                    const isCurrent = !isCompleted && (index === 0 || !!registrosSincronizados.find(r => 
                        parseInt(r.vivienda_num) === parseInt(selectedVivienda.numero_lote) && 
                        r.actividad_id === ACTIVIDADES_CATALOGO[index - 1]?.id && 
                        (registrosSincronizados.filter(rr => rr.actividad_id === r.actividad_id).reduce((s, rr) => s + rr.progreso, 0) >= 100)
                    ));
                    const isLocked = !isStarted && !isCurrent;

                    const prevAct = index > 0 ? ACTIVIDADES_CATALOGO[index - 1] : null;
                    const showHeader = !prevAct || prevAct.capitulo !== act.capitulo;
                    const isCollapsed = collapsedChapters[act.capitulo];

                    return (
                        <React.Fragment key={act.id}>
                            {showHeader && (
                                <div className="chapter-header" onClick={() => toggleChapter(act.capitulo)} style={{ cursor: 'pointer' }}>
                                    <div className="chapter-line"></div>
                                    <span className="chapter-tag">{act.capitulo}</span>
                                    <button className="chapter-toggle-btn">
                                        {isCollapsed ? <ChevronRight size={14} /> : <div style={{ transform: 'rotate(90deg)' }}><ChevronRight size={14} /></div>}
                                    </button>
                                </div>
                            )}

                            {!isCollapsed && (
                                <div className={`timeline-item ${isCompleted ? 'completed' : isStarted ? 'in-progress' : ''} ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''} ${hasDelayAlert ? 'delayed-alert' : ''}`}
                                    style={hasDelayAlert ? { borderLeft: '4px solid #EF4444', background: '#FEF2F2' } : {}}
                                >
                                    <div className="timeline-dot" style={hasDelayAlert ? { background: '#EF4444' } : {}}>
                                        {isCompleted ? <CheckCircle2 size={16} /> :
                                            hasDelayAlert ? <AlertCircle size={16} color="white" /> :
                                            isLocked ? <Clock size={16} /> :
                                                <AlertTriangle size={16} />}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-title-row">
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h4 style={hasDelayAlert ? { color: '#991B1B' } : {}}>{act.nombre}</h4>
                                                {expectedFinishDate && (
                                                    <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                                                        Meta: {expectedFinishDate.toLocaleDateString('es-CO')} ({act.duracion_dias} días)
                                                    </span>
                                                )}
                                            </div>
                                            {hasDelayAlert && (
                                                <span style={{ 
                                                    background: '#FEE2E2', 
                                                    color: '#B91C1C', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '10px', 
                                                    fontWeight: '700',
                                                    border: '1px solid #FECACA',
                                                    marginLeft: '8px'
                                                }}>
                                                    RETRASADO
                                                </span>
                                            )}
                                            {isStarted && (
                                                <span className={`completed-badge ${finalProgreso < 100 ? 'in-progress' : ''}`}>
                                                    {finalProgreso}% {finalProgreso === 100 ? 'Completado' : 'Ejecutado'}
                                                </span>
                                            )}
                                            {isCurrent && <span className="current-label">Actividad Actual</span>}

                                            {isStarted && (
                                                <button
                                                    className={`activity-photo-toggle ${expandedPhotos[act.id] ? 'active' : ''}`}
                                                    onClick={() => togglePhoto(act.id)}
                                                >
                                                    <Camera size={14} />
                                                    {expandedPhotos[act.id] ? <div style={{ transform: 'rotate(90deg)' }}><ChevronRight size={14} /></div> : <ChevronRight size={14} />}
                                                </button>
                                            )}
                                        </div>
                                        <p className="timeline-desc">{act.descripcion}</p>

                                        {isCompleted && expandedPhotos[act.id] && todosRegistrosActividad.length > 0 && (
                                            <div className="activity-evidence-preview" style={{ background: '#F8FAFC', padding: '15px', borderRadius: '10px', marginTop: '15px', border: '1px solid #E2E8F0' }}>
                                                {/* MOSTRAR SOLO EL ÚLTIMO REPORTE (Estado Actual) para evitar duplicados visuales */}
                                                {todosRegistrosActividad.slice(0, 1).map((registro, rIdx) => {
                                                    const fotosRegistro = [registro.foto_url, registro.foto_url_2, registro.foto_url_3].filter(u => !!u);
                                                    if (fotosRegistro.length === 0) return null;
                                                    return (
                                                        <div key={rIdx} style={{ marginBottom: rIdx < todosRegistrosActividad.length - 1 ? '15px' : 0 }}>
                                                            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', fontWeight: '600' }}>
                                                                Reporte #{todosRegistrosActividad.length - rIdx} — {registro.progreso}% — {new Date(registro.created_at || registro.timestamp).toLocaleString('es-CO')}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '10px' }}>
                                                                {fotosRegistro.map((url, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className="thumbnail-wrapper"
                                                                        style={{ position: 'relative', width: '180px', height: '120px', flexShrink: 0, cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                                                        onClick={() => setViewingPhoto({
                                                                            url,
                                                                            title: `${act.nombre} - Reporte ${todosRegistrosActividad.length - rIdx} Foto ${i + 1}`,
                                                                            date: new Date(registro.created_at || registro.timestamp).toLocaleDateString('es-CO'),
                                                                            comentario: registro.comentario,
                                                                            lat: registro.latitud,
                                                                            lng: registro.longitud
                                                                        })}
                                                                    >
                                                                        <img src={url} alt={`Evidencia ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '3px 0' }}>Foto {i + 1}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                                                    {registroSync.comentario && (
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                                <MessageSquare size={14} color="#64748B" />
                                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Observación del Residente</span>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', fontStyle: 'italic', lineHeight: '1.5' }}>"{registroSync.comentario}"</p>
                                                        </div>
                                                    )}

                                                    {registroSync.latitud && registroSync.longitud && (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <MapPin size={16} color="var(--color-rojo-primario)" />
                                                                <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                                                                    Ubicación: {registroSync.latitud.toFixed(6)}, {registroSync.longitud.toFixed(6)}
                                                                </span>
                                                            </div>
                                                            <a
                                                                href={`https://www.google.com/maps?q=${registroSync.latitud},${registroSync.longitud}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ fontSize: '12px', color: 'var(--color-rojo-primario)', fontWeight: '600', textDecoration: 'none', borderBottom: '1px solid var(--color-rojo-primario)' }}
                                                            >
                                                                Ver Mapa
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#94A3B8', textAlign: 'right' }}>
                                                        Capturado el: {new Date(registroSync.created_at || registroSync.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {isCurrent && (
                                            <div className="activity-details-panel" style={{ marginTop: '15px', padding: '15px', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                    <span className="label" style={{ color: '#64748B', fontSize: '13px' }}>Avance Actividad: </span>
                                                    <div className="progress-inline" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginLeft: '15px' }}>
                                                        <div className="progress-bar-bg" style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', flex: 1 }}>
                                                            <div className="progress-bar-fill" style={{ width: '0%', height: '100%', background: 'var(--color-rojo-primario)', borderRadius: '4px' }}></div>
                                                        </div>
                                                        <span style={{ fontWeight: '700', fontSize: '13px' }}>0%</span>
                                                    </div>
                                                </div>
                                                <div className="action-row">
                                                    <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center' }}>Pendiente de registro desde la aplicación móvil</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    )

    const renderTabNavigation = () => (
        <div className="project-tabs-nav" style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '24px', 
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '2px'
        }}>
            {['Tiempo', 'Financiero', 'Técnico', 'Calidad', 'Social'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: activeTab === tab ? '#2D5F3E' : '#64748B',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === tab ? '3px solid #2D5F3E' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderRadius: '4px 4px 0 0'
                    }}
                >
                    {tab}
                </button>
            ))}
        </div>
    );

    return (
        <div className="bitacora-container">
            {renderHeader()}

            {!selectedProyecto ? (
                renderProyectosOverview()
            ) : (() => {
                const p = selectedProyecto;
                const projectPhysProgress = calculateProjectProgress(p.id);
                
                return (
                    <>
                        {renderProjectSummaryCard()}
                        {renderTabNavigation()}
                        
                        <div className="tab-render-area">
                            {activeTab === 'Tiempo' && renderTiempoTab(projectPhysProgress)}
                            {activeTab === 'Financiero' && renderFinancieroTab(selectedProyecto, projectPhysProgress)}
                            {activeTab === 'Técnico' && (
                                <div className="bitacora-layout">
                                    <aside className="viviendas-sidebar">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ margin: 0 }}>Viviendas del Proyecto</h3>
                                            {currentUser?.rol === 'asesor_vivienda' && (
                                                <button 
                                                    className="btn-text-small" 
                                                    style={{ color: 'var(--color-rojo-primario)', display: 'flex', alignItems: 'center', gap: '4px', background: '#FEE2E2', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: 'none' }}
                                                    onClick={() => {
                                                        setEditedViviendas(JSON.parse(JSON.stringify(viviendasDB))); // deep copy
                                                        setEditingHousesProject(selectedProyecto);
                                                        setShowEditHousesModal(true);
                                                    }}
                                                >
                                                    <Settings size={14} /> Editar
                                                </button>
                                            )}
                                        </div>
                                        <div className="viviendas-grid">
                                            {viviendasDB.length > 0 ? viviendasDB.map((vivienda) => {
                                                const avance = calculateHouseProgress(vivienda);
                                                const estado = avance === 100 ? 'COMPLETADA' : avance > 0 ? 'EN_PROGRESO' : 'PENDIENTE';
                                                
                                                return (
                                                    <div 
                                                        key={vivienda.id}
                                                        className={`vivienda-card ${selectedVivienda?.id === vivienda.id ? 'active' : ''}`}
                                                        onClick={() => setSelectedVivienda(vivienda)}
                                                    >
                                                        <div className="vivienda-card-header">
                                                            <div className="vivienda-number">
                                                                <Home size={16} />
                                                                Casa {vivienda.numero_lote}
                                                            </div>
                                                            <span className={`vivienda-badge ${estado.toLowerCase()}`}>
                                                                {estado.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: '500' }}>
                                                            Beneficiario: {vivienda.beneficiario || 'No asignado'}
                                                        </div>
                                                        <div className="vivienda-progress-mini">
                                                            <div className="progress-bar-bg">
                                                                <div className="progress-bar-fill" style={{ width: `${avance}%` }}></div>
                                                            </div>
                                                            <span>{avance}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '14px' }}>
                                                    {!selectedProyecto ? 'Seleccione un proyecto primero' : 'No hay viviendas registradas'}
                                                </div>
                                            )}
                                        </div>
                                    </aside>

                                    <main className="bitacora-main">
                                        {selectedVivienda ? (
                                            renderActividadesTimeline()
                                        ) : (
                                            <div className="empty-state-card mini">
                                                <Home size={32} />
                                                <p>Seleccione una vivienda para ver su bitácora detallada</p>
                                            </div>
                                        )}
                                    </main>
                                </div>
                            )}
                            {activeTab === 'Calidad' && renderCalidadTab(projectPhysProgress)}
                            {activeTab === 'Social' && (
                                <div style={{ background: 'white', padding: '60px', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏗️</div>
                                    <h3 style={{ color: '#1E293B', margin: '0 0 10px 0' }}>Módulo en Construcción</h3>
                                    <p style={{ color: '#64748B', margin: 0 }}>Estamos vinculando la información de {activeTab.toLowerCase()} para este proyecto.</p>
                                </div>
                            )}
                        </div>
                    </>
                );
            })()}

            {/* Modal Editar Viviendas */}
            {showEditHousesModal && (
                <div className="photo-modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '50px' }}>
                    <div className="create-project-modal" style={{ background: 'white', borderRadius: '12px', padding: 0, overflow: 'hidden', maxWidth: '800px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div className="photo-modal-header" style={{ background: '#F8FAFC', padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} color="#64748B"/> Editar Viviendas</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>Proyecto: {editingHousesProject?.nombre}</p>
                            </div>
                            <button className="close-modal-inline" onClick={() => setShowEditHousesModal(false)}>×</button>
                        </div>
                        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {editedViviendas.map((v, idx) => (
                                    <div key={v.id || idx} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>Vivienda {v.numero_lote || 'Sin Número'}</span>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>NÚMERO</label>
                                                <input 
                                                    type="text" 
                                                    value={v.numero_lote || ''} 
                                                    onChange={e => {
                                                        const updated = [...editedViviendas];
                                                        updated[idx].numero_lote = e.target.value;
                                                        setEditedViviendas(updated);
                                                    }}
                                                    placeholder="01"
                                                    style={{ width: '100%', textAlign: 'center', fontWeight: 'bold', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>BENEFICIARIO</label>
                                                <input 
                                                    type="text" 
                                                    value={v.beneficiario || ''} 
                                                    onChange={e => {
                                                        const updated = [...editedViviendas];
                                                        updated[idx].beneficiario = e.target.value;
                                                        setEditedViviendas(updated);
                                                    }}
                                                    placeholder="Nombre Completo"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>INTERVENTOR</label>
                                                <input 
                                                    type="text" 
                                                    value={v.interventor || ''} 
                                                    onChange={e => {
                                                        const updated = [...editedViviendas];
                                                        updated[idx].interventor = e.target.value;
                                                        setEditedViviendas(updated);
                                                    }}
                                                    placeholder="Asignado"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>DEPARTAMENTO</label>
                                                <input 
                                                    type="text" 
                                                    value={v.departamento || ''} 
                                                    onChange={e => {
                                                        const updated = [...editedViviendas];
                                                        updated[idx].departamento = e.target.value;
                                                        setEditedViviendas(updated);
                                                    }}
                                                    placeholder="Ej: Cauca"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>MUNICIPIO</label>
                                                <input 
                                                    type="text" 
                                                    value={v.municipio || ''} 
                                                    onChange={e => {
                                                        const updated = [...editedViviendas];
                                                        updated[idx].municipio = e.target.value;
                                                        setEditedViviendas(updated);
                                                    }}
                                                    placeholder="Ej: Páez"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>RESGUARDO / ZONA</label>
                                                <input 
                                                    type="text" 
                                                    value={v.resguardo || ''} 
                                                    onChange={e => {
                                                        const updated = [...editedViviendas];
                                                        updated[idx].resguardo = e.target.value;
                                                        setEditedViviendas(updated);
                                                    }}
                                                    placeholder="Resguardo o Sector"
                                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn-secondary" onClick={() => setShowEditHousesModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSaveHouses} disabled={isSavingHouses}>
                                {isSavingHouses ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingPhoto && (
                <div className="photo-modal-overlay" onClick={() => setViewingPhoto(null)}>
                    <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
                        {/* LADO IZQUIERDO: Imagen */}
                        <div className="photo-viewer-left">
                            <img src={viewingPhoto.url} alt={viewingPhoto.title} />
                        </div>

                        {/* LADO DERECHO: Información */}
                        <div className="photo-viewer-right">
                            <div className="photo-viewer-right-header">
                                <h3>Información de Evidencia</h3>
                                <button className="close-modal-inline" onClick={() => setViewingPhoto(null)}>×</button>
                            </div>
                            
                            <div className="photo-viewer-details-content">
                                <div className="detail-section">
                                    <h4 className="section-label">Actividad</h4>
                                    <p className="section-value">{viewingPhoto.title}</p>
                                </div>

                                <div className="detail-section">
                                    <h4 className="section-label">Fecha de Captura</h4>
                                    <p className="section-value">
                                        <Calendar size={16} />
                                        {viewingPhoto.date}
                                    </p>
                                </div>

                                {viewingPhoto.comentario && (
                                    <div className="detail-section comments-section">
                                        <h4 className="section-label">Observaciones del Residente</h4>
                                        <div className="comment-bubble">
                                            <p>"{viewingPhoto.comentario}"</p>
                                        </div>
                                    </div>
                                )}

                                {viewingPhoto.lat && viewingPhoto.lng && (
                                    <div className="detail-section gps-section">
                                        <h4 className="section-label">Georreferenciación (GPS)</h4>
                                        <div className="gps-card">
                                            <div className="gps-info">
                                                <MapPin size={20} color="var(--color-rojo-primario)" />
                                                <div>
                                                    <span className="gps-coords">{viewingPhoto.lat.toFixed(6)}, {viewingPhoto.lng.toFixed(6)}</span>
                                                    <span className="gps-provider">Capturado vía App Móvil</span>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps?q=${viewingPhoto.lat},${viewingPhoto.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-maps"
                                            >
                                                Ver en Maps
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="photo-viewer-footer">
                                <p>Corporación Nasa Kiwe • Sincronización Automática</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="photo-modal-overlay">
                    <div className="photo-modal-content create-project-modal" onClick={e => e.stopPropagation()}>
                        <div className="photo-modal-header">
                            <h3>Crear Nuevo Proyecto Habitacional</h3>
                            <button className="close-modal" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <div className="create-form-content">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre del Proyecto</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Resguardo Vitoncó"
                                        value={newProject.nombre}
                                        onChange={e => setNewProject({...newProject, nombre: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Municipio</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Páez"
                                        value={newProject.municipio}
                                        onChange={e => setNewProject({...newProject, municipio: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Resguardo / Comunidad</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: NASA"
                                        value={newProject.resguardo}
                                        onChange={e => setNewProject({...newProject, resguardo: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Lugar de Ejecución</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Popayán, Cauca"
                                        value={newProject.lugar_ejecucion}
                                        onChange={e => setNewProject({...newProject, lugar_ejecucion: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha del Estudio</label>
                                    <input 
                                        type="date" 
                                        value={newProject.fecha_estudio}
                                        onChange={e => setNewProject({...newProject, fecha_estudio: e.target.value})}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Objeto / Descripción del Proyecto</label>
                                    <textarea 
                                        placeholder="Ej: Construcción de 12 viviendas rurales..."
                                        value={newProject.descripcion_objeto}
                                        onChange={e => setNewProject({...newProject, descripcion_objeto: e.target.value})}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '64px', resize: 'none' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Número de Proceso / Contrato</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: CNK-2026-008"
                                        value={newProject.numero_proceso}
                                        onChange={e => setNewProject({...newProject, numero_proceso: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Valor Estimado</label>
                                    <input 
                                        type="number" 
                                        placeholder="Ej: 850000000"
                                        value={newProject.valor_estimado}
                                        onChange={e => setNewProject({...newProject, valor_estimado: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contratista</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nombre de la empresa o persona"
                                        value={newProject.contratista}
                                        onChange={e => setNewProject({...newProject, contratista: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Supervisor</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nombre del supervisor"
                                        value={newProject.supervisor}
                                        onChange={e => setNewProject({...newProject, supervisor: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Interventor Principal</label>
                                    <input 
                                        type="text" 
                                        placeholder="Empresa de interventoría"
                                        value={newProject.interventor_principal}
                                        onChange={e => setNewProject({...newProject, interventor_principal: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Plazo (Ej: 6 meses)</label>
                                    <input 
                                        type="text" 
                                        placeholder="6 meses"
                                        value={newProject.plazo}
                                        onChange={e => setNewProject({...newProject, plazo: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Inicio</label>
                                    <input 
                                        type="date" 
                                        value={newProject.fecha_inicio}
                                        onChange={e => setNewProject({...newProject, fecha_inicio: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Fin</label>
                                    <input 
                                        type="date" 
                                        value={newProject.fecha_fin}
                                        onChange={e => setNewProject({...newProject, fecha_fin: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Número de Viviendas</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="50"
                                        value={newProject.numCasas}
                                        onChange={e => {
                                            const val = parseInt(e.target.value) || 1;
                                            const currentViviendas = [...newProject.viviendas];
                                            let newViviendas = [];
                                            
                                            if (val > currentViviendas.length) {
                                                const diff = val - currentViviendas.length;
                                                const additions = Array(diff).fill(null).map((_, i) => ({
                                                    numero: (currentViviendas.length + i + 1).toString().padStart(2, '0'),
                                                    beneficiario: '',
                                                    interventor: ''
                                                }));
                                                newViviendas = [...currentViviendas, ...additions];
                                            } else {
                                                newViviendas = currentViviendas.slice(0, val);
                                            }
                                            
                                            setNewProject({
                                                ...newProject, 
                                                numCasas: val,
                                                viviendas: newViviendas
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="viviendas-assignment-section" style={{ marginTop: '24px', padding: '0 4px' }}>
                                <h4 style={{ color: '#475569', fontSize: '15px', marginBottom: '16px', fontWeight: '700', borderBottom: '2px solid #F1F5F9', paddingBottom: '8px' }}>
                                    Detalle por Vivienda
                                </h4>
                                
                                <div className="viviendas-grid-header" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '15px', marginBottom: '8px', padding: '0 10px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Núm.</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Nombre del Beneficiario</span>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Interventor Asignado</span>
                                </div>

                                <div className="beneficiarios-list" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {newProject.viviendas.map((vivienda, index) => (
                                        <div key={index} className="vivienda-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '15px', marginBottom: '12px', alignItems: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                                            <div className="form-group-compact">
                                                <input 
                                                    type="text" 
                                                    placeholder="01"
                                                    value={vivienda.numero}
                                                    onChange={e => {
                                                        const updated = [...newProject.viviendas];
                                                        updated[index].numero = e.target.value;
                                                        setNewProject({...newProject, viviendas: updated});
                                                    }}
                                                    style={{ textAlign: 'center', fontWeight: 'bold' }}
                                                />
                                            </div>
                                            <div className="form-group-compact">
                                                <input 
                                                    type="text" 
                                                    placeholder="Nombre del Beneficiario"
                                                    value={vivienda.beneficiario}
                                                    onChange={e => {
                                                        const updated = [...newProject.viviendas];
                                                        updated[index].beneficiario = e.target.value;
                                                        setNewProject({...newProject, viviendas: updated});
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group-compact">
                                                <input 
                                                    type="text" 
                                                    placeholder="Ej: Ing. Wilson Castro"
                                                    value={vivienda.interventor}
                                                    onChange={e => {
                                                        const updated = [...newProject.viviendas];
                                                        updated[index].interventor = e.target.value;
                                                        setNewProject({...newProject, viviendas: updated});
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="photo-modal-footer" style={{ padding: '24px 32px', borderTop: '1px solid #F1F5F9', marginTop: '20px' }}>
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                            <button 
                                className="btn-primary" 
                                onClick={handleSaveProject}
                                disabled={creatingProject}
                            >
                                {creatingProject ? 'Creando...' : 'Crear Proyecto y Viviendas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .photo-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 40px;
                }
                .photo-modal-content {
                    background: white;
                    border-radius: 20px;
                    max-width: 1200px;
                    width: 100%;
                    height: 80vh;
                    display: flex;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .photo-viewer-left {
                    flex: 1.6;
                    background: #0F172A;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .photo-viewer-left img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .photo-viewer-right {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-left: 1px solid #E2E8F0;
                    min-width: 380px;
                }
                .photo-viewer-right-header {
                    padding: 24px;
                    border-bottom: 1px solid #F1F5F9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .photo-viewer-right-header h3 { margin: 0; font-size: 18px; color: #1E293B; font-weight: 700; }
                
                .close-modal-inline {
                    background: #F1F5F9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s;
                    line-height: 0;
                }
                .close-modal-inline:hover { background: #E2E8F0; color: #1E293B; }

                .photo-viewer-details-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                .detail-section { margin-bottom: 24px; }
                .section-label { font-size: 11px; text-transform: uppercase; color: #94A3B8; font-weight: 800; margin: 0 0 8px 0; letter-spacing: 0.5px; }
                .section-value { font-size: 15px; color: #334155; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px; }

                .comment-bubble {
                    background: #F8FAFC;
                    padding: 16px;
                    border-radius: 12px;
                    border-left: 4px solid var(--color-rojo-primario);
                }
                .comment-bubble p { margin: 0; font-style: italic; color: #475569; line-height: 1.6; }

                .gps-card {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .gps-info { display: flex; gap: 12px; align-items: center; }
                .gps-coords { display: block; font-size: 14px; font-weight: 700; color: #1E293B; }
                .gps-provider { display: block; font-size: 11px; color: #94A3B8; }
                
                .btn-maps {
                    background: #F1F5F9;
                    color: #475569;
                    text-decoration: none;
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    text-align: center;
                    transition: all 0.2s;
                }
                .btn-maps:hover { background: #E2E8F0; color: #1E293B; }

                .photo-viewer-footer {
                    padding: 20px 24px;
                    background: #F8FAFC;
                    border-top: 1px solid #F1F5F9;
                }
                .photo-viewer-footer p { margin: 0; font-size: 11px; color: #94A3B8; font-weight: 500; text-align: center; }

                @media (max-width: 1024px) {
                    .photo-modal-content { flex-direction: column; height: auto; max-height: 90vh; }
                    .photo-viewer-left { height: 300px; flex: none; }
                    .photo-viewer-right { min-width: 0; }
                }

                /* Estilos del Formulario de Creación */
                .create-project-modal {
                    flex-direction: column;
                    height: auto;
                    max-height: 90vh;
                    max-width: 800px;
                }
                .create-form-content {
                    .create-project-modal {
                    max-width: 850px;
                    width: 95%;
                    padding: 32px;
                }

                .photo-modal-header {
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #F1F5F9;
                }

                .create-form-content {
                    padding: 4px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .form-group-compact input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .form-group-compact input:focus {
                    border-color: var(--color-rojo-primario);
                    box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.1);
                }

                .beneficiarios-list::-webkit-scrollbar {
                    width: 6px;
                }
                .beneficiarios-list::-webkit-scrollbar-track {
                    background: #F1F5F9;
                }
                .beneficiarios-list::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 3px;
                }
    margin-bottom: 24px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                }
                .form-group input {
                    padding: 10px 14px;
                    border: 1px solid #E2E8F0;
                    border-radius: 8px;
                    font-size: 14px;
                }
                .beneficiarios-section {
                    border-top: 1px solid #F1F5F9;
                    padding-top: 20px;
                }
                .beneficiarios-section h4 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: #1E293B;
                }
                .beneficiarios-scroll {
                    max-height: 250px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .form-group-inline {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .form-group-inline span {
                    min-width: 70px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748B;
                }
                .form-group-inline input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    font-size: 14px;
                }
                .create-modal-footer {
                    padding: 20px 24px;
                    background: #F8FAFC;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid #F1F5F9;
                }
                .chapter-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 24px 0 16px;
                    position: relative;
                }
                .chapter-line {
                    width: 20px;
                    height: 1px;
                    background: #E5E7EB;
                }
                .chapter-tag {
                    background: #fdf2f2;
                    color: var(--color-rojo-primario);
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    border: 1px solid var(--color-rojo-claro);
                }
                .chapter-header:hover .chapter-tag {
                    background: var(--color-rojo-primario);
                    color: white;
                }
                
                .header-actions {
                    display: flex;
                    gap: 8px;
                }
                .chapter-toggle-btn {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: var(--color-gris-medio);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                }
                .chapter-header:hover .chapter-toggle-btn {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-rojo-primario);
                }
                .photo-metadata {
                    padding: 16px 20px;
                    background: #F9FAFB;
                    display: flex;
                    gap: 24px;
                    font-size: 13px;
                    color: #4B5563;
                }
                .photo-metadata span { display: flex; align-items: center; gap: 8px; }

                .activity-photo-toggle {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: var(--color-rojo-primario);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .activity-photo-toggle:hover {
                    background: #FEF2F2;
                    border-color: var(--color-rojo-claro);
                }
                .activity-photo-toggle.active {
                    background: var(--color-rojo-primario);
                    color: white;
                }
                
                .activity-evidence-preview {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 16px;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .thumbnail-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                    height: 240px;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid #E5E7EB;
                    box-shadow: var(--shadow-sm);
                }
                .thumbnail-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .thumbnail-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .thumbnail-wrapper:hover img { transform: scale(1.1); }
                .thumbnail-wrapper:hover .thumbnail-overlay { opacity: 1; }

                .btn-text-small {
                    background: none;
                    border: none;
                    color: var(--color-rojo-primario);
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 0;
                    cursor: pointer;
                }

                .bitacora-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .section-header-compact {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    border-left: 5px solid var(--color-rojo-primario);
                }
                .section-title { margin: 0; font-size: 20px; color: var(--color-gris-oscuro); }
                .section-subtitle { margin: 4px 0 0; color: var(--color-gris-medio); font-size: 14px; }
                
                .selector-institucional {
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: 1px solid #E5E7EB;
                    background: #F9FAFB;
                    font-size: 14px;
                    min-width: 250px;
                    cursor: pointer;
                }

                .bitacora-layout {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                }

                .viviendas-sidebar {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: var(--shadow-sm);
                    height: fit-content;
                }
                .viviendas-sidebar h3 { margin: 0 0 16px; font-size: 16px; color: var(--color-rojo-primario); }
                .viviendas-grid { display: flex; flex-direction: column; gap: 12px; }

                .vivienda-card {
                    padding: 16px;
                    border: 1px solid #E5E7EB;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .vivienda-card:hover { border-color: var(--color-rojo-claro); background: #FEF2F2; }
                .vivienda-card.active { border-color: var(--color-rojo-primario); background: #FEF2F2; box-shadow: 0 0 0 1px var(--color-rojo-primario); }
                
                .vivienda-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .vivienda-number { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--color-gris-oscuro); }
                .vivienda-badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 700; text-transform: uppercase; }
                .vivienda-badge.en_progreso { background: #FEF3C7; color: #D97706; }
                .vivienda-badge.bloqueada { background: #F3F4F6; color: #6B7280; }
                .vivienda-badge.completada { background: #D1FAE5; color: #059669; }

                .vivienda-progress-mini { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: var(--color-gris-medio); }
                .progress-bar-bg { flex: 1; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: var(--color-rojo-primario); border-radius: 3px; }

                .bitacora-main {
                    background: white;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: var(--shadow-sm);
                }

                .activities-timeline-container h3 { margin: 0 0 24px; color: var(--color-gris-oscuro); }
                .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }

                .timeline-items { display: flex; flex-direction: column; }
                .timeline-item { display: flex; gap: 20px; position: relative; padding-bottom: 24px; }
                .timeline-item:last-child { padding-bottom: 0; }
                .timeline-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    left: 17px;
                    top: 36px;
                    bottom: 0;
                    width: 2px;
                    background: #E5E7EB;
                }
                .timeline-item.completed::after { background: #059669; }

                .timeline-dot {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F3F4F6;
                    color: #9CA3AF;
                    z-index: 2;
                    flex-shrink: 0;
                    border: 4px solid white;
                }
                .timeline-item.completed .timeline-dot { background: #D1FAE5; color: #059669; }
                .timeline-item.active .timeline-dot { background: #FEF2F2; color: var(--color-rojo-primario); border-color: #FEF2F2; }
                
                .timeline-content { flex: 1; }
                .timeline-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
                .timeline-content h4 { margin: 0; font-size: 16px; color: var(--color-gris-oscuro); }
                .timeline-desc { margin: 0 0 12px; font-size: 14px; color: var(--color-gris-medio); }
                .current-label { font-size: 10px; background: var(--color-rojo-primario); color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
                .completed-badge { font-size: 10px; background: #059669; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
                .completed-badge.in-progress { background: var(--color-rojo-primario); }

                .activity-details-panel {
                    background: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 12px;
                }
                .detail-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .detail-row .label { font-size: 13px; font-weight: 600; color: var(--color-gris-medio); }
                .progress-inline { flex: 1; display: flex; align-items: center; gap: 12px; }
                .action-row { display: flex; gap: 12px; }

                .empty-state-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 40px;
                    background: white;
                    border-radius: 12px;
                    text-align: center;
                    color: var(--color-gris-medio);
                    border: 1px solid #E5E7EB;
                    margin: 20px 0;
                }
                .empty-icon-main { 
                    color: #F1F5F9; 
                    margin-bottom: 24px;
                }
                .empty-state-card h3 {
                    color: var(--color-rojo-primario);
                    margin: 0 0 12px 0;
                    font-size: 20px;
                    font-weight: 700;
                }
                .empty-state-card p {
                    color: #64748B;
                    max-width: 400px;
                    line-height: 1.6;
                }
                .empty-state-card.mini { padding: 40px; }

                /* Overview Table Styles */
                .proyectos-overview-container {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid #E2E8F0;
                }

                .overview-search-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    gap: 20px;
                }

                .search-input-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 10px 16px;
                    color: #64748B;
                }

                .search-input-wrapper input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                    color: #1E293B;
                }

                .overview-filters {
                    display: flex;
                    gap: 10px;
                }

                .filter-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #E2E8F0;
                    background: white;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748B;
                    cursor: pointer;
                }

                .filter-btn.active {
                    background: var(--color-rojo-claro);
                    border-color: var(--color-rojo-primario);
                    color: var(--color-rojo-primario);
                }

                .overview-table-wrapper {
                    overflow-x: auto;
                }

                .overview-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .overview-table th {
                    text-align: left;
                    padding: 12px 16px;
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #64748B;
                    font-weight: 800;
                    border-bottom: 2px solid #F1F5F9;
                }

                .overview-table tr {
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 1px solid #F1F5F9;
                }

                .overview-table tr:hover {
                    background: #F8FAFC;
                }

                .overview-table td {
                    padding: 16px;
                    font-size: 14px;
                    color: #334155;
                }

                .font-mono { font-family: monospace; font-weight: 600; color: #64748B; }

                .cell-objeto {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .cell-objeto strong { color: #1E293B; }
                .cell-objeto span { font-size: 11px; color: #94A3B8; }

                .mini-progress-cell {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    min-width: 80px;
                }

                .progress-text { font-size: 12px; font-weight: 800; color: #1E293B; }

                .mini-bar-bg {
                    width: 100%;
                    height: 4px;
                    background: #E2E8F0;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .mini-bar-fill { height: 100%; border-radius: 2px; }

                .status-dot-wrapper {
                    display: flex;
                    justify-content: center;
                }

                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    box-shadow: 0 0 0 3px #F1F5F9;
                }

                .empty-table-state {
                    padding: 40px;
                    text-align: center;
                    color: #94A3B8;
                }

                .create-project-modal {
                    max-width: 850px;
                    width: 95%;
                }

                .photo-modal-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid #F1F5F9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .photo-modal-header h3 {
                    margin: 0;
                    color: var(--color-rojo-primario);
                    font-size: 20px;
                }

                .create-form-content {
                    padding: 24px 32px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .form-group-compact input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #E2E8F0;
                    border-radius: 6px;
                    font-size: 14px;
                    background: white;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .form-group-compact input:focus {
                    border-color: var(--color-rojo-primario);
                    box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.1);
                }

                .beneficiarios-list::-webkit-scrollbar {
                    width: 6px;
                }
                .beneficiarios-list::-webkit-scrollbar-track {
                    background: #F1F5F9;
                }
                .beneficiarios-list::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 3px;
                }

                .close-modal {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748B;
                }
            `}</style>
        </div>
    )
}

export default BitacoraView

import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import {
    MapPin,
    DollarSign,
    Zap,
    Target
} from 'lucide-react'

import { ACTIVIDADES_CATALOGO } from '../../data/catalog'
import { calculateEVM, getEVMSummary } from '../../utils/evmUtils'

// Se utiliza el catálogo completo de 77 actividades
const ACTIVIDADES_CATALOGO_IDS = ACTIVIDADES_CATALOGO
    .filter(a => a.capitulo !== '13. AUI') // Excluimos AUI de las actividades reportables
    .map(a => a.id);

const TOTAL_BUDGET_PER_HOUSE = 95000000;

const PROJECT_CONFIGS = {
    '1': { nombre: 'Vitoncó', casas: 3 },
    '2': { nombre: 'Inzá Rural', casas: 5 }
};

const TOTAL_HOUSES_ALL = 8; // 3 + 5

const InspectorDashboard = () => {
    const [recentLogs, setRecentLogs] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        completedHouses: 0,
        totalHouses: TOTAL_HOUSES_ALL,
        avanceGlobal: 0,
        spi: 1.0,
        cpi: 1.0,
        ppc: 0
    });

    useEffect(() => {
        cargarDatos();

        // Suscripción en tiempo real para el Dashboard Macro
        const canal = supabase
            .channel('dashboard-macro')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'evidencias_obra' },
                () => cargarDatos()
            )
            .subscribe();

        return () => supabase.removeChannel(canal);
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('evidencias_obra')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setRegistros(data);
                setRecentLogs(data.slice(0, 5));
                procesarEstadisticas(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const procesarEstadisticas = (allData) => {
        const TOTAL_ACTIVIDADES_PER_HOUSE = ACTIVIDADES_CATALOGO_IDS.length; 

        // Agrupar por Proyecto + Vivienda
        const houseProgression = {}; // { 'key': { actividad_id: progreso } }
        let totalEV = 0;
        let totalAC = 0; // AC (Actual Cost) estimación basada en reportes
        let totalPV = 0; // PV (Planned Value) estimación simplificada

        allData.forEach(reg => {
            const pid = reg.proyecto_id || '1';
            const vnum = reg.vivienda_num;
            const key = `${pid}_${vnum}`;

            if (!houseProgression[key]) houseProgression[key] = {};

            // Lógica de progreso por actividad
            const currentActProg = houseProgression[key][reg.actividad_id] || 0;
            const reportProg = reg.progreso || 0;
            const newTotal = currentActProg + reportProg;
            houseProgression[key][reg.actividad_id] = newTotal > 100 ? 100 : newTotal;

            // Cálculo de Valor Ganado (EV)
            // EV = % Progreso * Valor Estimado de la actividad
            const catalogItem = ACTIVIDADES_CATALOGO.find(a => a.id === reg.actividad_id);
            if (catalogItem) {
                // Sumamos el valor ganado incremental de este reporte específico
                // Si el reporte ya está registrado, esto podría duplicar. 
                // En un sistema real, EV se calcula sobre el estado actual consolidado.
            }
        });

        // Consolidamos EV por estado final de cada casa
        let aggregateEV = 0;
        let activitiesCompletedOnTime = 0;
        let totalActivitiesPlanned = 0;

        Object.keys(houseProgression).forEach(houseKey => {
            Object.keys(houseProgression[houseKey]).forEach(actId => {
                const prog = houseProgression[houseKey][actId];
                const item = ACTIVIDADES_CATALOGO.find(a => a.id === actId);
                if (item) {
                    aggregateEV += (prog / 100) * (item.valor_estimado || 0);
                    if (prog === 100) activitiesCompletedOnTime++;
                }
                totalActivitiesPlanned++;
            });
        });

        // Estimación PV (Planned Value): % del tiempo transcurrido (Mock para demo)
        const totalProjectBudget = TOTAL_HOUSES_ALL * TOTAL_BUDGET_PER_HOUSE;
        const projectStartTime = new Array(...allData).pop()?.created_at || new Date();
        const daysPassed = (new Date() - new Date(projectStartTime)) / (1000 * 60 * 60 * 24);
        const estimatedProgressPlan = Math.min(100, (daysPassed / 120) * 100); // Asumimos 120 días de proyecto total
        const aggregatePV = (estimatedProgressPlan / 100) * totalProjectBudget || (totalProjectBudget * 0.1); 

        // Estimación AC (Actual Cost): EV + un pequeño margen de error/variación (Mock para demo)
        const aggregateAC = aggregateEV * 1.05; 

        const { spi, cpi, ppc } = calculateEVM(aggregateEV, aggregatePV, aggregateAC, activitiesCompletedOnTime, totalActivitiesPlanned || 1);

        // Casas terminadas
        const completedHousesCount = Object.keys(houseProgression).filter(key => {
            const activities = Object.values(houseProgression[key]);
            return activities.length >= TOTAL_ACTIVIDADES_PER_HOUSE && activities.every(p => p === 100);
        }).length;

        // Avance Macro
        let sumaProgresosMacro = 0;
        Object.keys(houseProgression).forEach(key => {
            const sumOfActProgs = Object.values(houseProgression[key]).reduce((a, b) => a + b, 0);
            sumaProgresosMacro += (sumOfActProgs / TOTAL_ACTIVIDADES_PER_HOUSE);
        });

        const avanceGlobal = Math.round(sumaProgresosMacro / TOTAL_HOUSES_ALL);

        setStats({
            completedHouses: completedHousesCount,
            totalHouses: TOTAL_HOUSES_ALL,
            avanceGlobal: avanceGlobal,
            spi: spi,
            cpi: cpi,
            ppc: ppc
        });
    };

    // Transformar registros para los charts
    const chartAvanceViviendas = ['01', '02', '03', '04', '05', '06'].map(vNum => {
        const acts = registros.filter(r => r.vivienda_num === vNum);

        // Sumar progresos únicos por actividad
        const uniqueProgs = {};
        acts.forEach(a => {
            if (!uniqueProgs[a.actividad_id] || a.progreso > uniqueProgs[a.actividad_id]) {
                uniqueProgs[a.actividad_id] = a.progreso || 0;
            }
        });

        const sumProgs = Object.values(uniqueProgs).reduce((a, b) => a + b, 0);
        const perc = Math.round(sumProgs / ACTIVIDADES_CATALOGO_IDS.length);

        return {
            name: `Casa ${vNum}`,
            avance: perc,
            planeado: 100
        };
    });
    const chartEstados = [
        { name: 'A tiempo', value: Object.values(stats || {}).completedHouses || 0, color: '#10B981' },
        { name: 'En riesgo', value: Object.keys(registros.reduce((acc, r) => ({ ...acc, [r.vivienda_num]: 1 }), {})).length - stats.completedHouses, color: '#F59E0B' },
        { name: 'Retrasado', value: stats.totalHouses - Object.keys(registros.reduce((acc, r) => ({ ...acc, [r.vivienda_num]: 1 }), {})).length, color: '#DC2626' },
    ];

    return (
        <div className="inspector-dashboard">
            <header className="dashboard-header-macro">
                <div className="title-section">
                    <h1>Panel de Supervisión Macro</h1>
                    <p>Monitoreo global de proyectos y cumplimiento de cronogramas</p>
                </div>
                <div className="macro-stats-evm">
                    <div className="macro-stat-card-evm" title="SPI > 1.0 indica adelanto en cronograma">
                        <Calendar size={20} color="#6B7280" />
                        <div className="macro-stat-info">
                            <span className="macro-label">SPI (Cronograma)</span>
                            <span className="macro-value" style={{ color: getEVMSummary(stats.spi, 1).color }}>
                                {stats.spi.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="macro-stat-card-evm" title="CPI > 1.0 indica ahorro en presupuesto">
                        <DollarSign size={20} color="#6B7280" />
                        <div className="macro-stat-info">
                            <span className="macro-label">CPI (Costos)</span>
                            <span className="macro-value" style={{ color: getEVMSummary(stats.cpi, 1).color }}>
                                {stats.cpi.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="macro-stat-card-evm" title="PPC > 80% indica alta confiabilidad de plan">
                        <Target size={20} color="#6B7280" />
                        <div className="macro-stat-info">
                            <span className="macro-label">PPC (Planificación)</span>
                            <span className="macro-value" style={{ color: getEVMSummary(stats.ppc, 80).color }}>
                                {stats.ppc}%
                            </span>
                        </div>
                    </div>
                    <div className="macro-stat-card-evm">
                        <Home size={20} color="#6B7280" />
                        <div className="macro-stat-info">
                            <span className="macro-label">Viviendas</span>
                            <span className="macro-value">{stats.completedHouses}/{stats.totalHouses}</span>
                        </div>
                    </div>
                </div>
            </header>

            {loading && registros.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
                    <p>Cargando datos en tiempo real...</p>
                </div>
            ) : (
                <>
                    <div className="charts-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Avance por Vivienda (%)</h3>
                                <p>Comparativa Ejecutado vs. Planeado (Realtime)</p>
                            </div>
                            <div className="chart-body" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartAvanceViviendas}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend verticalAlign="top" align="right" />
                                        <Bar dataKey="avance" name="Real" fill="#C0001D" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="planeado" name="Planeado" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Estado de Viviendas</h3>
                                <p>Cumplimiento de hitos por semáforo</p>
                            </div>
                            <div className="chart-body" style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartEstados}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartEstados.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="recent-alerts-section">
                        <h3>Actividad Reciente (Sincronización Móvil)</h3>
                        <div className="alerts-list">
                            {recentLogs.length > 0 ? recentLogs.map((log) => (
                                <div key={log.id} className="alert-item report-card" style={{ borderLeft: '4px solid #10B981' }}>
                                    <div className="alert-icon-bg success">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-title-row">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <strong>Reporte: Casa Unidad {log.vivienda_num}</strong>
                                                <span style={{ fontSize: '11px', background: log.progreso === 100 ? '#ECFDF5' : '#FEF3C7', color: log.progreso === 100 ? '#059669' : '#D97706', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                                                    {log.progreso}%
                                                </span>
                                                {log.latitud && <MapPin size={14} color="var(--color-rojo-primario)" title="Tiene ubicación GPS" />}
                                            </div>
                                            <span className="timestamp">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        <p style={{ marginBottom: '8px' }}>Actividad reportada: <strong>{log.actividad_nombre}</strong></p>
                                        {log.comentario && (
                                            <div style={{ padding: '8px 12px', background: '#F1F5F9', borderRadius: '6px', fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
                                                " {log.comentario} " - Ing. Residente
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="report-card" style={{ justifyContent: 'center', color: '#64748B' }}>
                                    No hay actividad reciente registrada.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .inspector-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .dashboard-header-macro {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .title-section h1 { margin: 0; font-size: 28px; color: var(--color-gris-oscuro); }
                .title-section p { margin: 4px 0 0; color: var(--color-gris-medio); }

                .macro-stats-evm {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    flex: 1;
                    margin-left: 40px;
                }
                .macro-stat-card-evm {
                    background: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid #E5E7EB;
                    transition: transform 0.2s;
                }
                .macro-stat-card-evm:hover { transform: translateY(-3px); }
                .macro-stat-info { display: flex; flex-direction: column; }
                .macro-label { font-size: 11px; font-weight: 600; color: var(--color-gris-medio); text-transform: uppercase; }
                .macro-value { font-size: 18px; font-weight: 800; color: var(--color-gris-oscuro); }

                .charts-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 24px;
                }
                .chart-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid #E5E7EB;
                }
                .chart-header { margin-bottom: 24px; }
                .chart-header h3 { margin: 0; font-size: 18px; color: var(--color-gris-oscuro); }
                .chart-header p { margin: 4px 0 0; font-size: 13px; color: var(--color-gris-medio); }

                .recent-alerts-section h3 { margin: 0 0 20px; font-size: 18px; color: var(--color-gris-oscuro); }
                .alerts-list { display: flex; flex-direction: column; gap: 12px; }
                .report-card {
                    background: white;
                    padding: 16px 20px;
                    border-radius: 10px;
                    border: 1px solid #E5E7EB;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.2s;
                }
                .report-card:hover { border-color: var(--color-rojo-claro); transform: translateX(5px); }
                
                .alert-icon-bg {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .alert-icon-bg.warning { background: #FFFBEB; color: #D97706; }
                .alert-icon-bg.success { background: #ECFDF5; color: #059669; }

                .alert-content { flex: 1; }
                .alert-title-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .alert-title-row strong { font-size: 14px; }
                .timestamp { font-size: 11px; color: var(--color-gris-medio); }
                .alert-content p { margin: 0; font-size: 13px; color: var(--color-gris-medio); }

                .btn-text {
                    background: none;
                    border: none;
                    color: var(--color-rojo-primario);
                    font-weight: 600;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    )
}

export default InspectorDashboard

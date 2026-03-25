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
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Home,
    Users,
    Activity,
    Calendar,
    ArrowUpRight,
    MapPin
} from 'lucide-react'

// Reutilizamos el catálogo de actividades para calcular porcentajes (23 actividades)
const ACTIVIDADES_CATALOGO_IDS = [
    '55615705-5c1a-4286-990a-6e5a6a6a6a6a', '55615705-5c1a-4286-990a-6e5a6a6a6a6b', '55615705-5c1a-4286-990a-6e5a6a6a6a6c', '55615705-5c1a-4286-990a-6e5a6a6a6a6d',
    '55615705-5c1a-4286-990a-6e5a6a6a6a6e', '55615705-5c1a-4286-990a-6e5a6a6a6a6f', '55615705-5c1a-4286-990a-6e5a6a6a6a60', '55615705-5c1a-4286-990a-6e5a6a6a6a61',
    '55615705-5c1a-4286-990a-6e5a6a6a6a62', '55615705-5c1a-4286-990a-6e5a6a6a6a63', '55615705-5c1a-4286-990a-6e5a6a6a6a64', '55615705-5c1a-4286-990a-6e5a6a6a6a65',
    '55615705-5c1a-4286-990a-6e5a6a6a6a66', '55615705-5c1a-4286-990a-6e5a6a6a6a67', '55615705-5c1a-4286-990a-6e5a6a6a6a68', '55615705-5c1a-4286-990a-6e5a6a6a6a69',
    '55615705-5c1a-4286-990a-6e5a6a6a6b6a', '55615705-5c1a-4286-990a-6e5a6a6a6b6b', '55615705-5c1a-4286-990a-6e5a6a6a6b6c', '55615705-5c1a-4286-990a-6e5a6a6a6b6d',
    '55615705-5c1a-4286-990a-6e5a6a6a6b6e', '55615705-5c1a-4286-990a-6e5a6a6a6b6f', '55615705-5c1a-4286-990a-6e5a6a6a6b70'
];

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
        alertas: 0
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
        const TOTAL_ACTIVIDADES_PER_HOUSE = ACTIVIDADES_CATALOGO_IDS.length; // 23

        // Agrupar por Proyecto + Vivienda
        const houseProgression = {}; // { 'key': { actividad_id: progreso } }

        allData.forEach(reg => {
            const pid = reg.proyecto_id || '1';
            const vnum = reg.vivienda_num;
            const key = `${pid}_${vnum}`;

            if (!houseProgression[key]) {
                houseProgression[key] = {};
            }

            // Lógica ADITIVA: sumamos los progresos de cada reporte para esta actividad
            const currentActProg = houseProgression[key][reg.actividad_id] || 0;
            const newTotal = currentActProg + (reg.progreso || 0);

            // Capar a 100% por actividad
            houseProgression[key][reg.actividad_id] = newTotal > 100 ? 100 : newTotal;
        });

        // Casas terminadas: Todas sus actividades al 100%
        const completedHousesCount = Object.keys(houseProgression).filter(key => {
            const activities = Object.values(houseProgression[key]);
            return activities.length === TOTAL_ACTIVIDADES_PER_HOUSE && activities.every(p => p === 100);
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
            alertas: TOTAL_HOUSES_ALL - Object.keys(houseProgression).length
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
                <div className="macro-stats">
                    <div className="macro-stat-card">
                        <Activity size={24} color="#C0001D" />
                        <div className="macro-stat-info">
                            <span className="macro-value">{stats.avanceGlobal}%</span>
                            <span className="macro-label">Avance Global</span>
                        </div>
                    </div>
                    <div className="macro-stat-card">
                        <Home size={24} color="#10B981" />
                        <div className="macro-stat-info">
                            <span className="macro-value">{stats.completedHouses}/{stats.totalHouses}</span>
                            <span className="macro-label">Casas Terminadas</span>
                        </div>
                    </div>
                    <div className="macro-stat-card">
                        <AlertCircle size={24} color="#F59E0B" />
                        <div className="macro-stat-info">
                            <span className="macro-value">{stats.alertas}</span>
                            <span className="macro-label">Alertas de Retraso</span>
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

                .macro-stats { display: flex; gap: 20px; }
                .macro-stat-card {
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    min-width: 180px;
                    border: 1px solid #E5E7EB;
                }
                .macro-stat-info { display: flex; flex-direction: column; }
                .macro-value { font-size: 20px; font-weight: 800; color: var(--color-gris-oscuro); }
                .macro-label { font-size: 12px; color: var(--color-gris-medio); font-weight: 500; }

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

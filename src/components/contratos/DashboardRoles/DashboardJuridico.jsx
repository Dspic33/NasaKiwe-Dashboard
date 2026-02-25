import React, { useState } from 'react'
import { FileText, Search, Filter, Eye, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { ESTADOS_CONTRATACION, ESTADOS_LABELS } from '../../../data/contratosMock'
import '../Contratos.css'

const DashboardJuridico = ({ contratos, currentUser, onOpenContrato }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('pendientes') // 'pendientes' | 'historial'

    // Pendientes de revisión (EN_REVISION_JURIDICA)
    const contratosPendientes = contratos.filter(c => c.estado === ESTADOS_CONTRATACION.EN_REVISION_JURIDICA)

    // Historial (los que pasaron por sus manos o ya están más adelante)
    const contratosHistorial = contratos.filter(c =>
        c.estado !== ESTADOS_CONTRATACION.BORRADOR &&
        c.estado !== ESTADOS_CONTRATACION.EN_REVISION_JURIDICA &&
        (c.historial_cambios || []).some(h => h.usuario === 'juridico')
    )

    const listToDisplay = activeTab === 'pendientes' ? contratosPendientes : contratosHistorial

    const filteredContratos = listToDisplay.filter(c =>
        c.numero_proceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descripcion_objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre_creador?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusStyle = (estado) => {
        switch (estado) {
            case ESTADOS_CONTRATACION.EN_REVISION_JURIDICA: return 'status-review'
            case ESTADOS_CONTRATACION.APROBADO:
            case ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS:
            case ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA: return 'status-approved'
            case ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES: return 'status-returned'
            default: return 'status-default'
        }
    }

    return (
        <div className="dashboard-juridico fade-in">
            <div className="page-header">
                <div>
                    <h1>Bandeja de Revisión Jurídica</h1>
                    <p>Revisa los procesos de contratación enviados por los Asesores.</p>
                </div>
            </div>

            <div className="kpi-cards-container">
                <div className="kpi-card">
                    <div className="kpi-card-icon warning"><Clock size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Pendientes de Revisión</h3>
                        <p className="kpi-value text-warning">{contratosPendientes.length}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon success"><CheckSquare size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Revisados (Aprobados)</h3>
                        <p className="kpi-value text-success">
                            {contratosHistorial.filter(c =>
                                c.estado === ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA ||
                                c.estado === ESTADOS_CONTRATACION.APROBADO ||
                                c.estado === ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS
                            ).length}
                        </p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon"><AlertCircle size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Devueltos a Asesores</h3>
                        <p className="kpi-value">
                            {contratosHistorial.filter(c => c.estado === ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="filters-bar institutional-card">
                <div className="tabs-wrapper">
                    <button
                        className={`tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pendientes')}
                    >
                        Procesos para Revisar ({contratosPendientes.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        Historial de Revisiones
                    </button>
                </div>

                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por proceso, autor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="contratos-table-container institutional-card">
                <table className="institutional-table">
                    <thead>
                        <tr>
                            <th>{activeTab === 'pendientes' ? 'Alerta' : 'Estado'}</th>
                            <th>No. Proceso</th>
                            <th>Asesor Origen</th>
                            <th>Objeto (Resumen)</th>
                            <th>Llegada a Bandeja</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContratos.map(contrato => (
                            <tr key={contrato.id}>
                                <td>
                                    {activeTab === 'pendientes' ? (
                                        <span className={`time-badge ${contrato.dias_en_etapa >= 2 ? 'critical' : 'warning'}`}>
                                            <Clock size={12} /> {contrato.dias_en_etapa} días
                                        </span>
                                    ) : (
                                        <span className={`status-badge-modern ${getStatusStyle(contrato.estado)}`}>
                                            {ESTADOS_LABELS[contrato.estado]}
                                        </span>
                                    )}
                                </td>
                                <td><strong>{contrato.numero_proceso}</strong></td>
                                <td>
                                    <div className="user-info-td">
                                        <span className="user-name">{contrato.nombre_creador || 'Asesor'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-truncate" title={contrato.descripcion_objeto}>
                                        {contrato.descripcion_objeto.substring(0, 50)}...
                                    </span>
                                </td>
                                <td>{new Date(contrato.ultima_actualizacion).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    {activeTab === 'pendientes' ? (
                                        <button className="btn-primary small" onClick={() => onOpenContrato(contrato)}>
                                            <CheckSquare size={14} /> Revisar
                                        </button>
                                    ) : (
                                        <button className="action-btn icon-only" title="Ver Detalle" onClick={() => onOpenContrato(contrato)}>
                                            <Eye size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredContratos.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state-row">
                                    <CheckSquare size={48} className="empty-icon text-success" />
                                    <p>{activeTab === 'pendientes' ? '¡Excelente! No tienes procesos pendientes por revisar.' : 'No hay historial para mostrar.'}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DashboardJuridico

import React, { useState } from 'react'
import { FileText, Search, CheckSquare, Clock, ShieldCheck, AlertCircle, FileCheck } from 'lucide-react'
import { ESTADOS_CONTRATACION, ESTADOS_LABELS } from '../../../data/contratosMock'
import '../Contratos.css'

const DashboardDirectora = ({ contratos, currentUser, onOpenContrato }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('pendientes') // 'pendientes' | 'aprobados'

    const contratosDirectora = contratos.filter(c => c.estado === ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA)
    const contratosAprobados = contratos.filter(c =>
        c.estado === ESTADOS_CONTRATACION.APROBADO ||
        c.estado === ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS
    )

    // Todas las devoluciones (no importa si de juridico o directora) para la metrica
    const contratosDevueltos = contratos.filter(c =>
        c.estado === ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES ||
        c.estado === ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA
    )

    const listToDisplay = activeTab === 'pendientes' ? contratosDirectora : contratosAprobados

    const filteredContratos = listToDisplay.filter(c =>
        c.numero_proceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descripcion_objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre_creador?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="dashboard-directora fade-in">
            <div className="page-header">
                <div>
                    <h1>Aprobación Final de Contratos</h1>
                    <p>Revisa y aprueba los procesos que ya tienen viabilidad jurídica.</p>
                </div>
            </div>

            <div className="kpi-cards-container">
                <div className="kpi-card focus">
                    <div className="kpi-card-icon"><ShieldCheck size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Requieren su Firma</h3>
                        <p className="kpi-value text-primary">{contratosDirectora.length}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon success"><FileCheck size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Aprobados (Mes actual)</h3>
                        <p className="kpi-value text-success">{contratosAprobados.length}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon warning"><AlertCircle size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Devueltos Globales</h3>
                        <p className="kpi-value text-warning">{contratosDevueltos.length}</p>
                    </div>
                </div>
            </div>

            <div className="filters-bar institutional-card">
                <div className="tabs-wrapper">
                    <button
                        className={`tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pendientes')}
                    >
                        Pendientes de Aprobación ({contratosDirectora.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'aprobados' ? 'active' : ''}`}
                        onClick={() => setActiveTab('aprobados')}
                    >
                        Aprobados
                    </button>
                </div>

                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar contratos..."
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
                            <th>Resumen Ejecutivo (Objeto)</th>
                            <th>Valor Total</th>
                            <th>Asesor Origen</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContratos.map(contrato => (
                            <tr key={contrato.id}>
                                <td>
                                    {activeTab === 'pendientes' ? (
                                        <span className="time-badge warning">
                                            <Clock size={12} /> {contrato.dias_en_etapa} días
                                        </span>
                                    ) : (
                                        <span className="status-badge-modern status-approved">
                                            {ESTADOS_LABELS[contrato.estado]}
                                        </span>
                                    )}
                                </td>
                                <td><strong>{contrato.numero_proceso}</strong></td>
                                <td>
                                    <span className="text-truncate" title={contrato.descripcion_objeto} style={{ maxWidth: '250px' }}>
                                        {contrato.descripcion_objeto.substring(0, 60)}...
                                    </span>
                                </td>
                                <td>
                                    <strong>${contrato.valor_estimado.toLocaleString()}</strong>
                                </td>
                                <td>
                                    <div className="user-info-td">
                                        <span className="user-name">{contrato.nombre_creador || 'Asesor'}</span>
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    {activeTab === 'pendientes' ? (
                                        <button className="btn-primary small" onClick={() => onOpenContrato(contrato)}>
                                            <ShieldCheck size={14} /> Revisar y Aprobar
                                        </button>
                                    ) : (
                                        <button className="btn-success small" onClick={() => onOpenContrato(contrato)}>
                                            <FileText size={14} /> Ver Proceso
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredContratos.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state-row">
                                    <ShieldCheck size={48} className="empty-icon text-success" />
                                    <p>{activeTab === 'pendientes' ? 'No hay procesos pendientes de aprobación.' : 'No hay contratos aprobados para mostrar.'}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DashboardDirectora

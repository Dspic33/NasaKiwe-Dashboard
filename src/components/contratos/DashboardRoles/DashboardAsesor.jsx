import React, { useState } from 'react'
import { FileText, Plus, Search, Filter, Eye, Edit2, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { ESTADOS_CONTRATACION, ESTADOS_LABELS } from '../../../data/contratosMock'
import '../Contratos.css'

const DashboardAsesor = ({ contratos, currentUser, onStartWizard, onOpenContrato }) => {
    const [searchTerm, setSearchTerm] = useState('')

    // Filtrar solo los contratos creados por este asesor
    const misContratos = contratos.filter(c => c.creado_por === currentUser.id)

    const filteredContratos = misContratos.filter(c =>
        c.numero_proceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descripcion_objeto.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusStyle = (estado) => {
        switch (estado) {
            case ESTADOS_CONTRATACION.BORRADOR: return 'status-draft'
            case ESTADOS_CONTRATACION.EN_REVISION_JURIDICA:
            case ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA: return 'status-review'
            case ESTADOS_CONTRATACION.APROBADO:
            case ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS: return 'status-approved'
            case ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES:
            case ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA: return 'status-returned'
            default: return 'status-default'
        }
    }

    const getStatusIcon = (estado) => {
        switch (estado) {
            case ESTADOS_CONTRATACION.BORRADOR: return <Edit2 size={16} />
            case ESTADOS_CONTRATACION.EN_REVISION_JURIDICA:
            case ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA: return <Clock size={16} />
            case ESTADOS_CONTRATACION.APROBADO:
            case ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS: return <CheckCircle size={16} />
            case ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES:
            case ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA: return <AlertCircle size={16} />
            default: return <FileText size={16} />
        }
    }

    const renderActionButtons = (contrato) => {
        if (contrato.estado === ESTADOS_CONTRATACION.BORRADOR) {
            return (
                <button className="btn-secondary small" onClick={() => onOpenContrato(contrato)}>
                    <Edit2 size={14} /> Continuar
                </button>
            )
        }
        if (contrato.estado === ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES || contrato.estado === ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA) {
            return (
                <button className="btn-warning small" onClick={() => onOpenContrato(contrato)}>
                    <AlertCircle size={14} /> Corregir
                </button>
            )
        }
        if (contrato.estado === ESTADOS_CONTRATACION.APROBADO || contrato.estado === ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS) {
            return (
                <button className="btn-success small" onClick={() => onOpenContrato(contrato)}>
                    <FileText size={14} /> Ver Docs
                </button>
            )
        }
        return (
            <button className="action-btn icon-only" title="Ver Detalle" onClick={() => onOpenContrato(contrato)}>
                <Eye size={18} />
            </button>
        )
    }

    return (
        <div className="dashboard-asesor fade-in">
            <div className="page-header">
                <div>
                    <h1>Mis Procesos de Contratación</h1>
                    <p>Gestiona y haz seguimiento a los procesos que has iniciado.</p>
                </div>
                <button className="btn-primary" onClick={onStartWizard}>
                    <Plus size={20} />
                    <span>Nuevo Proceso</span>
                </button>
            </div>

            <div className="kpi-cards-container">
                <div className="kpi-card">
                    <div className="kpi-card-icon"><FileText size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Total Creados</h3>
                        <p className="kpi-value">{misContratos.length}</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon warning"><AlertCircle size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Devueltos / Por Corregir</h3>
                        <p className="kpi-value text-warning">
                            {misContratos.filter(c => c.estado === ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES || c.estado === ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA).length}
                        </p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon success"><CheckCircle size={24} /></div>
                    <div className="kpi-card-content">
                        <h3>Aprobados</h3>
                        <p className="kpi-value text-success">
                            {misContratos.filter(c => c.estado === ESTADOS_CONTRATACION.APROBADO || c.estado === ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="filters-bar institutional-card">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar en mis procesos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-secondary">
                    <Filter size={20} />
                    <span>Filtros</span>
                </button>
            </div>

            <div className="contratos-table-container institutional-card">
                <table className="institutional-table">
                    <thead>
                        <tr>
                            <th>No. Proceso</th>
                            <th>Fecha</th>
                            <th>Objeto (Resumen)</th>
                            <th>Estado Actual</th>
                            <th>Tiempo en Etapa</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContratos.map(contrato => (
                            <tr key={contrato.id}>
                                <td><strong>{contrato.numero_proceso}</strong></td>
                                <td>{new Date(contrato.fecha).toLocaleDateString()}</td>
                                <td>
                                    <span className="text-truncate" title={contrato.descripcion_objeto}>
                                        {contrato.descripcion_objeto.substring(0, 50)}...
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge-modern ${getStatusStyle(contrato.estado)}`}>
                                        {getStatusIcon(contrato.estado)}
                                        {ESTADOS_LABELS[contrato.estado]}
                                    </span>
                                </td>
                                <td>
                                    {contrato.dias_en_etapa > 0 ? (
                                        <span className={`time-badge ${contrato.dias_en_etapa >= 3 ? 'critical' : 'normal'}`}>
                                            <Clock size={12} /> {contrato.dias_en_etapa} días
                                        </span>
                                    ) : (
                                        <span className="time-badge recent">Hoy</span>
                                    )}
                                </td>
                                <td className="actions-cell">
                                    {renderActionButtons(contrato)}
                                </td>
                            </tr>
                        ))}
                        {filteredContratos.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state-row">
                                    <FileText size={48} className="empty-icon" />
                                    <p>No tienes procesos de contratación que coincidan.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DashboardAsesor

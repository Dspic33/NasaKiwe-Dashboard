import React from 'react'
import { CheckCircle, Edit2, AlertCircle, Clock, FileText, Send } from 'lucide-react'
import './Seguimiento.css'

const ActionIcon = ({ accion }) => {
    const text = accion.toLowerCase()
    if (text.includes('creación') || text.includes('borrador') || text.includes('corrigió')) {
        return <Edit2 size={16} className="text-primary" />
    }
    if (text.includes('enviado') || text.includes('reenvió')) {
        return <Send size={16} className="text-secondary" />
    }
    if (text.includes('devuelto') || text.includes('observación')) {
        return <AlertCircle size={16} className="text-warning" />
    }
    if (text.includes('aprobado') || text.includes('aprobó')) {
        return <CheckCircle size={16} className="text-success" />
    }
    if (text.includes('documentos')) {
        return <FileText size={16} className="text-primary" />
    }
    return <Clock size={16} className="text-muted" />
}

const ActivityFeed = ({ historial = [] }) => {
    if (!historial || historial.length === 0) {
        return (
            <div className="activity-feed empty">
                <p>No hay registro de actividades.</p>
            </div>
        )
    }

    return (
        <div className="activity-feed institutional-card">
            <h3 className="feed-title">Historial de Actividad</h3>
            <div className="timeline-container">
                {historial.map((item, index) => {
                    const dateObj = new Date(item.fecha)
                    const dateStr = dateObj.toLocaleDateString()
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                    return (
                        <div key={index} className="timeline-item fade-in">
                            <div className="timeline-icon">
                                <ActionIcon accion={item.accion} />
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className="timeline-date">{dateStr} {timeStr}</span>
                                </div>
                                <p className="timeline-action"><strong>{item.nombre || item.usuario}</strong> {item.accion}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ActivityFeed

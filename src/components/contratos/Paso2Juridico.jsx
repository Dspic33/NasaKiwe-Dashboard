import React, { useState } from 'react'
import { Check, X, MessageSquare, ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, FileText, ExternalLink } from 'lucide-react'

const Paso2Juridico = ({ formData, onApprove, onReject, onBack, isReadOnly }) => {
    const [verificaciones, setVerificaciones] = useState({
        datos_generales: null, // null = no verificado, true = ok, false = requiere corrección
        objeto: null,
        valor: null,
        materiales: null
    })

    const [observacion, setObservacion] = useState('')

    const handleVerify = (section, isOk) => {
        setVerificaciones(prev => ({ ...prev, [section]: isOk }))
    }

    const allVerifiedOk = Object.values(verificaciones).every(val => val === true)
    const hasRejections = Object.values(verificaciones).some(val => val === false)

    // Obtener el URL del documento generado por el asesor
    const docUrl = formData.documentos_oficiales_urls?.estudio || null
    const getEmbedUrl = (url) => {
        if (!url) return null
        // Convertir URL de edición a URL de preview embebido
        return url.replace('/edit', '/preview')
    }

    const FieldDisplay = ({ label, value }) => (
        <div className="readonly-field">
            <span className="field-label">{label}</span>
            <div className="field-value">{value || <span className="empty-val">No especificado</span>}</div>
        </div>
    )

    const ReviewSection = ({ title, sectionKey, children }) => (
        <div className={`review-section ${verificaciones[sectionKey] === true ? 'verified-ok' : verificaciones[sectionKey] === false ? 'verified-error' : ''}`}>
            <div className="review-section-header">
                <h3>{title}</h3>
                <div className="review-actions">
                    <button
                        className={`verify-btn ok ${verificaciones[sectionKey] === true ? 'active' : ''}`}
                        onClick={() => handleVerify(sectionKey, true)}
                        disabled={isReadOnly}
                    >
                        <Check size={16} /> Conforme
                    </button>
                    <button
                        className={`verify-btn error ${verificaciones[sectionKey] === false ? 'active' : ''}`}
                        onClick={() => handleVerify(sectionKey, false)}
                        disabled={isReadOnly}
                    >
                        <X size={16} /> Requiere Corrección
                    </button>
                </div>
            </div>
            <div className="review-section-content">
                {children}
            </div>
        </div>
    )

    return (
        <div className="paso-container juridico-view fade-in">
            <div className="juridico-header">
                <div>
                    <h2 className="section-title">Revisión Jurídica y de Conformidad</h2>
                    <p className="section-subtitle">Validación del Estudio de Conveniencia y Oportunidad</p>
                </div>
                <div className="role-badge juridico-badge">
                    <ShieldCheck size={18} /> Perfil Jurídico
                </div>
            </div>

            {/* Documento Generado por el Asesor */}
            <div className="institutional-card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} color="#2D5F3E" />
                        Documento de Conveniencia — Generado por Asesor
                    </h3>
                    {docUrl && (
                        <a href={docUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-secondary small" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ExternalLink size={14} /> Abrir en Google Docs
                        </a>
                    )}
                </div>
                {docUrl ? (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fafafa' }}>
                        <iframe
                            src={getEmbedUrl(docUrl)}
                            title="Documento de Conveniencia"
                            style={{ width: '100%', height: '500px', border: 'none' }}
                        />
                    </div>
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                        <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontSize: '15px' }}>
                            El asesor no generó documento en Google Docs para este proceso.<br />
                            <span style={{ fontSize: '13px' }}>Revise los datos del formulario a continuación.</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="review-layout">
                <div className="review-main-content">
                    <ReviewSection title="1. Datos Generales del Proceso" sectionKey="datos_generales">
                        <div className="readonly-grid">
                            <FieldDisplay label="Fecha de Elaboración" value={formData.fecha} />
                            <FieldDisplay label="Número de Proceso" value={formData.numero_proceso} />
                            <FieldDisplay label="Lugar de Ejecución" value={formData.lugar_ejecucion} />
                        </div>
                    </ReviewSection>

                    <ReviewSection title="2. Objeto a Contratar" sectionKey="objeto">
                        <FieldDisplay label="Descripción Detallada" value={formData.descripcion_objeto} />
                    </ReviewSection>

                    <ReviewSection title="3. Valor Estimado" sectionKey="valor">
                        <FieldDisplay
                            label="Monto Estipulado"
                            value={formData.valor_estimado ? `$${Number(formData.valor_estimado).toLocaleString()} COP` : ''}
                        />
                    </ReviewSection>

                    <ReviewSection title="4. Soportes y Materiales" sectionKey="materiales">
                        <div className="table-responsive">
                            <table className="institutional-table readonly-table">
                                <thead>
                                    <tr>
                                        <th>Ítem</th>
                                        <th>Descripción</th>
                                        <th>Unidad</th>
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(formData.materiales || []).map(mat => (
                                        <tr key={mat.id}>
                                            <td>{mat.item}</td>
                                            <td>{mat.descripcion}</td>
                                            <td>{mat.unidad}</td>
                                            <td><strong>{mat.cantidad}</strong></td>
                                        </tr>
                                    ))}
                                    {(!formData.materiales || formData.materiales.length === 0) && (
                                        <tr><td colSpan="4">No se adjuntaron materiales a este proceso.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ReviewSection>
                </div>

                <div className="review-sidebar">
                    <div className="institutional-card sidebar-panel">
                        <h3>Dictamen de Revisión</h3>

                        <div className="dictamen-status">
                            {allVerifiedOk && (
                                <div className="status-alert success">
                                    <Check size={20} />
                                    <span>Todas las secciones conformes. Listo para aprobación final.</span>
                                </div>
                            )}
                            {hasRejections && (
                                <div className="status-alert error">
                                    <AlertCircle size={20} />
                                    <span>Se encontraron no conformidades. Por favor agregue observaciones y devuelva al asesor.</span>
                                </div>
                            )}
                            {!allVerifiedOk && !hasRejections && (
                                <div className="status-alert pending">
                                    <ShieldCheck size={20} />
                                    <span>Por favor verifique todas las secciones para habilitar acciones.</span>
                                </div>
                            )}
                        </div>

                        <div className="observaciones-box">
                            <label><MessageSquare size={16} /> Observaciones Generales</label>
                            <textarea
                                rows="4"
                                placeholder="Escriba aquí los comentarios, ajustes normativos o correcciones solicitadas al asesor..."
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        {!isReadOnly && (
                            <div className="sidebar-actions">
                                <button
                                    className="btn-secondary full-width action-reject"
                                    disabled={!hasRejections || !observacion.trim()}
                                    onClick={() => onReject(observacion)}
                                >
                                    <X size={18} />
                                    Devolver al Asesor
                                </button>
                                <button
                                    className="btn-primary full-width action-approve"
                                    disabled={!allVerifiedOk}
                                    onClick={() => onApprove(observacion)}
                                >
                                    <Check size={18} />
                                    Aprobar a Directora
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="wizard-actions-footer">
                <button type="button" className="btn-secondary" onClick={onBack}>
                    <ArrowLeft size={18} /> Volver al Dashboard
                </button>
            </div>
        </div>
    )
}

export default Paso2Juridico

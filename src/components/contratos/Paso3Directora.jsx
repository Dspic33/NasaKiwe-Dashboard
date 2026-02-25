import React, { useState } from 'react'
import { Check, X, Building, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'

const Paso3Directora = ({ formData, onApprove, onReject, onBack, isReadOnly }) => {
    const [observacionFinal, setObservacionFinal] = useState('')
    const [pinFirma, setPinFirma] = useState('')

    const FieldDisplay = ({ label, value }) => (
        <div className="readonly-field">
            <span className="field-label">{label}</span>
            <div className="field-value">{value || <span className="empty-val">No especificado</span>}</div>
        </div>
    )

    return (
        <div className="paso-container directora-view fade-in">
            <div className="juridico-header">
                <div>
                    <h2 className="section-title">Aprobación Final de la Dirección</h2>
                    <p className="section-subtitle">Revisión consolidada y autorización para firma de formatos</p>
                </div>
                <div className="role-badge directora-badge">
                    <Building size={18} /> Perfil Directora
                </div>
            </div>

            <div className="review-layout">
                <div className="review-main-content">
                    {/* Resumen del Contrato */}
                    <div className="review-section">
                        <div className="review-section-header">
                            <h3>Resumen Ejecutivo del Proceso</h3>
                        </div>
                        <div className="review-section-content">
                            <div className="readonly-grid" style={{ marginBottom: '24px' }}>
                                <FieldDisplay label="Fecha" value={formData.fecha} />
                                <FieldDisplay label="Número de Proceso" value={formData.numero_proceso} />
                                <FieldDisplay
                                    label="Valor Estimado"
                                    value={formData.valor_estimado ? `$${Number(formData.valor_estimado).toLocaleString()} COP` : ''}
                                />
                                <FieldDisplay label="Lugar" value={formData.lugar_ejecucion} />
                            </div>
                            <FieldDisplay label="Objeto del Contrato" value={formData.descripcion_objeto} />
                        </div>
                    </div>

                    {/* Visto Bueno Jurídico */}
                    <div className="review-section verified-ok">
                        <div className="review-section-header" style={{ background: '#ECFDF5' }}>
                            <h3 style={{ color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={18} /> Visto Bueno Jurídico
                            </h3>
                        </div>
                        <div className="review-section-content">
                            <p style={{ margin: 0, color: 'var(--color-gris-oscuro)', fontSize: '14px', fontStyle: 'italic' }}>
                                "Revisión técnica y jurídica completada satisfactoriamente. El estudio de conveniencia cumple con la normatividad vigente y los formatos estándar."
                            </p>
                            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-gris-medio)' }}>
                                Aprobado por: Oficina Jurídica - 21 Feb 2026, 10:45 AM
                            </div>
                        </div>
                    </div>
                </div>

                <div className="review-sidebar">
                    <div className="institutional-card sidebar-panel">
                        <h3>Acción Final</h3>

                        <div className="observaciones-box">
                            <label>Observaciones o Directrices (Opcional)</label>
                            <textarea
                                rows="3"
                                placeholder="Notas adicionales para el expediente..."
                                value={observacionFinal}
                                onChange={(e) => setObservacionFinal(e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>

                        <div className="firma-box">
                            <label>PIN de Firma Digital</label>
                            <input
                                type="password"
                                placeholder="****"
                                className="pin-input"
                                value={pinFirma}
                                onChange={(e) => setPinFirma(e.target.value)}
                                maxLength={4}
                                disabled={isReadOnly}
                            />
                            <small>Ingrese su PIN de 4 dígitos para autorizar electrónicamente.</small>
                        </div>

                        {!isReadOnly && (
                            <div className="sidebar-actions" style={{ marginTop: '24px' }}>
                                <button
                                    className="btn-primary full-width action-approve"
                                    disabled={pinFirma.length < 4}
                                    onClick={() => onApprove(observacionFinal)}
                                >
                                    <Check size={18} />
                                    Aprobar y Generar Documentos
                                </button>
                                <button
                                    className="btn-secondary full-width action-reject"
                                    onClick={() => onReject(observacionFinal)}
                                    disabled={!observacionFinal.trim()}
                                >
                                    <X size={18} />
                                    Devolver al Asesor
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

export default Paso3Directora

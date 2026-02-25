import React, { useState } from 'react'
import { FileDown, CheckCircle, ArrowRight, RefreshCw, ExternalLink, Download, FolderOpen, FileText, File, ClipboardList } from 'lucide-react'
import { googleService } from '../../services/GoogleIntegrationService'

// Archivos entregables al contratista — configurables desde Google Drive
const ENTREGABLES_CONTRATISTA = [
    {
        id: 'minuta',
        titulo: 'Minuta del Contrato',
        descripcion: 'Documento legal con las cláusulas y condiciones del contrato.',
        icon: FileText,
        tipo: 'doc'
    },
    {
        id: 'cdp',
        titulo: 'Certificado de Disponibilidad Presupuestal (CDP)',
        descripcion: 'Documento que certifica la disponibilidad de recursos.',
        icon: ClipboardList,
        tipo: 'pdf'
    },
    {
        id: 'acta_inicio',
        titulo: 'Acta de Inicio',
        descripcion: 'Documento oficial de inicio del contrato con fecha y responsables.',
        icon: File,
        tipo: 'doc'
    },
    {
        id: 'polizas',
        titulo: 'Formato de Pólizas',
        descripcion: 'Formatos de garantías y pólizas requeridas al contratista.',
        icon: FileDown,
        tipo: 'pdf'
    }
]

const DocumentosContratacion = ({ formData, onFinish }) => {
    const [docsGenerados, setDocsGenerados] = useState({
        estudio: formData.documentos_oficiales_urls?.estudio || null,
        minuta: formData.documentos_oficiales_urls?.minuta || null,
        cdp: formData.documentos_oficiales_urls?.cdp || null,
        actaInicio: formData.documentos_oficiales_urls?.actaInicio || null,
    })

    const [isGenerating, setIsGenerating] = useState(false)
    const [googleError, setGoogleError] = useState(null)

    // Construir la lista de entregables con las URLs reales si existen
    const entregablesConUrls = ENTREGABLES_CONTRATISTA.map(e => {
        let url = null
        if (e.id === 'minuta') url = docsGenerados.minuta
        else if (e.id === 'cdp') url = docsGenerados.cdp
        else if (e.id === 'acta_inicio') url = docsGenerados.actaInicio
        return { ...e, url }
    })

    const handleGenerarLoteGoogle = async () => {
        setIsGenerating(true)
        setGoogleError(null)
        try {
            const token = localStorage.getItem('real_google_access_token');
            if (token) {
                googleService.isConnected = true;
            }

            const response = await googleService.generateDocsFromTemplates(formData)
            if (response.success) {
                setDocsGenerados({
                    estudio: response.documents[0].url,
                    minuta: response.documents[2]?.url || null,
                    cdp: response.documents[3]?.url || null,
                    actaInicio: response.documents[1]?.url || null,
                })
            }
        } catch (error) {
            setGoogleError("Debes conectar tu cuenta de Google en tu Perfil para generar documentos.")
        } finally {
            setIsGenerating(false)
        }
    }

    const getDownloadUrl = (url) => {
        if (!url) return null
        // Convertir URL de Google Docs a URL de exportación como PDF
        const docMatch = url.match(/\/document\/d\/([^/]+)/)
        if (docMatch) return `https://docs.google.com/document/d/${docMatch[1]}/export?format=pdf`
        // Para archivos de Drive genéricos
        const fileMatch = url.match(/\/file\/d\/([^/]+)/)
        if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
        return url
    }

    const DocumentRow = ({ title, docKey, icon }) => (
        <div className="doc-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
            <div className="doc-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className="doc-icon" style={{ color: '#6b7280' }}>{icon}</span>
                <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{title}</h4>
                    <span className="doc-status">
                        {docsGenerados[docKey] ?
                            <span className="status-badge-modern status-approved" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>
                                ✔ Generado en Google Docs
                            </span> :
                            <span className="status-badge-modern status-draft" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#f3f4f6', color: '#4b5563' }}>
                                Pendiente Generar
                            </span>
                        }
                    </span>
                </div>
            </div>
            {docsGenerados[docKey] && (
                <a
                    href={docsGenerados[docKey]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary small"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <ExternalLink size={14} /> Abrir en Drive
                </a>
            )}
        </div>
    )

    return (
        <div className="paso-container fade-in">
            {/* Header de Aprobación */}
            <div className="docs-header text-center" style={{ margin: '0 auto 32px auto', maxWidth: '600px' }}>
                <CheckCircle size={48} color="var(--color-exito)" style={{ marginBottom: '16px' }} />
                <h2 className="section-title">¡Proceso Aprobado y Firmado!</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>
                    La Dirección ha autorizado el inicio del proceso <strong>{formData.numero_proceso}</strong>.
                    Proceda a generar el folio oficial a partir de la plantilla en Google Docs.
                </p>

                <div style={{ marginTop: '20px' }}>
                    <button
                        className="btn-primary"
                        onClick={handleGenerarLoteGoogle}
                        disabled={isGenerating || docsGenerados.estudio !== null}
                    >
                        {isGenerating ? <><RefreshCw size={18} className="spin" /> Generando en Google Docs...</> : <><FileDown size={18} /> Generar Documento Oficial de Conveniencia</>}
                    </button>
                </div>

                {googleError && (
                    <div style={{ marginTop: '15px', color: '#DC2626', background: '#FEF2F2', padding: '10px', borderRadius: '6px' }}>
                        {googleError} <br /> <a href="#">Ir al Perfil para conectar Google</a>
                    </div>
                )}
            </div>

            {/* Documento Principal Generado */}
            <div className="docs-grid institutional-card" style={{ maxWidth: '800px', margin: '0 auto 32px auto', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div className="docs-list">
                    <DocumentRow title="1. Estudio de Conveniencia y Oportunidad" docKey="estudio" icon={<FileDown size={24} />} />
                </div>
            </div>

            {/* === SECCIÓN: Entregables al Contratista === */}
            <div style={{ maxWidth: '800px', margin: '0 auto 32px auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #2D5F3E' }}>
                    <FolderOpen size={24} color="#2D5F3E" />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>Documentos para Entrega al Contratista</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            Descargue los documentos aprobados para entregar al contratista seleccionado.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {entregablesConUrls.map(entregable => {
                        const Icon = entregable.icon
                        const disponible = !!entregable.url
                        return (
                            <div key={entregable.id} style={{
                                background: '#fff',
                                border: `1px solid ${disponible ? '#d1fae5' : '#e5e7eb'}`,
                                borderRadius: '10px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                opacity: disponible ? 1 : 0.65,
                                transition: 'all 0.3s ease',
                                boxShadow: disponible ? '0 2px 8px rgba(45,95,62,0.08)' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        background: disponible ? '#dcfce7' : '#f3f4f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Icon size={20} color={disponible ? '#166534' : '#9ca3af'} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                                            {entregable.titulo}
                                        </h4>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                                            {entregable.descripcion}
                                        </p>
                                    </div>
                                </div>

                                {disponible ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a
                                            href={entregable.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary small"
                                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', fontSize: '13px' }}
                                        >
                                            <ExternalLink size={14} /> Ver en Drive
                                        </a>
                                        <a
                                            href={getDownloadUrl(entregable.url)}
                                            className="btn-primary small"
                                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', fontSize: '13px', padding: '8px 12px' }}
                                        >
                                            <Download size={14} /> Descargar PDF
                                        </a>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '8px 12px', borderRadius: '6px',
                                        background: '#fef3c7', color: '#92400e', fontSize: '12px',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <RefreshCw size={12} /> Pendiente — Se habilitará cuando se suba al Drive
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="wizard-actions-footer" style={{ marginTop: '48px', justifyContent: 'center' }}>
                <button type="button" className="btn-primary" onClick={onFinish} style={{ padding: '12px 32px' }}>
                    Finalizar Flujo y Volver al Gestor <ArrowRight size={18} />
                </button>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    )
}

export default DocumentosContratacion

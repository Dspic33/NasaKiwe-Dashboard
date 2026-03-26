import React, { useState } from 'react'
import { Save, FileText, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { googleService } from '../../services/GoogleIntegrationService'

const TemplateViewer = () => {
    // ID de la plantilla maestra de Google Docs
    const masterTemplateId = '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0';
    // URL de previsualización nativa de Google Drive - Más robusta para IFrames externos
    const masterDocUrl = `https://drive.google.com/file/d/${masterTemplateId}/preview`;

    const [currentDocUrl, setCurrentDocUrl] = useState(masterDocUrl);
    const [isGenerating, setIsGenerating] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const [tags, setTags] = useState({
        fecha: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
        objeto: '',
        numero: '',
        valor: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTags(prev => ({ ...prev, [name]: value }));
    }

    const handleSave = async () => {
        if (!tags.objeto || !tags.numero || !tags.valor) {
            setError("Por favor completa los campos de Objeto, Número y Valor.");
            return;
        }

        setIsGenerating(true);
        setSuccessMessage(null);
        setError(null);

        try {
            // Adaptar tags al formato que espera fillSpecificTemplate
            const formDataAdapter = {
                fecha: tags.fecha,
                descripcion_objeto: tags.objeto,
                numero_proceso: tags.numero,
                valor_estimado: tags.valor
            };

            const response = await googleService.fillSpecificTemplate(formDataAdapter);

            if (response.success) {
                // Para el documento generado usamos /preview de Docs (que permite rm=minimal)
                // Pero si falla, el usuario tiene el botón de "Abrir en Google Docs"
                const finalUrl = response.url.replace('/edit', '/preview');
                setCurrentDocUrl(finalUrl);
                setSuccessMessage("¡Documento generado y llenado con éxito!");
            } else {
                throw new Error(response.error || "Error al generar el documento");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al conectar con el servidor. Verifica que las variables de entorno en Render estén configuradas.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="paso-container fade-in" style={{ height: 'calc(100vh - 100px)', padding: '0', display: 'flex', gap: '20px' }}>
            {/* Panel Lateral de Etiquetas */}
            <div className="institutional-card" style={{ width: '350px', margin: '0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div className="card-header" style={{ background: 'var(--color-primario)', color: 'white', padding: '15px 20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} /> Datos para la Plantilla
                    </h3>
                </div>
                <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
                    <div style={{ background: '#f0f9ff', borderLeft: '4px solid #0ea5e9', padding: '10px', fontSize: '12px' }}>
                        <p style={{ margin: 0, color: '#0369a1' }}>
                            <b>Nota Producción:</b> Si ves un error de bloqueo, asegúrate de estar logueado en Google o usa el botón "Abrir" arriba a la derecha.
                        </p>
                    </div>
                    
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Ingresa los valores para reemplazar las etiquetas <code>{"{{...}}"}</code>.
                    </p>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>Fecha:</label>
                        <input type="text" name="fecha" value={tags.fecha} onChange={handleInputChange} className="form-control" />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>Número Contrato:</label>
                        <input type="text" name="numero" value={tags.numero} onChange={handleInputChange} className="form-control" />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>Objeto:</label>
                        <textarea name="objeto" value={tags.objeto} onChange={handleInputChange} rows="4" className="form-control"></textarea>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>Valor Total:</label>
                        <input type="number" name="valor" value={tags.valor} onChange={handleInputChange} className="form-control" />
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={isGenerating}
                            style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '10px', background: '#10B981' }}
                        >
                            {isGenerating ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
                            {isGenerating ? 'Generando...' : 'Generar Contrato'}
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setCurrentDocUrl(masterDocUrl);
                                setSuccessMessage(null);
                                setError(null);
                            }}
                            style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                        >
                            Resetear Vista
                        </button>
                    </div>

                    {successMessage && (
                        <div style={{ color: '#065F46', background: '#D1FAE5', padding: '12px', borderRadius: '6px', fontSize: '13px', border: '1px solid #A7F3D0' }}>
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#991B1B', background: '#FEE2E2', padding: '12px', borderRadius: '6px', fontSize: '13px', border: '1px solid #FECACA' }}>
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Visor de Documento */}
            <div className="institutional-card" style={{ flex: 1, margin: '0', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="card-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentDocUrl.includes(masterTemplateId) ? '#6b7280' : '#10B981' }}></div>
                        <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                            {currentDocUrl.includes(masterTemplateId) ? 'PREVISUALIZACIÓN: Plantilla Maestra' : 'RESULTADO: Documento Generado'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                         <a
                            href={currentDocUrl.replace('/preview', '/edit').replace('/viewer?srcid=', 'open?id=')}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-primario)', fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '4px', background: '#fff', border: '1px solid #e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <ExternalLink size={14} /> Abrir Externo
                        </a>
                    </div>
                </div>
                <div className="card-body" style={{ flex: 1, padding: 0, position: 'relative', background: '#e5e7eb' }}>
                    {isGenerating && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                            <RefreshCw size={40} className="spin" color="var(--color-primario)" />
                            <p style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--color-primario)' }}>Preparando contrato...</p>
                        </div>
                    )}
                    <iframe
                        src={currentDocUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        title="Selector de Plantilla"
                        style={{ border: 'none', minHeight: '600px' }}
                        allow="autoplay"
                    ></iframe>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .form-control:focus { outline: none; border-color: var(--color-primario) !important; box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.1); }
            `}</style>
        </div>
    )
}

export default TemplateViewer

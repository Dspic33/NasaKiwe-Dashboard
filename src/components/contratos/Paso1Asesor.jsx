import React, { useState, useEffect } from 'react'
import { RefreshCw, Save, Send, Database, Check, Table, FileText } from 'lucide-react'
import { googleService } from '../../services/GoogleIntegrationService'

const Paso1Asesor = ({ formData, setFormData, onNext, onSaveDraft, isSaving, isReadOnly }) => {
    const [sheetStats, setSheetStats] = useState({ rows: 0, cols: 0 })
    const [isSyncing, setIsSyncing] = useState(false)
    const [sheetError, setSheetError] = useState(null)
    const [isGeneratingDocs, setIsGeneratingDocs] = useState(false)
    const [iframeActive, setIframeActive] = useState(false) // controla si el iframe puede recibir input


    useEffect(() => {
        // Auto-generar número de proceso si está vacío
        if (!formData.numero_proceso) {
            const currentYear = new Date().getFullYear();
            const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            setFormData(prev => ({
                ...prev,
                numero_proceso: `CD-VIV-${currentYear}-${randomId}`
            }));
        }

        // Inicializar viviendas_bitacora si no existe
        if (!formData.viviendas_bitacora) {
            setFormData(prev => ({
                ...prev,
                viviendas_bitacora: [{ numero: '01', beneficiario: '', interventor: '' }]
            }));
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSyncSheets = async () => {
        setIsSyncing(true)
        setSheetError(null)
        try {
            // Sincronizamos para asegurar que la conexión esté activa
            const result = await googleService.getMaterialesFromSheet('mock-sheet-id')
            if (result.success) {
                // Filtramos filas que tengan datos reales en Item o Descripción
                const validRows = result.data.filter(r => {
                    if (!r) return false;
                    const isHeader = (r.item?.toLowerCase().includes("ítem") || r.descripcion?.toLowerCase().includes("descripción"));
                    if (isHeader) return false;

                    return (r.item && r.item.toString().trim() !== "") ||
                        (r.descripcion && r.descripcion.toString().trim() !== "");
                });
                setSheetStats({
                    rows: validRows.length,
                    cols: 4
                });
            } else {
                setSheetError("No se pudo conectar con el archivo de Google Sheets.")
            }
        } catch (err) {
            setSheetError("Debes conectar tu cuenta de Google en tu Perfil para visualizar el Excel.")
        } finally {
            setIsSyncing(false)
        }
    }

    useEffect(() => {
        // Carga inicial de stats
        handleSyncSheets();
    }, []);

    const handleValidateAndNext = async () => {
        if (!formData.fecha || !formData.numero_proceso || !formData.descripcion_objeto || !formData.lugar_ejecucion || !formData.valor_estimado) {
            alert("Por favor diligencie todos los campos requeridos (*)");
            return;
        }

        setIsGeneratingDocs(true);
        let updatedDocs = {};
        try {
            const response = await googleService.generateDocsFromTemplates(formData);
            const specificRes = await googleService.fillSpecificTemplate(formData);

            if (response.success) {
                updatedDocs = {
                    documentos_oficiales_urls: {
                        estudio: response.documents[0].url,
                        actaInicio: specificRes.success ? specificRes.url : response.documents[1]?.url,
                        minuta: response.documents[2]?.url,
                        cdp: response.documents[3]?.url
                    }
                };
                setFormData(prev => ({
                    ...prev,
                    ...updatedDocs
                }));
            }
        } catch (e) {
            console.error("Error al generar Google Docs:", e);
        } finally {
            setIsGeneratingDocs(false);
        }

        onNext(updatedDocs);
    }

    const sheetId = '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs'
    const embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?rm=minimal&chrome=false&widget=true&headers=false`

    return (
        <div className="paso-container fade-in">
            <h2 className="section-title">Formato Estudio de Conveniencia y Oportunidad</h2>
            <p className="section-subtitle">Diligencie la información requerida para iniciar el proceso de contratación directa.</p>


            <form className="contrato-form" onSubmit={(e) => e.preventDefault()}>

                {/* CONFIGURACIÓN BITÁCORA - al inicio */}
                <div style={{ marginBottom: '24px', padding: '18px 20px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#2D5F3E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                            <Database size={17} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>Configuración para Bitácora</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>Defina la cantidad de viviendas del contrato</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>Cantidad de Viviendas</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.viviendas_bitacora?.length || 1}
                            onChange={e => {
                                const val = parseInt(e.target.value) || 1;
                                const current = [...(formData.viviendas_bitacora || [])];
                                let updated = [];
                                if (val > current.length) {
                                    const diff = val - current.length;
                                    const additions = Array(diff).fill(null).map((_, i) => ({
                                        numero: (current.length + i + 1).toString().padStart(2, '0'),
                                        beneficiario: '',
                                        interventor: ''
                                    }));
                                    updated = [...current, ...additions];
                                } else {
                                    updated = current.slice(0, val);
                                }
                                setFormData(prev => ({ ...prev, viviendas_bitacora: updated }));
                            }}
                            disabled={isReadOnly}
                            style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', fontWeight: 600 }}
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>1. Fecha del Estudio <span className="req">*</span></label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha || ''}
                            onChange={handleChange}
                            required
                        />
                        <small style={{ color: '#059669', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>Etiqueta Docs: {'{{fecha}}'}</small>
                    </div>

                    <div className="form-group">
                        <label>2. Número de Proceso <span className="req">*</span></label>
                        <input
                            type="text"
                            name="numero_proceso"
                            placeholder="Ej. CD-VIV-2026-001"
                            value={formData.numero_proceso || ''}
                            onChange={handleChange}
                            readOnly
                            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                            required
                        />
                        <small style={{ color: '#059669', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>Etiqueta Docs: {'{{numero}}'}</small>
                    </div>
                </div>

                <div className="form-group">
                    <label>3. Descripción del Objeto a Contratar <span className="req">*</span></label>
                    <textarea
                        name="descripcion_objeto"
                        rows="4"
                        placeholder="Describa de manera clara y detallada el objeto del contrato..."
                        value={formData.descripcion_objeto || ''}
                        onChange={handleChange}
                        required
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <small>Mínimo 200 caracteres</small>
                        <small style={{ color: '#059669', fontWeight: 'bold' }}>Etiqueta Docs: {'{{objeto}}'}</small>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>4. Lugar de Ejecución <span className="req">*</span></label>
                        <input
                            type="text"
                            name="lugar_ejecucion"
                            placeholder="Ej. Popayán, Cauca"
                            value={formData.lugar_ejecucion || ''}
                            onChange={handleChange}
                            required
                        />
                        <small style={{ color: '#059669', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>Etiqueta Docs: {'{{lugar}}'}</small>
                    </div>

                    <div className="form-group">
                        <label>5. Valor Estimado del Contrato <span className="req">*</span></label>
                        <div className="input-with-icon">
                            <span className="currency-symbol">$</span>
                            <input
                                type="number"
                                name="valor_estimado"
                                placeholder="0.00"
                                value={formData.valor_estimado || ''}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '30px' }}
                            />
                        </div>
                        <small style={{ color: '#059669', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>Etiqueta Docs: {'{{valor}}'}</small>
                    </div>
                </div>

                <div className="sheets-section" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginTop: '30px' }}>
                    <div className="sheets-header" style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={20} style={{ color: '#2563EB' }} />
                                <h3 style={{ margin: 0, fontSize: '16px' }}>Plantilla Base: Estudio de Conveniencia</h3>
                            </div>
                        </div>
                        <div className="sheets-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button
                                type="button"
                                className="btn-secondary small"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw size={14} />
                                Refrescar Vista
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive" style={{ padding: '0', height: '700px', overflow: 'hidden', position: 'relative' }}>
                        {/* Overlay: no carga el iframe hasta hacer clic para evitar que Google Docs robe el foco */}
                        {iframeActive ? (
                            <iframe
                                src={`https://docs.google.com/document/d/17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0/edit?rm=minimal`}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="Google Docs Template Preview"
                            ></iframe>
                        ) : (
                            <div
                                onClick={() => setIframeActive(true)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#F1F5F9',
                                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #E2E8F0 19px, #E2E8F0 20px)',
                                    backgroundSize: '100% 20px',
                                }}
                            >
                                <div style={{
                                    background: 'white',
                                    border: '2px solid #2D5F3E',
                                    borderRadius: '10px',
                                    padding: '24px 32px',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#2D5F3E', fontSize: '16px' }}>Clic para cargar y ver el documento</p>
                                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6B7280', maxWidth: '250px' }}>
                                        El documento se mantiene inactivo para no interrumpir tu escritura en el formulario.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

    {!isReadOnly && (
                    <div className="wizard-actions-footer" style={{ marginTop: '30px' }}>
                        <button type="button" className="btn-secondary" onClick={onSaveDraft} disabled={isSaving}>
                            {isSaving ? (
                                <><RefreshCw size={18} className="spin" /> Guardando...</>
                            ) : (
                                <><Save size={18} /> Guardar Borrador</>
                            )}
                        </button>
                        <button type="button" className="btn-primary" onClick={handleValidateAndNext} disabled={isGeneratingDocs}>
                            {isGeneratingDocs ? (
                                <><RefreshCw size={18} className="spin" /> Generando Documentos...</>
                            ) : (
                                <><Send size={18} /> Validar y Enviar a Revisión</>
                            )}
                        </button>
                    </div>
                )}
            </form>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .sheets-header h3 { color: #1f2937; font-weight: 600; }
                .text-success { color: #10b981; }
            `}</style>
        </div>
    )
}

export default Paso1Asesor

import React, { useState, useEffect } from 'react'
import { ExternalLink, Table, Database, RefreshCw, Layers, FileText } from 'lucide-react'
import { googleService } from '../../services/GoogleIntegrationService'

const ExcelPreview = () => {
    const [stats, setStats] = useState({ rows: 0, cols: 0 })
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState(null)

    // ID del sheet real de los materiales
    const sheetId = '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs'
    const embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&gridlines=true&widget=true&headers=false`

    const fetchStats = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await googleService.getMaterialesFromSheet(sheetId)
            if (result.success && result.data) {
                // Filtramos filas que tengan datos reales en Item o Descripción
                // Excluimos la fila de encabezado si los valores coinciden con "Ítem", "Descripción", etc.
                const occupiedRows = result.data.filter(row => {
                    if (!row) return false;
                    const isHeader = (row.item?.toLowerCase().includes("ítem") || row.descripcion?.toLowerCase().includes("descripción"));
                    if (isHeader) return false;

                    return (row.item && row.item.toString().trim() !== "") ||
                        (row.descripcion && row.descripcion.toString().trim() !== "");
                });

                setStats({
                    rows: occupiedRows.length,
                    cols: 4
                })
            }
        } catch (err) {
            console.error("Error fetching sheet stats:", err)
            setError("No se pudieron cargar las estadísticas del Excel.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateTestDoc = async () => {
        setIsGenerating(true);
        try {
            // Datos de prueba para rellenar el documento
            const testData = {
                fecha: new Date().toLocaleDateString(),
                numero_proceso: `TEST-${Math.floor(Math.random() * 1000)}`,
                descripcion_objeto: "PRUEBA TÉCNICA DE INSERCIÓN DE TABLA DESDE EXCEL (VISTA PREVIA)",
                lugar_ejecucion: "POPAYÁN (SEDE CENTRAL)",
                valor_estimado: "1234567"
            };

            const response = await googleService.fillLiveTestTemplate(testData);

            if (response.success) {
                alert(`¡Documento de DIAGNÓSTICO generado! Se creó un Doc desde cero e insertó la tabla del Excel.\n\nURL: ${response.url}`);
                window.open(response.url, '_blank');
            } else {
                throw new Error(response.error || "Error desconocido");
            }
        } catch (err) {
            console.error("Error generating test doc:", err);
            alert("No se pudo generar el documento de prueba: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    return (
        <div className="excel-preview-container fade-in" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: '15px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Visor de Google Sheets
                        {isLoading ? (
                            <RefreshCw size={20} className="spin" style={{ color: '#6B7280' }} />
                        ) : (
                            <div style={{
                                display: 'inline-flex',
                                gap: '12px',
                                background: '#F0FDF4',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                border: '1px solid #BBF7D0',
                                fontSize: '13px',
                                marginLeft: '10px'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#166534' }}>
                                    <Database size={14} /> <strong>{stats.rows}</strong> Filas ocupadas
                                </span>
                                <span style={{ color: '#BBF7D0' }}>|</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#166534' }}>
                                    <Layers size={14} /> <strong>{stats.cols}</strong> Columnas
                                </span>
                            </div>
                        )}
                    </h1>
                    <p>Vista directa del archivo maestro de materiales en Google Drive.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleGenerateTestDoc}
                        className="btn-primary"
                        disabled={isGenerating}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#B91C1C', borderColor: '#B91C1C' }}
                    >
                        {isGenerating ? <RefreshCw size={18} className="spin" /> : <FileText size={18} />}
                        {isGenerating ? 'Generando...' : 'Generar Word Prueba'}
                    </button>
                    <button
                        onClick={fetchStats}
                        className="btn-secondary"
                        disabled={isLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={18} className={isLoading ? 'spin' : ''} /> Actualizar Stats
                    </button>
                    <a
                        href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6' }}
                    >
                        <ExternalLink size={18} /> Abrir Editor
                    </a>
                </div>
            </div>

            <div className="institutional-card" style={{ flex: 1, padding: '0', overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: '8px', position: 'relative' }}>
                <iframe
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Google Sheets Materials"
                ></iframe>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', background: 'rgba(255,255,255,0.9)', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 20px', pointerEvents: 'none' }}>
                    <Table size={14} style={{ color: '#10B981', marginRight: '8px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>Sincronizando con PRECIOS_NasaKiwe</span>
                </div>
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

export default ExcelPreview

import React, { useState } from 'react'
import { Save, Settings, FileText, Database, Plus, RefreshCw, ExternalLink } from 'lucide-react'
import '../funcionarios/PortalFuncionarios.css' // Reutilizar estilos de tarjeta

const PanelAdminGoogle = () => {
    // Configuración base simulada
    const [config, setConfig] = useState({
        sheetIdMateriales: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetRangoMateriales: 'Sheet1!A:D'
    })

    const [plantillas, setPlantillas] = useState([
        { id: '1', nombre: 'Plantilla de Estudio Previo', docsId: '1xyz_template_123', tipo: 'doc', modificado: '12/06/2025' },
        { id: '2', nombre: 'Plantilla de Minuta de Contrato', docsId: '1abc_template_456', tipo: 'doc', modificado: '10/06/2025' }
    ])

    const [isSaving, setIsSaving] = useState(false)
    const [savedMessage, setSavedMessage] = useState('')

    const handleSaveConfig = () => {
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            setSavedMessage('Configuración guardada exitosamente')
            setTimeout(() => setSavedMessage(''), 3000)
        }, 1000)
    }

    const handleConnectTemplate = () => {
        const url = prompt("Introduce la URL o ID del Google Doc que servirá como plantilla:")
        if (url) {
            setPlantillas([...plantillas, {
                id: Date.now().toString(),
                nombre: 'Nueva Plantilla Conectada',
                docsId: url.substring(0, 20) + '...',
                tipo: 'doc',
                modificado: new Date().toLocaleDateString()
            }])
        }
    }

    return (
        <div className="admin-google-panel fade-in">
            <div className="page-header">
                <div>
                    <h1>Configuración de Integración Google (Admin)</h1>
                    <p>Administra los orígenes de datos y plantillas para el módulo de contratación.</p>
                </div>
            </div>

            <div className="institutional-card" style={{ marginBottom: '24px' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Database size={20} className="text-primary" />
                    <h3 style={{ margin: 0 }}>Google Sheets: Base de Materiales</h3>
                </div>

                <div className="card-body" style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                        Configura el ID del Google Sheet desde el cual los asesores cargarán los materiales de construcción.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Google Sheet ID</label>
                            <input
                                type="text"
                                value={config.sheetIdMateriales}
                                onChange={(e) => setConfig({ ...config, sheetIdMateriales: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                placeholder="Ej: 1BxiMVs..."
                            />
                        </div>
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Rango (Pestaña / Celdas)</label>
                            <input
                                type="text"
                                value={config.sheetRangoMateriales}
                                onChange={(e) => setConfig({ ...config, sheetRangoMateriales: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                placeholder="Ej: Materiales!A:D"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <button className="btn-primary" onClick={handleSaveConfig} disabled={isSaving}>
                            {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </button>

                        <button className="btn-secondary">
                            <RefreshCw size={16} /> Probar Conexión
                        </button>

                        {savedMessage && <span style={{ color: '#10B981', fontSize: '14px' }}>{savedMessage}</span>}
                    </div>
                </div>
            </div>

            <div className="institutional-card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} className="text-primary" />
                        <h3 style={{ margin: 0 }}>Google Docs: Plantillas de Documentos</h3>
                    </div>
                    <button className="btn-secondary small" onClick={handleConnectTemplate}>
                        <Plus size={16} /> Conectar Nueva Plantilla
                    </button>
                </div>

                <div className="card-body" style={{ marginTop: '20px' }}>
                    <table className="institutional-table">
                        <thead>
                            <tr>
                                <th>Nombre Plantilla</th>
                                <th>Google Doc ID</th>
                                <th>Última Modificación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plantillas.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.nombre}</strong></td>
                                    <td><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>{p.docsId}</code></td>
                                    <td>{p.modificado}</td>
                                    <td>
                                        <button className="action-btn icon-only" title="Ver/Editar en Drive" onClick={() => window.open('https://docs.google.com', '_blank')}>
                                            <ExternalLink size={18} />
                                        </button>
                                        <button className="action-btn icon-only" title="Sincronizar variables" onClick={() => alert('Sincronizando placeholders...')}>
                                            <RefreshCw size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default PanelAdminGoogle

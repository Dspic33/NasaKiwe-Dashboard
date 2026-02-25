import React from 'react'
import { Download, FileText, FileCheck } from 'lucide-react'
import { triggerDirectDownload } from '../../utils/downloadHelper'

const FormatList = ({ formats }) => {
    if (!formats || formats.length === 0) {
        return (
            <div className="formatos-view">
                <div className="empty-state">
                    <FileCheck size={48} />
                    <p>No hay formatos específicos asignados para esta área aún.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="formatos-grid">
            <div className="formatos-intro">
                <h2>Formatos Institucionales</h2>
                <p>Documentos oficiales requeridos para la gestión del área.</p>
            </div>
            <div className="document-list">
                {formats.map((doc) => (
                    <div key={doc.id} className="document-card institutional-card">
                        <div className="document-icon">
                            <FileText size={24} />
                        </div>
                        <div className="document-info">
                            <h3 className="document-name">{doc.nombre}</h3>
                            <div className="document-meta">
                                <span className="document-id">{doc.id}</span>
                                <span className="separator">|</span>
                                <span className="document-type">{doc.tipo}</span>
                            </div>
                        </div>
                        <button
                            className="download-btn-small"
                            onClick={() => triggerDirectDownload(doc.id)}
                        >
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FormatList

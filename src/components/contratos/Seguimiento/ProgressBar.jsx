import React from 'react'
import { Check, Edit2, ShieldCheck, FileCheck, FileSignature, ArrowLeftCircle } from 'lucide-react'
import { ESTADOS_CONTRATACION } from '../../../data/contratosMock'
import './Seguimiento.css'

const ETAPAS = [
    { id: 1, key: 'asesor', label: '1. ASESOR', icon: Edit2 },
    { id: 2, key: 'juridico', label: '2. JURÍDICO', icon: ShieldCheck },
    { id: 3, key: 'directora', label: '3. DIRECTORA', icon: FileSignature },
    { id: 4, key: 'aprobado', label: '4. APROBADO', icon: Check },
    { id: 5, key: 'docs', label: '5. DOCS GENERADOS', icon: FileCheck }
]

const ProgressBar = ({ estado, historial = [] }) => {

    // Determinar etapa activa basada en el estado
    let activeStepId = 1
    let isReturned = false

    switch (estado) {
        case ESTADOS_CONTRATACION.BORRADOR:
            activeStepId = 1
            break
        case ESTADOS_CONTRATACION.EN_REVISION_JURIDICA:
            activeStepId = 2
            break
        case ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES:
            activeStepId = 1 // Volvió al asesor
            isReturned = true
            break
        case ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA:
            activeStepId = 3
            break
        case ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA:
            activeStepId = 2 // Volvió al jurídico
            isReturned = true
            break
        case ESTADOS_CONTRATACION.APROBADO:
            activeStepId = 4
            break
        case ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS:
            activeStepId = 5
            break
        default:
            activeStepId = 1
    }

    // Calcular qué hitos han sido completados asumiendo un flujo lineal hacia adelante
    return (
        <div className="process-progress-container institutional-card">
            <div className="progress-stepper">
                {ETAPAS.map((etapa, index) => {
                    const isCompleted = activeStepId > etapa.id && !isReturned
                    const isActive = activeStepId === etapa.id
                    const showWarning = isActive && isReturned
                    const Icon = showWarning ? ArrowLeftCircle : (isCompleted ? Check : etapa.icon)

                    return (
                        <React.Fragment key={etapa.id}>
                            <div className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${showWarning ? 'returned' : ''}`}>
                                <div className="step-circle">
                                    <Icon size={18} />
                                    {isActive && <div className="pulse-ring"></div>}
                                </div>
                                <span className="step-label">{etapa.label}</span>
                            </div>

                            {index < ETAPAS.length - 1 && (
                                <div className={`step-connector ${activeStepId > etapa.id ? 'completed' : ''}`}></div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
            {isReturned && (
                <div className="progress-alert warning">
                    <ArrowLeftCircle size={16} />
                    <span>El proceso fue devuelto y requiere correcciones antes de continuar.</span>
                </div>
            )}
        </div>
    )
}

export default ProgressBar

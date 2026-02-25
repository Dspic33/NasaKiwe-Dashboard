import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import Paso1Asesor from './Paso1Asesor'
import Paso2Juridico from './Paso2Juridico'
import Paso3Directora from './Paso3Directora'
import DocumentosContratacion from './DocumentosContratacion'
import ProgressBar from './Seguimiento/ProgressBar'
import ActivityFeed from './Seguimiento/ActivityFeed'
import { ESTADOS_CONTRATACION, ROLES_USUARIO } from '../../data/contratosMock'
import { NotificationService } from '../../services/NotificationService'
import { getUsuarioPorRol } from '../../data/usuarios'
import './Contratos.css'

const ContratacionWizard = ({ onNavigate, onComplete, initialContrato, currentUser }) => {
    // Definimos el paso activo basado en el estado inicial si existe, sino paso 1
    const getInitialStep = (estado, userRole) => {
        // Validación rígida de rol: Un usuario no puede ver ni interactuar 
        // con pasos de otros (excepto documentos finales paso 4 compartidos)
        if (estado === ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS || estado === ESTADOS_CONTRATACION.APROBADO) {
            return 4; // Paso final compartido
        }

        switch (userRole) {
            case ROLES_USUARIO.ASESOR_VIVIENDA: return 1;
            case ROLES_USUARIO.JURIDICO: return 2;
            case ROLES_USUARIO.DIRECTORA: return 3;
            default:
                // Fallback (solo si no hay rol)
                switch (estado) {
                    case ESTADOS_CONTRATACION.BORRADOR: return 1;
                    case ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES: return 1;
                    case ESTADOS_CONTRATACION.EN_REVISION_JURIDICA: return 2;
                    case ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA: return 2;
                    case ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA: return 3;
                    default: return 1;
                }
        }
    }

    const [currentStep, setCurrentStep] = useState(initialContrato ? getInitialStep(initialContrato.estado, currentUser?.rol) : getInitialStep(null, currentUser?.rol))

    // Forma data del contrato
    const [formData, setFormData] = useState(() => {
        const nextNum = String(Date.now()).slice(-3);
        return {
            id: initialContrato?.id || `CD-VIV-2026-N${nextNum}`,
            creado_por: initialContrato?.creado_por || 'u1',
            nombre_creador: initialContrato?.nombre_creador || 'Arq Juan Camilo Manzano T.',
            estado: initialContrato?.estado || ESTADOS_CONTRATACION.BORRADOR,
            fecha: initialContrato?.fecha || new Date().toLocaleDateString('es-CO'),
            numero_proceso: initialContrato?.numero_proceso || `CD-VIV-2026-N${nextNum}`,
            descripcion_objeto: initialContrato?.descripcion_objeto || '',
            lugar_ejecucion: initialContrato?.lugar_ejecucion || '',
            valor_estimado: initialContrato?.valor_estimado || '',
            materiales: initialContrato?.materiales || [],
            dias_en_etapa: initialContrato?.dias_en_etapa || 0,
            ...initialContrato
        }
    })

    const [lastSaved, setLastSaved] = useState(new Date())
    const [isSaving, setIsSaving] = useState(false)

    // Guardado manual
    const handleSaveDraft = () => {
        setIsSaving(true)
        // Usa la versión más actual del formData al momento de guardar
        setFormData(latest => {
            setTimeout(() => {
                setLastSaved(new Date())
                setIsSaving(false)
                onComplete(latest, false)
            }, 600)
            return latest
        })
    }

    // Auto-guardado silencioso cada 5s
    useEffect(() => {
        const timer = setTimeout(() => {
            setFormData(latest => {
                setLastSaved(new Date())
                onComplete(latest, false)
                return latest
            })
        }, 5000)
        return () => clearTimeout(timer)
    }, [formData])

    // Guardar borrador y volver al dashboard
    const handleBack = () => {
        onComplete(formData, true) // Persiste Y navega a contratos
    }

    const handleStateTransition = (payload, newState, nextStep, notifyRole, subject, message) => {
        const currentUserRole = currentUser?.rol;

        const getActionLabel = (state) => {
            if (state === ESTADOS_CONTRATACION.EN_REVISION_JURIDICA) return 'Enviado a revisión jurídica';
            if (state === ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES) return 'Devuelto con observaciones (Jurídica)';
            if (state === ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA) return 'Aprobado jurídicamente y enviado a Directora';
            if (state === ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA) return 'Devuelto con observaciones (Directora)';
            if (state === ESTADOS_CONTRATACION.APROBADO) return 'Aprobado por Dirección';
            if (state === ESTADOS_CONTRATACION.DOCUMENTOS_GENERADOS) return 'Documentos finales generados';
            return 'Estado actualizado';
        };

        const newHistoryItem = {
            fecha: new Date().toISOString(),
            usuario: currentUserRole || 'sistema',
            nombre: currentUser?.nombre || 'Usuario Sistema',
            accion: getActionLabel(newState)
        };

        // Combinar con la data más reciente antes de guardar
        const dataToSave = {
            ...formData,
            ...payload,
            estado: newState,
            historial_cambios: [...(formData.historial_cambios || []), newHistoryItem]
        };

        // 1. Actualiza Local
        setFormData(dataToSave);

        // En lugar de siempre avanzar en el UI wizard, si la etapa a la que avanza ya no le corresponde 
        // a este usuario, devolvemos al usuario al dashboard para que pueda crear o ver más cosas.
        let shouldGoToDashboard = false;

        if (nextStep === 2 && currentUserRole !== ROLES_USUARIO.JURIDICO) shouldGoToDashboard = true;
        if (nextStep === 3 && currentUserRole !== ROLES_USUARIO.DIRECTORA) shouldGoToDashboard = true;
        if (nextStep === 4 && currentUserRole !== ROLES_USUARIO.ASESOR_VIVIENDA) shouldGoToDashboard = true;
        // Si lo devolvieron a correcciones (Paso 1) y soy Jurídico, también salgo.
        if (nextStep === 1 && currentUserRole !== ROLES_USUARIO.ASESOR_VIVIENDA) shouldGoToDashboard = true;

        if (shouldGoToDashboard) {
            onComplete(dataToSave, true); // true = navegar a contratos
        } else {
            onComplete(dataToSave, false); // false = mantenerse en wizard
            // 3. Avanza UI al siguiente paso solo si me corresponde
            setCurrentStep(nextStep);
        }

        // 4. Notificación asíncrona
        if (notifyRole) {
            const targetUser = getUsuarioPorRol(notifyRole);
            if (targetUser && targetUser.email) {
                NotificationService.sendEmailNotification(
                    targetUser.nombre,
                    targetUser.email,
                    subject,
                    message
                );
            }
        }
    }

    return (
        <div className="wizard-container fade-in">
            <div className="wizard-header institutional-card" style={{ marginBottom: '0' }}>
                <div className="wizard-title-row">
                    <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={20} />
                        <span>Volver al Dashboard</span>
                    </button>
                    <div className="wizard-meta">
                        <span className="last-saved">
                            <Save size={14} className={isSaving ? 'spin' : ''} />
                            {isSaving ? ' Guardando...' : ` Guardado autom.: ${lastSaved.toLocaleTimeString()}`}
                        </span>
                        <span className="draft-badge">
                            {formData.estado ? formData.estado.replace(/_/g, ' ') : 'NUEVO PROCESO'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nueva Barra de Progreso */}
            <ProgressBar estado={formData.estado || ESTADOS_CONTRATACION.BORRADOR} />

            <div className="wizard-layout-with-sidebar">
                {/* Contenido Principal (Formulario/Revisión) */}
                <div className="wizard-main-content institutional-card">
                    {currentStep === 1 && (
                        <Paso1Asesor
                            formData={formData}
                            setFormData={setFormData}
                            onSaveDraft={handleSaveDraft}
                            isSaving={isSaving}
                            isReadOnly={formData.estado !== ESTADOS_CONTRATACION.BORRADOR && formData.estado !== ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES}
                            onNext={(updatedData) => {
                                handleStateTransition(
                                    updatedData || {},
                                    'EN_REVISION_JURIDICA',
                                    2,
                                    ROLES_USUARIO.JURIDICO,
                                    `Revisión Requerida: Proceso ${formData.numero_proceso}`,
                                    `El Asesor ${formData.nombre_creador} ha enviado un nuevo proceso de contratación para su revisión jurídica y validación técnica.`
                                )
                            }}
                        />
                    )}
                    {currentStep === 2 && (
                        <Paso2Juridico
                            formData={formData}
                            isReadOnly={formData.estado !== ESTADOS_CONTRATACION.EN_REVISION_JURIDICA && formData.estado !== ESTADOS_CONTRATACION.DEVUELTO_REVISION_DIRECTORA}
                            onApprove={(obs) => {
                                handleStateTransition(
                                    { observaciones_juridicas: obs },
                                    'EN_REVISION_DIRECTORA',
                                    3,
                                    ROLES_USUARIO.DIRECTORA,
                                    `Aprobación Final Requerida: Proceso ${formData.numero_proceso}`,
                                    `El área jurídica ha emitido CONCEPTO FAVORABLE para este proceso. Está listo para su firma y aprobación final.`
                                )
                            }}
                            onReject={(obs) => {
                                handleStateTransition(
                                    { observaciones_juridicas: obs },
                                    'DEVUELTO_CORRECCIONES',
                                    1,
                                    ROLES_USUARIO.ASESOR_VIVIENDA,
                                    `Proceso Devuelto: Correcciones Jurídicas (${formData.numero_proceso})`,
                                    `El área jurídica ha devuelto el proceso para correcciones. Ingrese a la plataforma para ver las observaciones detalladas.`
                                )
                            }}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <Paso3Directora
                            formData={formData}
                            isReadOnly={formData.estado !== ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA}
                            onApprove={(obs) => {
                                handleStateTransition(
                                    { observaciones_directora: obs },
                                    'APROBADO',
                                    4,
                                    ROLES_USUARIO.ASESOR_VIVIENDA,
                                    `¡Proceso Aprobado!: ${formData.numero_proceso}`,
                                    `La Directora ha dado su Aprobación Final. Ya puede generar el folio y los documentos oficiales para el contratista.`
                                )
                            }}
                            onReject={(obs) => {
                                handleStateTransition(
                                    { observaciones_directora: obs },
                                    'DEVUELTO_REVISION_DIRECTORA',
                                    2,
                                    ROLES_USUARIO.JURIDICO,
                                    `Proceso Devuelto por Dirección: ${formData.numero_proceso}`,
                                    `La Directora ha devuelto el proceso con observaciones. Requisitos de su atención inmediata.`
                                )
                            }}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 4 && (
                        <DocumentosContratacion
                            formData={formData}
                            onFinish={() => onComplete(formData, true)}
                        />
                    )}
                </div>

                {/* Sidebar Derecho: Event Feed */}
                <div className="wizard-sidebar">
                    <ActivityFeed historial={formData.historial_cambios || []} />
                </div>
            </div>
        </div>
    )
}

export default ContratacionWizard

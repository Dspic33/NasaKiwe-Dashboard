import React from 'react'
import { FileText, Plus, Search, Filter, Eye, Edit2, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { MOCK_CONTRATOS, ESTADOS_CONTRATACION, ESTADOS_LABELS, ROLES_USUARIO } from '../../data/contratosMock'
import DashboardAsesor from './DashboardRoles/DashboardAsesor'
import DashboardJuridico from './DashboardRoles/DashboardJuridico'
import DashboardDirectora from './DashboardRoles/DashboardDirectora'
import './Contratos.css'

const ContratosView = ({ currentUser, onNavigate, onStartWizard, contratos }) => {

    const handleOpenContrato = (contrato) => {
        onStartWizard(contrato)
    }

    const renderDashboard = () => {
        // Fallback si por alguna razón cargara sin sesión
        if (!currentUser) return <div>No ha iniciado sesión</div>;

        switch (currentUser.rol) {
            case ROLES_USUARIO.ASESOR_VIVIENDA:
                return <DashboardAsesor
                    contratos={contratos}
                    currentUser={currentUser}
                    onStartWizard={() => onStartWizard(null)}
                    onOpenContrato={handleOpenContrato}
                />
            case ROLES_USUARIO.JURIDICO:
                return <DashboardJuridico
                    contratos={contratos}
                    currentUser={currentUser}
                    onOpenContrato={handleOpenContrato}
                />
            case ROLES_USUARIO.DIRECTORA:
                return <DashboardDirectora
                    contratos={contratos}
                    currentUser={currentUser}
                    onOpenContrato={handleOpenContrato}
                />
            default:
                return <div>Rol no soportado en este panel</div>
        }
    }

    return (
        <div className="contratos-main-container">
            {renderDashboard()}
        </div>
    )
}

export default ContratosView

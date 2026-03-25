import React, { useState, useEffect } from 'react'
import { FileText, Plus, Search, Filter, Eye, Edit2, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { MOCK_CONTRATOS, ESTADOS_CONTRATACION, ESTADOS_LABELS, ROLES_USUARIO } from '../../data/contratosMock'
import DashboardAsesor from './DashboardRoles/DashboardAsesor'
import DashboardJuridico from './DashboardRoles/DashboardJuridico'
import DashboardDirectora from './DashboardRoles/DashboardDirectora'
import BitacoraView from './Bitacora/BitacoraView'
import './Contratos.css'

const ContratosView = ({ currentUser, onNavigate, onStartWizard, contratos, initialTab = 'dashboard' }) => {
    const [activeTab, setActiveTab] = useState(initialTab)

    // Sincronizar el tab activo si cambia la prop initialTab (desde el sidebar)
    useEffect(() => {
        setActiveTab(initialTab)
    }, [initialTab]);

    // Reiniciar el scroll al inicio cada vez que cambie de pestaña interna (Dashboard vs Bitácora)
    useEffect(() => {
        window.scrollTo(0, 0);
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.scrollTop = 0;
    }, [activeTab]);

    const handleOpenContrato = (contrato) => {
        onStartWizard(contrato)
    }

    const renderDashboard = () => {
        // Fallback si por alguna razón cargara sin sesión
        if (!currentUser) return <div>No ha iniciado sesión</div>;

        if (activeTab === 'bitacora') {
            return <BitacoraView currentUser={currentUser} />
        }

        switch (currentUser.rol) {
            case ROLES_USUARIO.ASESOR_VIVIENDA:
            case ROLES_USUARIO.ADMIN:
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
            case ROLES_USUARIO.INSPECTOR:
                return <div>Dashboard de Inspector (Resumen Macro)</div>
            default:
                return <div>Rol no soportado en este panel: {currentUser.rol}</div>
        }
    }

    return (
        <div className="contratos-main-container">
            {renderDashboard()}
        </div>
    )
}

export default ContratosView

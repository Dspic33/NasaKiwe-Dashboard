import React, { useState, useEffect } from 'react'
import logo from '../../assets/logo.png'
import {
    Building2,
    LayoutDashboard,
    FileText,
    User,
    Settings,
    ChevronRight,
    Menu,
    X,
    CheckCircle,
    LogOut,
    Table
} from 'lucide-react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { googleService } from '../../services/GoogleIntegrationService'
import './Layout.css'

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, currentUser }) => {
    const [activeItem, setActiveItem] = useState('Perfil')
    useEffect(() => {
        // Inicializar el estado de conexión de Google si existe en el cache
        if (localStorage.getItem('real_google_access_token')) {
            googleService.isConnected = true
        }
    }, [])

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'portal' },
        { name: 'Contratos', icon: <FileText size={20} />, id: 'contratos', roles: ['asesor_vivienda', 'juridico', 'directora', 'admin'] },
        { name: 'Bitácora', icon: <Table size={20} />, id: 'bitacora', roles: ['asesor_vivienda', 'inspector', 'residente', 'contratista', 'admin'] },
        { name: 'Inspector', icon: <Building2 size={20} />, id: 'inspector', roles: ['inspector', 'admin'] },
        { name: 'Configuración', icon: <Settings size={20} />, id: 'config' },
    ]

    const handleNavClick = (item) => {
        setActiveItem(item.name)
        onNavigate(item.id)
    }

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Menú principal">
                <div
                    className="sidebar-header"
                    onClick={() => onNavigate('portal')}
                    style={{ cursor: 'pointer' }}
                    aria-label="Volver al Portal de Funcionarios"
                    role="link"
                >
                    <img src={logo} alt="Nasa Kiwe Logo" className="logo" />
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.filter(item => !item.roles || (currentUser && item.roles.includes(currentUser.rol))).map((item) => (
                            <li key={item.id}>
                                <button
                                    className={`nav-item ${activeItem === item.name ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item)}
                                    aria-current={activeItem === item.name ? 'page' : undefined}
                                    aria-label={`Navegar a ${item.name}`}
                                >
                                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                                    <span className="nav-text">{item.name}</span>
                                    {activeItem === item.name && <ChevronRight size={16} className="active-arrow" aria-hidden="true" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: '20px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {/* Botón de Google removido para no forzar conexión */}
                </div>

                <div className="sidebar-footer">
                    <p>© 2026 Nasa Kiwe</p>
                </div>
            </aside>
        </>
    )
}

export default Sidebar

import React, { useState, useEffect } from 'react'
import logo from '../../assets/logo.png'
import {
    Building2,
    LayoutDashboard,
    FileText,
    Settings,
    ChevronRight,
    Table,
    CheckCircle
} from 'lucide-react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { googleService } from '../../services/GoogleIntegrationService'
import './Layout.css'

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, currentUser }) => {
    const [activeItem, setActiveItem] = useState('Perfil')
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    useEffect(() => {
        // Inicializar el estado de conexión de Google si existe en el cache
        if (localStorage.getItem('real_google_access_token')) {
            googleService.isConnected = true
            setIsGoogleConnected(true)
        }
    }, [])

    const handleGoogleConnect = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            setIsConnecting(true)
            localStorage.setItem('real_google_access_token', tokenResponse.access_token)
            googleService.isConnected = true
            setIsGoogleConnected(true)
            setIsConnecting(false)
        },
        onError: (error) => {
            console.error('Error al conectar con Google:', error)
            setIsConnecting(false)
        },
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets'
    })

    const handleGoogleDisconnect = () => {
        googleLogout()
        localStorage.removeItem('real_google_access_token')
        googleService.isConnected = false
        setIsGoogleConnected(false)
    }

    const startGoogleConnection = () => {
        setIsConnecting(true)
        handleGoogleConnect()
    }

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
                    {isGoogleConnected ? (
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px' }}>
                                <CheckCircle size={16} color="#A7F3D0" />
                                <span>Google Conectado</span>
                            </div>
                            <button
                                onClick={handleGoogleDisconnect}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                            >
                                Desconectar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startGoogleConnection}
                            disabled={isConnecting}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                background: '#ffffff',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '500',
                                fontSize: '14px',
                                cursor: isConnecting ? 'not-allowed' : 'pointer',
                                opacity: isConnecting ? 0.7 : 1,
                                outline: 'none',
                                overflow: 'hidden'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span style={{ whiteSpace: 'nowrap' }}>{isConnecting ? 'Conectando...' : 'Vincular Google'}</span>
                        </button>
                    )}
                </div>

                <div className="sidebar-footer">
                    <p>© 2026 Nasa Kiwe</p>
                </div>
            </aside>
        </>
    )
}

export default Sidebar

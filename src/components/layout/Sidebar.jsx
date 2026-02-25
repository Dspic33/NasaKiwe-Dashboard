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

const Sidebar = ({ isOpen, toggleSidebar, onNavigate }) => {
    const [activeItem, setActiveItem] = useState('Perfil')
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)

    useEffect(() => {
        setIsGoogleConnected(!!localStorage.getItem('real_google_access_token'))
    }, [])

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log("Login Exitoso desde Sidebar:", codeResponse)
            localStorage.setItem('real_google_access_token', codeResponse.access_token)
            setIsGoogleConnected(true)
            googleService.isConnected = true
            alert("¡Conexión exitosa con Google!")
        },
        onError: (error) => {
            console.log('Login Falló:', error)
            alert("Error al conectar con Google")
        },
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets'
    });

    const handleDisconnect = () => {
        googleLogout()
        localStorage.removeItem('real_google_access_token')
        setIsGoogleConnected(false)
        googleService.isConnected = false
    }

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'portal' },
        { name: 'Contratos', icon: <FileText size={20} />, id: 'contratos' },
        { name: 'Configuración', icon: <Settings size={20} />, id: 'config' },
    ]

    const handleNavClick = (item) => {
        setActiveItem(item.name)
        if (item.id === 'portal') {
            onNavigate('portal')
        } else if (item.id === 'contratos') {
            onNavigate('contratos')
        }
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
                        {menuItems.map((item) => (
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '14px', fontWeight: 'bold' }}>
                                <CheckCircle size={16} /> Google Conectado
                            </div>
                            <button
                                onClick={handleDisconnect}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '13px' }}
                            >
                                <LogOut size={14} /> Desconectar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleGoogleLogin()}
                            style={{ width: '100%', background: '#4285F4', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <span style={{ background: 'white', color: '#4285F4', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>G</span>
                            Conectar Google
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

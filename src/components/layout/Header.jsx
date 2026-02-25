import React from 'react'
import { Bell, Search, User, LogOut, Menu as MenuIcon } from 'lucide-react'

const Header = ({ toggleSidebar, currentView, onNavigate, currentUser, onLogout, unreadNotifications }) => {
    const isDashboardView = currentView === 'contratos' || currentView === 'wizard'

    return (
        <header className="header" role="banner">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={toggleSidebar}
                    aria-label="Abrir menú de navegación"
                >
                    <MenuIcon size={24} />
                </button>
                <div
                    className="gov-co-logo"
                    onClick={() => onNavigate('portal')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    aria-label="Ir al Portal del Estado Colombiano gov.co"
                >
                    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#F0B429" />
                        <path d="M20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35Z" fill="#F7D070" />
                        <path d="M20 30C25.5228 30 30 20C30 14.4772 25.5228 10 20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30Z" fill="#FADB5F" />
                        <path d="M20 25C22.7614 25 25 22.7614 25 20C25 17.2386 22.7614 15 20 15C17.2386 15 15 17.2386 15 20C15 22.7614 17.2386 25 20 25Z" fill="#FFE066" />
                    </svg>
                    <span className="gov-text">gov.co</span>
                </div>
                {!isDashboardView && (
                    <nav className="breadcrumb" aria-label="Ruta de navegación">
                        <span
                            className="breadcrumb-link"
                            onClick={() => onNavigate('portal')}
                            role="link"
                            tabIndex="0"
                            onKeyDown={(e) => e.key === 'Enter' && onNavigate('portal')}
                        >
                            Portal de Funcionarios
                        </span>
                        {currentView !== 'portal' && (
                            <>
                                <span className="separator">/</span>
                                <span className="current">
                                    {currentView === 'perfil' ? 'Perfil Arquitecto' :
                                        currentView === 'talento' ? 'Perfil Talento Humano' :
                                            currentView}
                                </span>
                            </>
                        )}
                    </nav>
                )}
            </div>

            <div className="header-right">
                {!isDashboardView && (
                    <div className="search-bar">
                        <img src="/assets/imagenes/icono.ico" alt="Icono" className="search-brand-icon" />
                        <input type="text" placeholder="Buscar funcionario..." />
                    </div>
                )}

                <div className="header-actions">
                    {currentUser && isDashboardView && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', color: '#374151' }}>
                            <div style={{ background: '#e5e7eb', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                                <User size={16} color="#4b5563" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser.nombre}</span>
                                <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>{currentUser.rol.replace('_', ' ')}</span>
                            </div>
                        </div>
                    )}

                    {isDashboardView && (
                        <button className="icon-button" title="Notificaciones" onClick={() => onNavigate('contratos')}>
                            <Bell size={20} />
                            {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
                        </button>
                    )}

                    <button className="icon-button" title="Cerrar Sesión" onClick={onLogout}>
                        <LogOut size={20} color="#DC2626" />
                    </button>
                </div>
            </div>
        </header >
    )
}

export default Header

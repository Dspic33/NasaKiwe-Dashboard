import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

const DashboardLayout = ({ children, currentView, onNavigate, currentUser, onLogout, unreadNotifications }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <div className="dashboard-container">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                onNavigate={onNavigate}
                currentUser={currentUser}
            />

            <div className="main-content">
                <Header
                    toggleSidebar={toggleSidebar}
                    currentView={currentView}
                    onNavigate={onNavigate}
                    currentUser={currentUser}
                    onLogout={onLogout}
                    unreadNotifications={unreadNotifications}
                />
                <main className="page-content">
                    {children}
                </main>

                <div className="footer-waves">
                    <svg className="waves-svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
                        <defs>
                            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                        </defs>
                        <g className="parallax-waves">
                            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(185, 28, 28, 0.7)" />
                            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(220, 38, 38, 0.5)" />
                            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(239, 68, 68, 0.3)" />
                            <use xlinkHref="#gentle-wave" x="48" y="7" fill="var(--color-gris-claro)" />
                        </g>
                    </svg>
                </div>
                <footer className="footer-institutional">
                    <div className="footer-content">
                        <p><strong>Corporación Nasa Kiwe</strong></p>
                        <p>Calle 1AN No. 2 – 39. Popayán, Cauca</p>
                        <p>Tel: +57 60(2) 8373075 | info@nasakiwe.gov.co</p>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default DashboardLayout

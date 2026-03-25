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

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', background: '#FEE2E2', color: '#991B1B', margin: '20px', borderRadius: '8px', border: '2px solid #DC2626' }}>
                    <h2 style={{fontSize:'24px', fontWeight:'bold', marginBottom:'16px'}}>⚠️ Error en la aplicación (Bitácora)</h2>
                    <p>Me ayudaría mucho si copias este texto o tomas una captura:</p>
                    <pre style={{ background: '#7F1D1D', color: '#FFFFFF', padding: '16px', borderRadius: '4px', overflowX: 'auto', marginTop:'10px' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <pre style={{ background: '#450A0A', color: '#FCA5A5', padding: '16px', borderRadius: '4px', overflowX: 'auto', marginTop:'10px', fontSize:'12px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button onClick={() => window.location.reload()} style={{marginTop:'20px', padding:'10px 20px', background:'#DC2626', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Recargar Página</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const DashboardLayoutWrapper = (props) => (
    <ErrorBoundary>
        <DashboardLayout {...props} />
    </ErrorBoundary>
);

export default DashboardLayoutWrapper;

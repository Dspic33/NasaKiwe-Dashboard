import React, { useState, useEffect } from 'react'
import { Link, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { googleService } from '../../services/GoogleIntegrationService'
import '../funcionarios/PortalFuncionarios.css' // Reutilizar estilos de tarjeta

const IntegracionesPerfil = () => {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        // Inicializar estado revisando el token guardado
        const token = localStorage.getItem('real_google_access_token')
        const status = !!token
        setIsConnected(status)
        if (status) {
            // Podríamos decodificar el email, pero por ahora mostramos un mensaje genérico.
            // Para obtener el email real con el access token habría que llamar a https://www.googleapis.com/oauth2/v3/userinfo
            setUserInfo({ email: 'Usuario Autenticado', lastSync: new Date().toLocaleString() })
            // Actualizamos el servicio MOCK para que sepa que estamos conectados de verdad
            googleService.isConnected = true
        }
    }, [])

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log("Login Exitoso:", codeResponse)
            localStorage.setItem('real_google_access_token', codeResponse.access_token)
            setIsConnected(true)
            setUserInfo({ email: 'Usuario Autenticado', lastSync: new Date().toLocaleString() })
            googleService.isConnected = true
        },
        onError: (error) => console.log('Login Falló:', error),
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets' // Permisos para Docs, Drive y Sheets
    });

    const handleConnect = () => {
        setIsLoading(true)
        handleGoogleLogin()
        setIsLoading(false)
    }

    const handleDisconnect = () => {
        setIsLoading(true)
        googleLogout();
        localStorage.removeItem('real_google_access_token')
        setIsConnected(false)
        setUserInfo(null)
        googleService.isConnected = false
        setIsLoading(false)
    }

    return (
        <div className="integraciones-container fade-in">
            <h2>Integraciones y Conexiones</h2>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
                Conecta tus servicios externos para automatizar tareas en la plataforma.
            </p>

            <div className="institutional-card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '40px', height: '40px', background: '#fff', borderRadius: '50%',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {/* Logo simple de Google simulado con CSS o usar un icono */}
                        <span style={{ color: '#4285F4', fontWeight: 'bold', fontSize: '20px' }}>G</span>
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>Google Workspace</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Drive, Docs y Sheets</p>
                    </div>
                </div>

                <div className="card-body" style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        Al conectar tu cuenta de Google, permitirás que Antigravity lea plantillas de Sheets
                        (ej. materiales de construcción) y genere documentos automáticamente en Google Docs
                        al finalizar procesos de contratación.
                    </p>

                    <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontWeight: 600 }}>Estado de la conexión:</span>
                                {isConnected ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10B981', marginTop: '5px' }}>
                                        <CheckCircle size={16} /> Conectado como {userInfo?.email}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6B7280', marginTop: '5px' }}>
                                        <AlertCircle size={16} /> No conectado
                                    </div>
                                )}

                                {isConnected && userInfo && (
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '5px' }}>
                                        Última sincronización: {userInfo.lastSync}
                                    </div>
                                )}
                            </div>

                            {isConnected ? (
                                <button
                                    className="btn-secondary"
                                    onClick={handleDisconnect}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <RefreshCw size={16} className="spin" /> : 'Desconectar'}
                                </button>
                            ) : (
                                <button
                                    className="btn-primary"
                                    onClick={handleConnect}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <RefreshCw size={16} className="spin" /> : 'Conectar con Google'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default IntegracionesPerfil

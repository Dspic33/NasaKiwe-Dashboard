import React, { useState } from 'react'
import { LogIn, AlertCircle, ShieldCheck } from 'lucide-react'
import { autenticarUsuario, USUARIOS } from '../../data/usuarios'
import { useGoogleLogin } from '@react-oauth/google'

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        // Pequeño delay simulado para UX
        setTimeout(() => {
            const user = autenticarUsuario(email, password)
            if (user) {
                onLogin(user)
            } else {
                setError('Credenciales incorrectas. Verifique correo y contraseña.')
                setIsLoading(false)
            }
        }, 600)
    }

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true)
            setError('')
            try {
                // Obtener datos del perfil de Google usando el access_token
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const userInfo = await userInfoResponse.json()
                
                if (userInfo && userInfo.email) {
                    // Buscar si el correo de Google existe en nuestra base de Mock
                    const user = USUARIOS.find(u => u.email === userInfo.email)
                    if (user) {
                        // Guardar token para integraciones futuras (Docs, Sheets, etc.)
                        localStorage.setItem('real_google_access_token', tokenResponse.access_token)
                        
                        // Autenticar en la app
                        const { password, ...userSeguro } = user
                        onLogin(userSeguro)
                    } else {
                        setError(`El correo (${userInfo.email}) no está registrado en el sistema.`)
                        setIsGoogleLoading(false)
                    }
                } else {
                    setError('No se pudo obtener el correo de Google.')
                    setIsGoogleLoading(false)
                }
            } catch (err) {
                console.error("Error obteniendo perfil de Google:", err)
                setError('Error al procesar el inicio de sesión con Google.')
                setIsGoogleLoading(false)
            }
        },
        onError: () => {
            setError('La autenticación con Google fue cancelada o falló.')
        }
    })

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            padding: '20px'
        }}>
            <div className="institutional-card" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '40px 30px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#e0f2fe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: '#2D5F3E'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ margin: '0 0 8px', color: '#1f2937', fontSize: '24px' }}>Nasa Kiwe</h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
                        Portal de Gestión de Contratos
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        color: '#991b1b',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}>
                        <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label
                            htmlFor="institutional-email"
                            style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}
                        >
                            Correo Institucional
                        </label>
                        <input
                            id="institutional-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@nasakiwe.gov.co"
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="institutional-password"
                            style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}
                        >
                            Contraseña
                        </label>
                        <input
                            id="institutional-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading || isGoogleLoading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '8px'
                        }}
                    >
                        {isLoading ? (
                            'Iniciando...'
                        ) : (
                            <>
                                <LogIn size={18} /> Iniciar Sesión
                            </>
                        )}
                    </button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>O ingresa con</span>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        disabled={isLoading || isGoogleLoading}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontWeight: '500',
                            fontSize: '15px',
                            cursor: (isLoading || isGoogleLoading) ? 'not-allowed' : 'pointer',
                            opacity: (isLoading || isGoogleLoading) ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        {isGoogleLoading ? (
                            <span style={{ color: '#6b7280' }}>Conectando con Google...</span>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                    <strong>Credenciales de prueba:</strong><br />
                    Asesor: <code>asesor@nasakiwe.gov.co</code><br />
                    Inspector: <code>inspector@nasakiwe.gov.co</code><br />
                    Residente: <code>residente@nasakiwe.gov.co</code><br />
                    Jurídico: <code>juridico@nasakiwe.gov.co</code><br />
                    Directora: <code>directora@nasakiwe.gov.co</code><br />
                    <em>Password para todos: <code>123</code></em>
                </div>
            </div>
        </div>
    )
}

export default LoginPage

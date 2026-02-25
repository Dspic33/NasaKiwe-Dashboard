import React, { useState } from 'react'
import { LogIn, AlertCircle, ShieldCheck } from 'lucide-react'
import { autenticarUsuario } from '../../data/usuarios'

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Correo Institucional
                        </label>
                        <input
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
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Contraseña
                        </label>
                        <input
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
                        disabled={isLoading}
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
                </form>

                <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                    <strong>Credenciales de prueba:</strong><br />
                    Asesor: <code>asesor@nasakiwe.gov.co</code><br />
                    Jurídico: <code>juridico@nasakiwe.gov.co</code><br />
                    Directora: <code>directora@nasakiwe.gov.co</code><br />
                    <em>Password para todos: <code>123</code></em>
                </div>
            </div>
        </div>
    )
}

export default LoginPage

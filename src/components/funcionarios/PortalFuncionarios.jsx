import React from 'react'
import {
    Building,
    LineChart,
    Scale,
    Coins,
    ShieldCheck,
    Users,
    Sprout,
    Map,
    HardHat,
    Share2
} from 'lucide-react'
import './Portal.css'

const PortalFuncionarios = ({ onSelectProfile }) => {
    const dependencias = [
        { name: 'Dirección General', icon: <Building />, color: '#B91C1C' },
        { name: 'Planeación', icon: <LineChart />, color: '#DC2626' },
        { name: 'Gestión Jurídica y Contratación', icon: <Scale />, color: '#EF4444' },
        { name: 'Gestión Financiera', icon: <Coins />, color: '#B91C1C' },
        { name: 'Control Interno', icon: <ShieldCheck />, color: '#DC2626' },
        { name: 'Talento Humano', icon: <Users />, color: '#EF4444' },
        { name: 'Desarrollo Productivo', icon: <Sprout />, color: '#B91C1C' },
        { name: 'Adquisición de Tierras', icon: <Map />, color: '#DC2626' },
        { name: 'Obras de Infraestructura', icon: <HardHat />, color: '#EF4444' },
        { name: 'Comunicación Institucional', icon: <Share2 />, color: '#B91C1C' },
    ]

    return (
        <div className="portal-view">
            <section className="portal-hero">
                <img src="/assets/imagenes/imagen3.png" alt="Portal Background" className="hero-video" />
                <div className="hero-content">
                    <h1>Portal del Funcionario</h1>
                    <p>Acceso centralizado a herramientas, normativas y gestión institucional.</p>
                </div>
            </section>

            <div className="dependencias-grid">
                {dependencias.map((dep, index) => (
                    <div
                        key={index}
                        className="dependencia-card institutional-card"
                        onClick={() => {
                            if (dep.name === 'Obras de Infraestructura') onSelectProfile('infra-areas')
                            if (dep.name === 'Talento Humano') onSelectProfile('talento')
                        }}
                        style={{ borderTop: `4px solid ${dep.color}` }}
                    >
                        <div className="dep-icon" style={{ color: dep.color }}>
                            {dep.icon}
                        </div>
                        <h3>{dep.name}</h3>
                        <p className="dep-stats">Gestionar área y personal</p>
                        {(dep.name === 'Obras de Infraestructura' || dep.name === 'Talento Humano') && (
                            <span className="active-indicator">Ver Perfiles</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PortalFuncionarios

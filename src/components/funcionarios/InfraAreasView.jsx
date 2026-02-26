import React from 'react'
import { Home, GraduationCap, MapPin, Activity, PenTool, ChevronRight, Users, Briefcase } from 'lucide-react'
import { AREAS_INFRAESTRUCTURA, EQUIPO_APOYO } from '../../data/areas'
import './Portal.css'

const InfraAreasView = ({ onSelectArea, onSelectProfile }) => {
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Home': return <Home />
            case 'GraduationCap': return <GraduationCap />
            case 'Road': return <MapPin />
            case 'Activity': return <Activity />
            case 'PenTool': return <PenTool />
            default: return <Home />
        }
    }

    return (
        <div className="portal-view">
            <section className="portal-hero">
                <img src="/assets/imagenes/imagen2.webp" alt="Banner" className="hero-video" />
                <div className="hero-content">
                    <h1>Obras de Infraestructura</h1>
                    <p>Gestión técnica y administrativa por áreas de intervención.</p>
                </div>
            </section>

            <div className="section-title">
                <h2>Áreas Técnicas</h2>
            </div>

            <div className="dependencias-grid">
                {AREAS_INFRAESTRUCTURA.map((area) => (
                    <div
                        key={area.id}
                        className="dependencia-card institutional-card"
                        onClick={() => onSelectArea(area)}
                        style={{ borderTop: `4px solid var(--color-rojo-primario)` }}
                    >
                        <div className="dep-icon" style={{ color: 'var(--color-rojo-primario)' }}>
                            {getIcon(area.icono)}
                        </div>
                        <h3>{area.titulo}</h3>
                        <p className="dep-stats">{area.equipo.length} Integrantes</p>
                        <span className="active-indicator">Ver Equipo <ChevronRight size={14} /></span>
                    </div>
                ))}
            </div>

            <div className="section-title" style={{ marginTop: '48px' }}>
                <h2>Apoyo Administrativo y Financiero</h2>
            </div>

            <div className="dependencias-grid">
                {EQUIPO_APOYO.map((p) => (
                    <div
                        key={p.id}
                        className="dependencia-card institutional-card"
                        onClick={() => onSelectProfile(p.id)}
                        style={{ borderTop: `4px solid var(--color-amarillo-institucional)` }}
                    >
                        <div className="dep-icon" style={{ color: 'var(--color-amarillo-institucional)' }}>
                            {p.id === 'secretaria' ? <Users /> : <Briefcase />}
                        </div>
                        <h3>{p.nombre}</h3>
                        <p className="dep-stats">{p.cargo}</p>
                        <span className="active-indicator" style={{ color: 'var(--color-rojo-primario)' }}>Ver Perfil <ChevronRight size={14} /></span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default InfraAreasView

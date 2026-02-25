import React from 'react'
import { ChevronLeft, User, Mail, Briefcase } from 'lucide-react'
import './Portal.css'

const TeamView = ({ area, onBack, onSelectMember }) => {
    return (
        <div className="portal-view">
            <div
                className="back-navigation"
                onClick={onBack}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => e.key === 'Enter' && onBack()}
                aria-label="Volver a la vista de áreas"
            >
                <ChevronLeft size={20} aria-hidden="true" />
                <span>Volver a Áreas</span>
            </div>

            <section className="portal-hero">
                {area.banner && <img src={area.banner} alt={area.titulo} className="hero-video" />}
                <div className="hero-content">
                    <h1>{area.titulo}</h1>
                    <p>{area.descripcion}</p>
                </div>
            </section>

            <div className="section-title">
                <h2>Equipo de Trabajo</h2>
            </div>

            <div className="team-grid">
                {area.equipo.map((member) => (
                    <div
                        key={member.id}
                        className="member-card institutional-card"
                        onClick={() => onSelectMember(member.id)}
                        style={{ borderTop: '4px solid var(--color-rojo-primario)' }}
                        role="button"
                        tabIndex="0"
                        onKeyDown={(e) => e.key === 'Enter' && onSelectMember(member.id)}
                        aria-label={`Perfil de ${member.nombre}, ${member.cargo}`}
                    >
                        <div className="member-avatar-box">
                            <img src={member.foto} alt={`Foto de ${member.nombre}`} className="member-photo" />
                        </div>
                        <div className="member-info-box">
                            <h3>{member.nombre}</h3>
                            <p className="member-role">{member.cargo}</p>
                            <div className="member-actions">
                                <span className="view-profile-link">Ver Perfil Técnico</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TeamView

import React from 'react'
import { MapPin, Mail, Phone, Clock } from 'lucide-react'

const ProfileHero = ({ roleData, areaName }) => {
    return (
        <section className="profile-hero institutional-card">
            <div className="profile-header-info">
                <div className="profile-avatar-container">
                    <div className="profile-avatar">
                        <img src={roleData.foto} alt={roleData.nombre} />
                    </div>
                    <span className="status-badge">ACTIVO</span>
                </div>

                <div className="profile-details">
                    <div className="title-group">
                        <h1>{roleData.nombre}</h1>
                        <span className="area-badge">
                            {areaName || roleData.area}
                        </span>
                    </div>
                    <p className="cargo-text">{roleData.cargo}</p>

                    <div className="contact-grid">
                        <div className="contact-item">
                            <MapPin size={16} />
                            <span>Sede: {roleData.sede || 'Popayán'}</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>{roleData.email}</span>
                        </div>
                        <div className="contact-item">
                            <Phone size={16} />
                            <span>{roleData.telefono} (Ext. {roleData.extension})</span>
                        </div>
                        <div className="contact-item">
                            <Clock size={16} />
                            <span>Horario: {roleData.horario}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProfileHero

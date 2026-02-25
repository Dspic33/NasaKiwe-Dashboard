import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import './Profile.css'
import QuizComponent from '../common/QuizComponent'
import { QUIZZES } from '../../data/quizzes'
import { FORMATOS_NASA_KIWE } from '../../data/formatos'
import { FUNCIONES_ARQUITECTO } from '../../data/funciones'

// Atomic Components
import ProfileHero from './ProfileHero'
import ProfileTabs from './ProfileTabs'
import StrategicAxes from './StrategicAxes'
import FormatList from './FormatList'

const ArchitectProfile = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('funciones')

    const roleData = {
        id: 'perfil',
        nombre: 'Arq Juan Camilo Manzano T.',
        cargo: 'Asesor de Infraestructura y Obras',
        area: 'Obras de Infraestructura',
        email: 'infraestructura@nasakiwe.gov.co',
        telefono: '+57 60(2) 8373075',
        extension: '204',
        foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
        sede: 'Sede Principal - Popayán',
        horario: 'Lunes a Viernes 8:00 AM - 6:00 PM',
        funciones: FUNCIONES_ARQUITECTO
    }

    return (
        <div className="profile-view">
            <div className="back-navigation" onClick={onBack}>
                <ChevronLeft size={20} />
                <span>Volver al Equipo</span>
            </div>

            <ProfileHero roleData={roleData} />

            <div className="profile-tabs-container">
                <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="tab-content">
                    {activeTab === 'funciones' && (
                        <div className="funciones-grid">
                            <div className="funciones-intro">
                                <h2>Análisis de Funciones</h2>
                                <p>Resumen agrupado por ejes estratégicos según el manual de funciones institucional.</p>
                            </div>
                            <StrategicAxes strategicAxes={roleData.funciones} />
                        </div>
                    )}

                    {activeTab === 'formatos' && (
                        <FormatList formats={FORMATOS_NASA_KIWE.perfil} />
                    )}

                    {activeTab === 'capacitacion' && (
                        <QuizComponent quizData={QUIZZES.perfil} />
                    )}

                    {activeTab === 'test' && (
                        <QuizComponent quizData={QUIZZES.perfil} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ArchitectProfile

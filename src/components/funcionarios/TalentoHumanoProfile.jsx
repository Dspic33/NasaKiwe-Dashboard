import React, { useState } from 'react'
import './Profile.css'
import QuizComponent from '../common/QuizComponent'
import { QUIZZES } from '../../data/quizzes'
import { FORMATOS_NASA_KIWE } from '../../data/formatos'
import { FUNCIONES_TALENTO_HUMANO } from '../../data/talentoHumano'

// Atomic Components
import ProfileHero from './ProfileHero'
import ProfileTabs from './ProfileTabs'
import StrategicAxes from './StrategicAxes'
import FormatList from './FormatList'

const TalentoHumanoProfile = () => {
    const [activeTab, setActiveTab] = useState('funciones')

    const roleData = {
        id: 'talento',
        nombre: 'Dra. María Fernanda Castro',
        cargo: 'Coordinadora de Talento Humano',
        area: 'Talento Humano',
        email: 'talentohumano@nasakiwe.gov.co',
        telefono: '+57 60(2) 8373075',
        extension: '105',
        foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        sede: 'Sede Principal - Popayán',
        horario: 'Lunes a Viernes 8:00 AM - 6:00 PM',
        funciones: FUNCIONES_TALENTO_HUMANO
    }

    return (
        <div className="profile-view">
            <ProfileHero roleData={roleData} />

            <div className="profile-tabs-container">
                <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="tab-content">
                    {activeTab === 'funciones' && (
                        <div className="funciones-grid">
                            <div className="funciones-intro">
                                <h2>Análisis de Funciones del Área</h2>
                                <p>Ejes estratégicos de la gestión de Talento Humano en la Corporación Nasa Kiwe.</p>
                            </div>
                            <StrategicAxes strategicAxes={roleData.funciones} />
                        </div>
                    )}

                    {activeTab === 'formatos' && (
                        <FormatList formats={FORMATOS_NASA_KIWE.talento} />
                    )}

                    {activeTab === 'capacitacion' && (
                        <QuizComponent quizData={QUIZZES.talento} />
                    )}

                    {activeTab === 'test' && (
                        <QuizComponent quizData={QUIZZES.talento} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default TalentoHumanoProfile

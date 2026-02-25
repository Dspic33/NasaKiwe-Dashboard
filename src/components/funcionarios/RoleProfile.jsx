import React, { useState } from 'react'
import { ChevronLeft, Briefcase } from 'lucide-react'
import './Profile.css'
import QuizComponent from '../common/QuizComponent'
import { QUIZZES } from '../../data/quizzes'
import { FORMATOS_NASA_KIWE } from '../../data/formatos'

// Atomic Components
import ProfileHero from './ProfileHero'
import ProfileTabs from './ProfileTabs'
import StrategicAxes from './StrategicAxes'
import FormatList from './FormatList'

const RoleProfile = ({ roleData, onBack }) => {
    if (!roleData) return null;
    const [activeTab, setActiveTab] = useState('funciones')

    const quizData = QUIZZES[roleData.id] || QUIZZES.perfil
    const formatsData = FORMATOS_NASA_KIWE[roleData.id] || FORMATOS_NASA_KIWE.talento

    // Normalize functions for StrategicAxes component
    const normalizedAxes = Array.isArray(roleData.funciones) && typeof roleData.funciones[0] === 'object'
        ? roleData.funciones.map((axis, index) => ({
            id: index + 1,
            titulo: axis.titulo,
            funciones: axis.items
        }))
        : [{
            id: 1,
            titulo: "Manual de Funciones",
            funciones: roleData.funciones || []
        }]

    return (
        <div className="profile-view">
            <div className="back-navigation" onClick={onBack}>
                <ChevronLeft size={20} />
                <span>Volver</span>
            </div>

            <ProfileHero roleData={roleData} />

            <div className="profile-tabs-container">
                <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="tab-content">
                    {activeTab === 'funciones' && (
                        <div className="funciones-grid">
                            <div className="funciones-intro">
                                <h2>Responsabilidades Institucionales</h2>
                                <p>Manual de funciones detallado para el cargo de {roleData.cargo}.</p>
                            </div>
                            <StrategicAxes strategicAxes={normalizedAxes} />
                        </div>
                    )}

                    {activeTab === 'formatos' && (
                        <FormatList formats={formatsData} />
                    )}

                    {activeTab === 'capacitacion' && (
                        <QuizComponent quizData={quizData} />
                    )}

                    {/* Compatibility with previous 'test' tab name if any */}
                    {activeTab === 'test' && (
                        <QuizComponent quizData={quizData} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default RoleProfile

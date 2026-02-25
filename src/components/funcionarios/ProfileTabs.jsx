import React from 'react'
import { CheckCircle2, FileCheck, GraduationCap } from 'lucide-react'

const ProfileTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'funciones', label: 'Funciones', icon: <CheckCircle2 size={18} /> },
        { id: 'formatos', label: 'Formatos', icon: <FileCheck size={18} /> },
        { id: 'capacitacion', label: 'Capacitación', icon: <GraduationCap size={18} /> },
    ]

    return (
        <div className="tabs-header">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

export default ProfileTabs

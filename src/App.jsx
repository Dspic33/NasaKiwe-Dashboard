import React, { useState, useEffect } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import ArchitectProfile from './components/funcionarios/ArchitectProfile'
import PortalFuncionarios from './components/funcionarios/PortalFuncionarios'
import TalentoHumanoProfile from './components/funcionarios/TalentoHumanoProfile'
import { EQUIPO_APOYO } from './data/areas'
import { ASESOR_FUNCTIONS } from './data/asesor'
import { FUNCIONES_INGENIERO_ELECTRICO } from './data/funciones'
import InfraAreasView from './components/funcionarios/InfraAreasView'
import TeamView from './components/funcionarios/TeamView'
import RoleProfile from './components/funcionarios/RoleProfile'
import ContratosView from './components/contratos/ContratosView'
import ContratacionWizard from './components/contratos/ContratacionWizard'
import LoginPage from './components/auth/LoginPage'
import { MOCK_CONTRATOS, ESTADOS_CONTRATACION, ROLES_USUARIO } from './data/contratosMock'
import { supabase } from './services/supabaseClient'


function App() {
    const [view, setView] = useState('portal')
    const [contratos, setContratos] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedContrato, setSelectedContrato] = useState(null)
    const [selectedArea, setSelectedArea] = useState(null)
    const [selectedRole, setSelectedRole] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    // Cargar contratos desde Supabase al iniciar
    useEffect(() => {
        const loadContratos = async () => {
            setIsLoading(true)
            try {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                const isConfigured = supabaseUrl && !supabaseUrl.includes('TU_PROYECTO')

                if (isConfigured) {
                    const { data, error } = await supabase
                        .from('contratos')
                        .select('*')
                        .order('created_at', { ascending: false })

                    if (error) throw error

                    // Si la BD está vacía, sembrar con datos de ejemplo
                    if (data && data.length > 0) {
                        setContratos(data)
                    } else {
                        // Sembrar datos de ejemplo en Supabase
                        const { data: seeded } = await supabase
                            .from('contratos')
                            .insert(MOCK_CONTRATOS)
                            .select()
                        setContratos(seeded || MOCK_CONTRATOS)
                    }
                } else {
                    // Supabase no configurado: usar localStorage como fallback
                    console.warn('Supabase no configurado. Usando localStorage.')
                    const saved = localStorage.getItem('nasa_kiwe_contratos')
                    setContratos(saved ? JSON.parse(saved) : MOCK_CONTRATOS)
                }
            } catch (err) {
                console.error('Error cargando contratos:', err)
                // Fallback a localStorage
                const saved = localStorage.getItem('nasa_kiwe_contratos')
                setContratos(saved ? JSON.parse(saved) : MOCK_CONTRATOS)
            } finally {
                setIsLoading(false)
            }
        }

        loadContratos()
    }, [])

    // Al iniciar, intentar recuperar la sesión de localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('nasa_kiwe_user');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Error parsing saved user", e);
            }
        }
    }, []);


    const handleLogin = (user) => {
        setCurrentUser(user);
        localStorage.setItem('nasa_kiwe_user', JSON.stringify(user));
        // Redirigir al dashboard de contratos si inician sesión
        setView('contratos');

    }

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('nasa_kiwe_user');
        setView('login');
    }

    const handleUpdateContrato = async (updatedContrato, shouldNavigate = true) => {
        if (!updatedContrato) {
            if (shouldNavigate) setView('contratos');
            return;
        }

        // Guardar en Supabase
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            const isConfigured = supabaseUrl && !supabaseUrl.includes('TU_PROYECTO')

            if (isConfigured) {
                const { error } = await supabase
                    .from('contratos')
                    .upsert({ ...updatedContrato, ultima_actualizacion: new Date().toISOString() })
                if (error) throw error
            }
        } catch (err) {
            console.error('Error guardando en Supabase:', err)
        }

        // Actualizar estado local (siempre)
        setContratos(prev => {
            const index = prev.findIndex(c => c.id === updatedContrato.id);
            let newList;
            if (index !== -1) {
                newList = [...prev];
                newList[index] = { ...newList[index], ...updatedContrato };
            } else {
                const newId = updatedContrato.id || Math.random().toString(36).substr(2, 9);
                newList = [{ ...updatedContrato, id: newId }, ...prev];
            }
            // Guardar en localStorage como cache
            localStorage.setItem('nasa_kiwe_contratos', JSON.stringify(newList))
            return newList
        });
        if (shouldNavigate) setView('contratos');
    }


    const renderView = () => {
        if (view === 'portal') {
            return <PortalFuncionarios onSelectProfile={(profile) => {
                if (profile === 'contratos') {
                    // Si intenta ir a contratos sin sesión, llevarlo al login
                    setView(currentUser ? 'contratos' : 'login');
                } else {
                    setView(profile);
                }
            }} />
        }

        if (view === 'login') {
            return <LoginPage onLogin={handleLogin} />
        }

        // Proteger el resto de las rutas con login (solo para demostración, aplicamos a contratos principalmente)
        // En una app real, podrías separar las rutas públicas de las privadas.
        if (!currentUser && (view === 'contratos' || view === 'wizard')) {
            return <LoginPage onLogin={handleLogin} />
        }

        switch (view) {
            case 'contratos':
                return <ContratosView
                    contratos={contratos}
                    currentUser={currentUser}
                    onNavigate={setView}
                    onStartWizard={(contrato) => {
                        setSelectedContrato(contrato)
                        setView('wizard')
                    }}
                />
            case 'wizard':
                return <ContratacionWizard
                    initialContrato={selectedContrato}
                    currentUser={currentUser}
                    onNavigate={setView}
                    onComplete={handleUpdateContrato}
                />
            case 'infra-areas':
                return <InfraAreasView
                    onSelectArea={(area) => {
                        setSelectedArea(area)
                        setView('infra-team')
                    }}
                    onSelectProfile={(roleId) => {
                        const role = EQUIPO_APOYO.find(r => r.id === roleId)
                        setSelectedRole(role)
                        setView('role-profile')
                    }}
                />
            case 'infra-team':
                if (!selectedArea) {
                    setView('infra-areas')
                    return null
                }
                return <TeamView
                    area={selectedArea}
                    onBack={() => setView('infra-areas')}
                    onSelectMember={(memberId) => {
                        if (memberId === 'perfil') {
                            setView('perfil')
                        } else {
                            const member = selectedArea.equipo.find(m => m.id === memberId)
                            const supportRole = EQUIPO_APOYO.find(r => r.id === memberId)

                            const memberFunctions = memberId === 'asesor' ? ASESOR_FUNCTIONS
                                : memberId === 'ingeniero_electrico' ? FUNCIONES_INGENIERO_ELECTRICO
                                    : (supportRole?.funciones || [
                                        'Ejecución técnica según el manual de funciones.',
                                        'Seguimiento a cronogramas de obra.',
                                        'Elaboración de informes de avance.',
                                        'Coordinación con el equipo de área.'
                                    ])

                            setSelectedRole({
                                ...member,
                                area: supportRole?.area || selectedArea.titulo,
                                email: supportRole?.email || 'tecnico.infra@nasakiwe.gov.co',
                                funciones: memberFunctions
                            })
                            setView('role-profile')
                        }
                    }}
                />
            case 'perfil':
                return <ArchitectProfile onBack={() => setView('infra-team')} />
            case 'talento':
                return <TalentoHumanoProfile />
            case 'role-profile':
                return <RoleProfile
                    roleData={selectedRole}
                    onBack={() => {
                        if (EQUIPO_APOYO.some(r => r.id === selectedRole?.id)) {
                            setView('infra-areas')
                        } else {
                            setView('infra-team')
                        }
                    }}
                />
            default:
                return <PortalFuncionarios onSelectProfile={(profile) => setView(profile)} />
        }
    }

    // Ocultar el DashboardLayout completo si estamos en login
    if (view === 'login') {
        return renderView()
    }

    let unreadNotifications = 0;
    if (currentUser) {
        if (currentUser.rol === ROLES_USUARIO.ASESOR_VIVIENDA) {
            unreadNotifications = contratos.filter(c => c.estado === ESTADOS_CONTRATACION.DEVUELTO_CORRECCIONES).length;
        } else if (currentUser.rol === ROLES_USUARIO.JURIDICO) {
            unreadNotifications = contratos.filter(c => c.estado === ESTADOS_CONTRATACION.EN_REVISION_JURIDICA).length;
        } else if (currentUser.rol === ROLES_USUARIO.DIRECTORA) {
            unreadNotifications = contratos.filter(c => c.estado === ESTADOS_CONTRATACION.EN_REVISION_DIRECTORA).length;
        }
    }

    // Le pasamos currenUser y onLogout al DashboardLayout para poder mostrar el botón de salir
    return (
        <DashboardLayout
            currentView={view}
            onNavigate={(v) => setView(v === 'contratos' && !currentUser ? 'login' : v)}
            currentUser={currentUser}
            onLogout={handleLogout}
            unreadNotifications={unreadNotifications}
        >
            {renderView()}
        </DashboardLayout>
    )
}

export default App


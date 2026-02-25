import React from 'react'
import { CheckCircle2 } from 'lucide-react'

const StrategicAxes = ({ strategicAxes }) => {
    if (!strategicAxes) return null

    return (
        <div className="axes-container">
            {strategicAxes.map((axe) => (
                <div key={axe.id} className="eje-card institutional-card" style={{ borderTop: '4px solid var(--color-rojo-primario)' }}>
                    <div className="eje-header">
                        <div className="eje-id">{axe.id}</div>
                        <h3>{axe.titulo}</h3>
                    </div>
                    <ul className="funciones-list">
                        {axe.funciones.map((func, idx) => (
                            <li key={idx}>
                                <CheckCircle2 size={14} className="check-icon" />
                                {func}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}

export default StrategicAxes

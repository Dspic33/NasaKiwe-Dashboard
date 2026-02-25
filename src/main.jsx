import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './styles/global.css'

// El Client ID se lee de las variables de entorno de Vite
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!clientId || clientId.includes('pega_tu_client_id')) {
    console.error("❌ ERROR: VITE_GOOGLE_CLIENT_ID no configurado en el entorno (Netlify/Render o .env)");
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={clientId}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)

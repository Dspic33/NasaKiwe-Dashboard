import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './styles/global.css'

// Se usa una variable de entorno, o un valor de respaldo temporal si no está configurado
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'pega_tu_client_id_aqui.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={clientId}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)

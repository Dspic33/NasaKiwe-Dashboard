import { google } from 'googleapis';

// Instancia cacheada del Oauth2 Client para no recrearla en cada petición
let oAuth2Client = null;

/**
 * Inicializa y devuelve un cliente OAuth2 autenticado con el Refresh Token del Admin.
 * Se sigue llamando getServiceAccountAuth por compatibilidad con sheetsService y docsService,
 * aunque ahora usa un Refresh Token de usuario (Cero Fricción real).
 */
export async function getServiceAccountAuth() {
    if (oAuth2Client) {
        return oAuth2Client;
    }

    try {
        const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
        const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
        
        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
            console.error("❌ CRÍTICO: Faltan VITE_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN en .env");
            throw new Error("Credenciales OAuth2 de Admin no configuradas en el servidor.");
        }

        oAuth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET
        );

        oAuth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });

        console.log("🔄 Autenticando con Google OAuth2 (Admin Refresh Token)...");
        
        // La librería de Google auto-renovará el access_token cuando lo necesite.
        // Opcional: forzamos obtener token nuevo ahora para verificar conectividad al inicio.
        const res = await oAuth2Client.getAccessToken();
        if(!res.token) throw new Error("No se pudo regenerar el Access Token con el Refresh Token proporcionado.");

        console.log("✅ Google OAuth2 Client autenticado exitosamente.");

        return oAuth2Client;
    } catch (error) {
        console.error("❌ Error inicializando Google OAuth2 Client:", error.message);
        throw error;
    }
}

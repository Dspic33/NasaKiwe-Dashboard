/**
 * tokenService.js
 * Gestiona el almacenamiento y renovación automática del refresh_token de Google OAuth2.
 * Los tokens se guardan en la tabla `google_tokens` de Supabase.
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// ID de usuario institucional fijo (ya que la app solo tiene un usuario Google conectado)
const SYSTEM_USER_ID = 'nasakiwe_system';

/** Crea un cliente OAuth2 configurado */
export function createOAuth2Client() {
    return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/** Genera la URL de consentimiento de Google (con solicitud de refresh_token) */
export function getAuthUrl() {
    const oauth2Client = createOAuth2Client();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Fuerza que Google siempre devuelva refresh_token
        scope: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    });
}

/** Canjea el código de autorización por tokens y guarda el refresh_token */
export async function exchangeCodeForTokens(code) {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
        await saveRefreshToken(SYSTEM_USER_ID, tokens.refresh_token);
        console.log('✅ refresh_token guardado en Supabase.');
    } else {
        console.warn('⚠️ Google no devolvió refresh_token. Ya existía una autorización previa.');
    }

    return tokens;
}

/** Guarda o actualiza el refresh_token en Supabase */
export async function saveRefreshToken(userId, refreshToken) {
    const { error } = await supabase
        .from('google_tokens')
        .upsert(
            { user_id: userId, refresh_token: refreshToken, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
        );

    if (error) throw new Error(`Error guardando refresh_token: ${error.message}`);
}

/** Lee el refresh_token de Supabase */
export async function getRefreshToken(userId = SYSTEM_USER_ID) {
    const { data, error } = await supabase
        .from('google_tokens')
        .select('refresh_token')
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;
    return data.refresh_token;
}

/**
 * Obtiene un access_token válido.
 * Si el almacenado expiró, lo renueva automáticamente con el refresh_token.
 * @returns {string|null} access_token válido o null si no hay refresh_token guardado
 */
export async function getValidAccessToken() {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log('🔄 access_token renovado automáticamente.');
        return credentials.access_token;
    } catch (err) {
        console.error('❌ Error renovando access_token:', err.message);
        return null;
    }
}

/** Verifica si el sistema tiene un refresh_token configurado */
export async function isGoogleConnected() {
    const token = await getRefreshToken();
    return !!token;
}

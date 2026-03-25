/**
 * authRoutes.js
 * Rutas para el flujo OAuth2 de Google con refresh_token persistente.
 * Estas rutas NO requieren auth middleware.
 */

import express from 'express';
import { getAuthUrl, exchangeCodeForTokens, isGoogleConnected } from '../services/tokenService.js';

const router = express.Router();

/**
 * GET /auth/google/login
 * Redirige al usuario al consentimiento de Google OAuth2.
 */
router.get('/login', (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
});

/**
 * GET /auth/google/callback
 * Google redirige aquí con el `code` de autorización.
 * Canjeamos el code por tokens y guardamos el refresh_token en Supabase.
 */
router.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        console.error('❌ Google OAuth error:', error);
        return res.redirect(`${getFrontendUrl()}?google_auth=error&reason=${error}`);
    }

    if (!code) {
        return res.status(400).send('Código de autorización no recibido.');
    }

    try {
        const tokens = await exchangeCodeForTokens(code);
        const accessToken = tokens.access_token;

        // Redirigir al frontend con el access_token en la URL (para guardarlo en localStorage)
        const frontendUrl = getFrontendUrl();
        res.redirect(`${frontendUrl}?google_auth=success&access_token=${accessToken}`);
    } catch (err) {
        console.error('❌ Error en OAuth callback:', err.message);
        res.redirect(`${getFrontendUrl()}?google_auth=error&reason=token_exchange_failed`);
    }
});

/**
 * GET /auth/google/status
 * Verifica si el sistema tiene un refresh_token guardado.
 */
router.get('/status', async (req, res) => {
    try {
        const connected = await isGoogleConnected();
        res.json({ connected });
    } catch (err) {
        res.json({ connected: false, error: err.message });
    }
});

function getFrontendUrl() {
    return process.env.NODE_ENV === 'production'
        ? 'https://nasakiwe.netlify.app'
        : 'http://localhost:5173';
}

export default router;

/**
 * Validador de tokens de Google para asegurar que pertenecen al dominio institucional.
 */
async function validateGoogleToken(accessToken) {
    if (!accessToken) return false;
    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
        const info = await response.json();
        // Verificar que el token pertenezca al dominio correcto o tenga el HD institucional
        return !info.error && (info.email?.endsWith('@nasakiwe.gov.co') || info.hd === 'nasakiwe.gov.co');
    } catch (e) {
        return false;
    }
}

/**
 * Middleware para validar que la petición trae un token válido de NASA KIWE.
 */
export async function authMiddleware(req, res, next) {
    const { accessToken } = req.body;
    const token = accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "No se proporcionó un Access Token." });
    }

    const isValid = await validateGoogleToken(token);
    if (!isValid) {
        console.warn(`🛑 Acceso denegado: Token inválido o fuera de dominio.`);
        return res.status(403).json({ error: "Acceso denegado. Solo cuentas institucionales @nasakiwe.gov.co" });
    }

    next();
}

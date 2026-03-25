

/**
 * Middleware para validar que la petición trae un token válido de NASA KIWE.
 */
export async function authMiddleware(req, res, next) {
    const { accessToken } = req.body;
    const token = accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "No se proporcionó un Access Token." });
    }

    // Permitir cualquier Gmail personal si está habilitada la flag (para pruebas en Render)
    const allowPersonal = process.env.ALLOW_PERSONAL_GMAIL === 'true';
    
    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
        const info = await response.json();
        
        if (info.error) {
            return res.status(401).json({ error: "Token de Google inválido o expirado." });
        }

        const isInstitutional = info.email?.endsWith('@nasakiwe.gov.co') || info.hd === 'nasakiwe.gov.co';
        
        if (!isInstitutional && !allowPersonal) {
            console.warn(`🛑 Acceso denegado para ${info.email}: No institucional.`);
            return res.status(403).json({ 
                error: "Acceso denegado. Solo cuentas @nasakiwe.gov.co permitidas por seguridad.",
                emailRecibido: info.email
            });
        }

        console.log(`✅ Acceso concedido: ${info.email} (${isInstitutional ? 'Institucional' : 'Personal Permitido'})`);
        next();
    } catch (e) {
        console.error("❌ Error validando token:", e.message);
        res.status(500).json({ error: "Error interno validando autenticación con Google." });
    }
}

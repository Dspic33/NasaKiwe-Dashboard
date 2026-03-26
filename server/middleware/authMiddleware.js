

/**
 * Middleware para validar que la petición viene de un usuario autenticado.
 * Anteriormente validaba el token OAuth de Google. Ahora que usamos Service Account,
 * este middleware debería validar el JWT de Supabase del usuario actual.
 */
export async function authMiddleware(req, res, next) {
    // TODO: Implementar validación de JWT de Supabase (req.headers.authorization)
    // Por ahora, permitimos pasar a las rutas ya que la seguridad de Google
    // se maneja internamente con la Service Account.
    next();
}

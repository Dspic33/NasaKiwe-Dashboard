import { describe, it, expect, vi } from 'vitest';
import { authMiddleware } from '../middleware/authMiddleware.js';

describe('authMiddleware', () => {
    it('debe denegar el acceso si no hay token', async () => {
        const req = { body: {}, headers: {} };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        const next = vi.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
        expect(next).not.toHaveBeenCalled();
    });

    it('debe denegar el acceso si el token es de un dominio externo', async () => {
        const req = { body: { accessToken: 'externo-token' } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        const next = vi.fn();

        // Mock de fetch global
        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ email: 'user@gmail.com', hd: 'gmail.com' })
        });

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('debe permitir el acceso si el token es del dominio @nasakiwe.gov.co', async () => {
        const req = { body: { accessToken: 'valido-token' } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        const next = vi.fn();

        global.fetch = vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ email: 'funcionario@nasakiwe.gov.co', hd: 'nasakiwe.gov.co' })
        });

        await authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});

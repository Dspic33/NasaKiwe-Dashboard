import { describe, it, expect, vi } from 'vitest';
import * as docsService from '../services/docsService.js';

// Mock de servicios dependientes
vi.mock('../services/driveService.js', () => ({
    getOrCreateFolder: vi.fn().mockResolvedValue('fake-folder-id'),
    getOrCreateFile: vi.fn().mockResolvedValue('fake-doc-id')
}));

vi.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: class { setCredentials = vi.fn(); }
        },
        drive: vi.fn().mockReturnValue({
            permissions: { create: vi.fn().mockResolvedValue({}) }
        }),
        docs: vi.fn().mockReturnValue({
            documents: {
                batchUpdate: vi.fn().mockResolvedValue({}),
                get: vi.fn().mockResolvedValue({ data: { body: { content: [] } } })
            }
        }),
        sheets: vi.fn().mockReturnValue({
            spreadsheets: { values: { get: vi.fn().mockResolvedValue({ data: { values: [] } }) } }
        })
    }
}));

describe('docsService', () => {
    it('debe generar un documento y retornar el ID y la URL correcta', async () => {
        const result = await docsService.generateDocument(
            'fake-token',
            'fake-template',
            { nombre: 'Test', numero: '123' },
            'Doc Prueba'
        );

        expect(result.documentId).toBe('fake-doc-id');
        expect(result.documentUrl).toContain('fake-doc-id');
    });
});

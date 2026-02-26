import { describe, it, expect, vi } from 'vitest';
import * as sheetsService from '../services/sheetsService.js';

// Mock de googleapis
vi.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: class {
                setCredentials = vi.fn();
            }
        },
        sheets: vi.fn().mockReturnValue({
            spreadsheets: {
                get: vi.fn().mockResolvedValue({
                    data: { sheets: [{ properties: { title: 'Hoja Prueba' } }] }
                }),
                values: {
                    get: vi.fn().mockResolvedValue({
                        data: {
                            values: [
                                ['Ítem', 'Descripción', 'Und', 'Cant'],
                                ['1', 'Cemento', 'Bulto', '10'],
                                ['2', 'Arena', 'm3', '5']
                            ]
                        }
                    })
                }
            }
        })
    }
}));

describe('sheetsService', () => {
    it('debe leer y formatear correctamente los datos de la hoja', async () => {
        const data = await sheetsService.readSheet('fake-token', 'fake-id', 'A1:D10');

        expect(data).toHaveLength(2);
        expect(data[0]).toEqual({
            id: 1,
            item: '1',
            descripcion: 'Cemento',
            unidad: 'Bulto',
            cantidad: 10
        });
    });

    it('debe filtrar las cabeceras de los resultados', async () => {
        const data = await sheetsService.readSheet('fake-token', 'fake-id', 'A1:D10');
        const items = data.map(d => d.item.toLowerCase());
        expect(items).not.toContain('ítem');
        expect(items).not.toContain('item');
    });
});

import express from 'express';
import * as sheetsService from '../services/sheetsService.js';
import * as docsService from '../services/docsService.js';

const router = express.Router();

// Obtener datos de Sheets
router.post('/sheets', async (req, res) => {
    try {
        const { accessToken, sheetId, range } = req.body;
        const data = await sheetsService.readSheet(accessToken, sheetId, range);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar Sheets
router.post('/sheets/update', async (req, res) => {
    try {
        const { accessToken, sheetId, range, values } = req.body;
        const response = await sheetsService.updateSheetRows(accessToken, sheetId, range, values);
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar fila en Sheets
router.post('/sheets/delete', async (req, res) => {
    try {
        const { accessToken, sheetId, rowIndex } = req.body;
        const response = await sheetsService.deleteSheetRow(accessToken, sheetId, rowIndex);
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Añadir fila en Sheets
router.post('/sheets/append', async (req, res) => {
    try {
        const { accessToken, sheetId, values } = req.body;
        const response = await sheetsService.appendSheetRow(accessToken, sheetId, values);
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generar Documento (Docs + Drive)
router.post('/generate-document', async (req, res) => {
    try {
        const { accessToken, templateId, formData, newDocumentName } = req.body;
        const result = await docsService.generateDocument(accessToken, templateId, formData, newDocumentName);
        res.json({ success: true, ...result });
    } catch (error) {
        const statusCode = error.code === 401 || error.status === 401 ? 401 : 500;
        res.status(statusCode).json({
            error: error.message,
            isAuthError: statusCode === 401
        });
    }
});

export default router;

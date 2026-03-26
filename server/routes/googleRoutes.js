import express from 'express';
import * as sheetsService from '../services/sheetsService.js';
import * as docsService from '../services/docsService.js';

const router = express.Router();

// Obtener datos de Sheets
router.post('/sheets', async (req, res) => {
    try {
        const { sheetId, range } = req.body;
        const data = await sheetsService.readSheet(sheetId, range);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar Sheets
router.post('/sheets/update', async (req, res) => {
    try {
        const { sheetId, range, values } = req.body;
        const response = await sheetsService.updateSheetRows(sheetId, range, values);
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar fila en Sheets
router.post('/sheets/delete', async (req, res) => {
    try {
        const { sheetId, rowIndex } = req.body;
        const response = await sheetsService.deleteSheetRow(sheetId, rowIndex);
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Añadir fila en Sheets
router.post('/sheets/append', async (req, res) => {
    try {
        const { sheetId, values } = req.body;
        const response = await sheetsService.appendSheetRow(sheetId, values);
        res.json({ success: true, response: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generar Documento (Docs + Drive)
router.post('/generate-document', async (req, res) => {
    try {
        const { templateId, formData, newDocumentName } = req.body;
        if (!templateId) throw new Error("Plantilla no especificada");
        
        const result = await docsService.generateDocument(templateId, formData, newDocumentName);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error("Error en generate-document:", error);
        res.status(500).json({ error: error.message || "Error interno al generar documento" });
    }
});

// Compatibilidad con endpoint antiguo de docs/llenar (usado por TemplateViewer)
router.post('/docs/llenar', async (req, res) => {
    try {
        // La ruta asume un ID de plantilla maestro en duro (el de TemplateViewer)
        const templateId = '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0';
        const { formData } = req.body;
        
        const result = await docsService.generateDocument(templateId, formData, `Previo - ${formData?.numero}`);
        
        // Retornar en el formato que espera TemplateViewer
        res.json({ success: true, url: `${result.documentUrl}` });
    } catch (error) {
        console.error("Error en docs/llenar:", error);
        res.status(500).json({ error: error.message || "Error interno al llenar documento" });
    }
});

// Compatibilidad (Si templateViewer usara éste)
router.post('/test-new-doc', async (req, res) => {
    try {
        // Es redundante pero para mantener interfaz
        const { formData } = req.body;
        const templateId = '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0';
        const result = await docsService.generateDocument(templateId, formData, `Prueba Live - ${Date.now()}`);
        res.json({ success: true, url: result.documentUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

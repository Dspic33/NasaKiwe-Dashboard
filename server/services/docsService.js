import { google } from 'googleapis';
import { getOrCreateFolder, getOrCreateFile } from './driveService.js';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function generateDocument(accessToken, templateId, formData, newDocumentName) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const options = { auth };
    if (API_KEY) options.key = API_KEY;

    const drive = google.drive({ version: 'v3', ...options });
    const docs = google.docs({ version: 'v1', ...options });
    const sheets = google.sheets({ version: 'v4', auth });

    const rootFolderId = '11_IB0SzUixT42NZnccjhO8jG0KQSh7WK';
    const folderName = `Expediente ${formData?.numero || 'Generado'}`;

    // 1. Obtener/Crear carpeta
    const targetFolderId = await getOrCreateFolder(drive, rootFolderId, folderName);

    // 2. Obtener/Crear archivo
    const fileName = newDocumentName || `Documento - ${formData?.numero || Date.now()}`;
    const newDocId = await getOrCreateFile(drive, targetFolderId, fileName, templateId);

    // 3. Reemplazar variables
    if (formData && Object.keys(formData).length > 0) {
        const requests = Object.entries(formData).map(([key, value]) => ({
            replaceAllText: {
                containsText: { text: `{{${key}}}`, matchCase: false },
                replaceText: String(value),
            },
        }));

        // Lógica de tabla dinámica
        await injectTableIfPresent(docs, sheets, newDocId);

        if (requests.length > 0) {
            await docs.documents.batchUpdate({
                documentId: newDocId,
                requestBody: { requests },
            });
        }
    }

    return {
        documentId: newDocId,
        documentUrl: `https://docs.google.com/document/d/${newDocId}/edit?rm=minimal&embedded=true`
    };
}

// Lógica de inyección de tabla movida a función interna para limpieza
async function injectTableIfPresent(docs, sheets, docId) {
    try {
        const sheetId = '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs';
        const sheetRes = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'PRECIOS_NasaKiwe!A1:D50', // Simplificado para el servicio
        });

        const rows = sheetRes.data.values || [];
        const materials = rows.filter((r, i) => i > 0 && r[0] && r[0].trim() !== "");

        if (materials.length === 0) return;

        const doc = await docs.documents.get({ documentId: docId });
        let tableLocation = null;

        doc.data.body.content.forEach(element => {
            if (element.paragraph) {
                const pText = element.paragraph.elements.map(el => el.textRun?.content || "").join("");
                if (/\{\{\s*tabla\s*\}\}/i.test(pText)) {
                    element.paragraph.elements.forEach(el => {
                        if (el.textRun && (el.textRun.content.includes('{') || el.textRun.content.includes('tabla'))) {
                            if (!tableLocation) tableLocation = { startIndex: el.startIndex, endIndex: el.endIndex };
                            else tableLocation.endIndex = el.endIndex;
                        }
                    });
                }
            }
        });

        if (tableLocation) {
            const { startIndex, endIndex } = tableLocation;
            const tableRows = materials.length + 1;
            const tableCols = 4;

            await docs.documents.batchUpdate({
                documentId: docId,
                requestBody: {
                    requests: [
                        { deleteContentRange: { range: { startIndex, endIndex } } },
                        { insertTable: { rows: tableRows, columns: tableCols, location: { index: startIndex } } }
                    ]
                }
            });

            const docUpdated = await docs.documents.get({ documentId: docId });
            let tableObj = docUpdated.data.body.content.find(e => e.table && e.startIndex === startIndex)?.table;

            if (tableObj) {
                const fillRequests = [];
                const headers = ["Ítem", "Descripción", "Und", "Cant"];

                headers.forEach((h, col) => {
                    const cell = tableObj.tableRows[0].tableCells[col];
                    const cellStart = cell.content[0].startIndex;
                    fillRequests.push({ insertText: { text: h, location: { index: cellStart } } });
                    fillRequests.push({ updateTextStyle: { range: { startIndex: cellStart, endIndex: cellStart + h.length }, textStyle: { bold: true }, fields: "bold" } });
                });

                materials.forEach((mRow, rIdx) => {
                    mRow.forEach((val, cIdx) => {
                        if (cIdx < tableCols) {
                            const cell = tableObj.tableRows[rIdx + 1].tableCells[cIdx];
                            const cellStart = cell.content[0].startIndex;
                            fillRequests.push({ insertText: { text: String(val || ""), location: { index: cellStart } } });
                        }
                    });
                });

                const sortedRequests = fillRequests.sort((a, b) => {
                    const idxA = a.insertText?.location?.index || a.updateTextStyle?.range?.startIndex || 0;
                    const idxB = b.insertText?.location?.index || b.updateTextStyle?.range?.startIndex || 0;
                    return idxB - idxA;
                });

                await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: sortedRequests } });
            }
        }
    } catch (e) {
        console.warn("⚠️ Fallo inyección de tabla:", e.message);
    }
}

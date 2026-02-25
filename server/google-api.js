// En un entorno de producción, este código viviría en un backend Node.js separado (ej: NestJS, Express). 
// Para que Antigravity pueda crear los documentos usando el Access Token del cliente, 
// simularemos un servidor local que interactúa REALMENTE con las APIs de Google.

import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intentar cargar .env solo si existe (desarrollo local)
try {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
} catch (e) {
    console.log("ℹ️ No se encontró archivo .env local, usando variables de entorno del sistema.");
}

const app = express();
app.use(cors());
app.use(express.json());

// PORT dinámico para Render/Heroku
const PORT = process.env.PORT || 3001;

// Servir archivos estáticos del frontend (opcional, para Render todo-en-uno)
app.use(express.static(path.resolve(__dirname, '../dist')));

// Ruta de estado para verificar que el API está vivo
app.get('/status', (req, res) => {
    res.json({ status: 'NASA KIWE API is running', timestamp: new Date(), version: '1.0.0' });
});

// En el raíz, si no es una API, enviamos el index.html
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'), (err) => {
        if (err) {
            res.status(200).send('<h1>NASA KIWE Backend</h1><p>El API está funcionando correctamente. Si estás buscando el Dashboard, revisa tu URL de Netlify.</p>');
        }
    });
});

const API_KEY = process.env.VITE_GOOGLE_API_KEY;

// Cache temporal para evitar duplicidad de carpetas si se crean muy rápido
const folderCache = new Map();
const folderCreationPromises = new Map();

/**
 * Helper para obtener o crear una carpeta de forma atómica e idempotente.
 * Previene que peticiones simultáneas creen carpetas duplicadas.
 */
async function getOrCreateFolder(drive, rootFolderId, folderName) {
    const cleanName = folderName.trim();
    const cacheKey = cleanName.toUpperCase();

    if (folderCache.has(cacheKey)) {
        console.log(`⚡ Cache hit: ${cleanName} -> ${folderCache.get(cacheKey)}`);
        return folderCache.get(cacheKey);
    }

    if (folderCreationPromises.has(cacheKey)) {
        console.log(`⏳ Esperando creación/búsqueda de: ${cleanName}`);
        return folderCreationPromises.get(cacheKey);
    }

    const promise = (async () => {
        try {
            console.log(`🔍 Buscando carpeta "${cleanName}"...`);
            const res = await drive.files.list({
                q: `name='${cleanName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id)',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            });

            if (res.data.files?.length > 0) {
                const id = res.data.files[0].id;
                console.log(`✅ Carpeta existente: ${id}`);
                folderCache.set(cacheKey, id);
                return id;
            }

            console.log(`📂 Creando carpeta "${cleanName}"...`);
            const createRes = await drive.files.create({
                requestBody: { name: cleanName, mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] },
                fields: 'id',
                supportsAllDrives: true
            });
            const id = createRes.data.id;
            console.log(`✅ Nueva carpeta: ${id}`);
            folderCache.set(cacheKey, id);
            return id;
        } finally {
            folderCreationPromises.delete(cacheKey);
            setTimeout(() => folderCache.delete(cacheKey), 60000); // Cache por 1 min
        }
    })();

    folderCreationPromises.set(cacheKey, promise);
    return promise;
}

/**
 * Helper para obtener un archivo existente por nombre o crear uno nuevo clonando la plantilla.
 */
async function getOrCreateFile(drive, folderId, fileName, templateId) {
    const cleanName = fileName.trim();
    console.log(`📄 Verificando archivo "${cleanName}" en carpeta ${folderId}...`);

    const res = await drive.files.list({
        q: `name='${cleanName}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
    });

    if (res.data.files?.length > 0) {
        const id = res.data.files[0].id;
        console.log(`✅ Archivo existente encontrado: ${id}`);
        return id;
    }

    console.log(`✨ Clonando nueva copia de plantilla ${templateId}...`);
    const copyRes = await drive.files.copy({
        fileId: templateId,
        requestBody: { name: cleanName, parents: [folderId] },
        supportsAllDrives: true
    });
    const newFileId = copyRes.data.id;

    // Compartir automáticamente: "Cualquier persona con el enlace puede editar"
    try {
        await drive.permissions.create({
            fileId: newFileId,
            requestBody: {
                role: 'writer',
                type: 'anyone'
            },
            supportsAllDrives: true
        });
        console.log(`🔓 Permisos de edición pública asignados a ${newFileId}`);
    } catch (permErr) {
        console.warn(`⚠️ No se pudieron asignar permisos de edición públicos: ${permErr.message}`);
    }

    return newFileId;
}

// Endpoint para leer de Google Sheets
app.post('/api/google/sheets', async (req, res) => {
    try {
        const { accessToken, sheetId, range } = req.body;

        if (!accessToken || !sheetId) {
            return res.status(401).json({ error: "Access token y sheetId son requeridos" });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const options = { version: 'v4', auth };
        if (API_KEY) options.key = API_KEY;
        const sheets = google.sheets(options);

        // Resolución defensiva del nombre de la hoja
        let targetRange = range || 'A1:D100';
        try {
            const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
            const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);

            // Si el rango provisto no parece tener una hoja válida o es el genérico
            if (!range || !sheetNames.some(sn => range.includes(sn))) {
                const fallback = sheetNames.find(n => n.includes('Materiales') || n.includes('PRECIOS') || n.includes('NasaKiwe')) || sheetNames[0];
                targetRange = `'${fallback}'!A1:D100`;
                console.log(`🔄 [Sheets Lookup] Usando hoja autodetectada: ${targetRange}`);
            }
        } catch (e) {
            console.log("⚠️ No se pudo pre-validar hojas, usando rango directo.");
        }

        console.log(`Leyendo datos de la hoja ${sheetId}... Rango final: ${targetRange}`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: targetRange,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Mapeo simple: Asumimos que la primera fila podría ser encabezado
        // [Ítem, Descripción, Unidad, Valor Unitario]
        // Se puede hacer más dinámico, pero para este caso de uso:
        const data = rows.map((row, index) => {
            return {
                id: index + 1,
                item: row[0] || '',
                descripcion: row[1] || '',
                unidad: row[2] || '',
                cantidad: parseFloat((row[3] || '0').replace(',', '.')) || 0,
            }
        });

        // Filtrar fila de encabezados simple (si la primera es "Item" o similar)
        const cleanData = data.filter(d => d.item.toLowerCase() !== 'ítem' && d.item.toLowerCase() !== 'item' && d.item !== '');

        res.json({
            success: true,
            data: cleanData
        });

    } catch (error) {
        console.error("Error leyendo Google Sheets:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para actualizar filas en Google Sheets
app.post('/api/google/sheets/update', async (req, res) => {
    try {
        const { accessToken, sheetId, range, values } = req.body;

        if (!accessToken || !sheetId || !range || !values) {
            return res.status(401).json({ error: "Faltan parámetros requeridos para actualizar" });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const options = { version: 'v4', auth };
        if (API_KEY) options.key = API_KEY;
        const sheets = google.sheets(options);

        console.log(`Actualizando datos en la hoja ${sheetId}... Rango: ${range}`);

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values
            }
        });

        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error("Error actualizando Google Sheets:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para eliminar filas en Google Sheets
app.post('/api/google/sheets/delete', async (req, res) => {
    try {
        const { accessToken, sheetId, rowIndex } = req.body; // rowIndex es 0-based

        if (!accessToken || !sheetId || rowIndex === undefined) {
            return res.status(401).json({ error: "Faltan parámetros requeridos para eliminar" });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const options = { version: 'v4', auth };
        if (API_KEY) options.key = API_KEY;
        const sheets = google.sheets(options);

        console.log(`Eliminando fila ${rowIndex} en la hoja ${sheetId}...`);

        const response = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 0, // Asumimos la primera hoja por defecto (id 0)
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    }
                ]
            }
        });

        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error("Error eliminando fila en Google Sheets:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para añadir filas al final en Google Sheets
app.post('/api/google/sheets/append', async (req, res) => {
    try {
        const { accessToken, sheetId, values } = req.body;

        if (!accessToken || !sheetId || !values) {
            return res.status(401).json({ error: "Faltan parámetros requeridos para añadir" });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const options = { version: 'v4', auth };
        if (API_KEY) options.key = API_KEY;
        const sheets = google.sheets(options);

        console.log(`Añadiendo fila en la hoja ${sheetId}...`);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Hoja 1!A1', // Google buscará el final automáticamente
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values
            }
        });

        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error("Error añadiendo fila en Google Sheets:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para simular la "Copia de Plantilla y Reemplazo de Variables"
app.post('/api/google/generate-document', async (req, res) => {
    try {
        const { accessToken, templateId, formData, newDocumentName } = req.body;
        console.log(`DEBUG: Recibida solicitud de generación para "${newDocumentName}" hacia plantilla ${templateId}`);

        if (!accessToken) {
            return res.status(401).json({ error: "Access token requerido" });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const options = { auth };
        if (API_KEY) options.key = API_KEY;

        const drive = google.drive({ version: 'v3', ...options });
        const docs = google.docs({ version: 'v1', ...options });

        const rootFolderId = '11_IB0SzUixT42NZnccjhO8jG0KQSh7WK';
        const folderName = `Expediente ${formData?.numero || 'Generado'}`;

        // 1. Obtener o crear carpeta (Idempotente)
        const targetFolderId = await getOrCreateFolder(drive, rootFolderId, folderName);

        // 2. Obtener o crear archivo (Idempotente)
        const fileName = newDocumentName || `Documento - ${formData?.numero || Date.now()}`;
        const newDocId = await getOrCreateFile(drive, targetFolderId, fileName, templateId);

        // 3. Reemplazar variables (Idempotente - simplemente sobreescribe)
        if (formData && Object.keys(formData).length > 0) {
            console.log(`Reemplazando variables en el documento ${newDocId}...`);

            const requests = Object.entries(formData).map(([key, value]) => ({
                replaceAllText: {
                    containsText: {
                        text: `{{${key}}}`,
                        matchCase: false,
                    },
                    replaceText: String(value),
                },
            }));

            // --- NUEVA LÓGICA: INSERCIÓN DE TABLA DESDE SHEETS ---
            try {
                const sheets = google.sheets({ version: 'v4', auth });
                const sheetId = '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs';
                console.log(`📊 Obteniendo materiales de Sheet ${sheetId} para la tabla...`);

                // Resolución defensiva de nombre de hoja
                let targetRange = 'PRECIOS_NasaKiwe!A1:D50';
                try {
                    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
                    const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);

                    if (!sheetNames.includes('PRECIOS_NasaKiwe')) {
                        console.log(`⚠️ Hoja 'PRECIOS_NasaKiwe' no hallada. Disponibles: ${sheetNames.join(', ')}`);
                        // Intentar 'Materiales' o la primera hoja disponible
                        const fallback = sheetNames.find(n => n.includes('Materiales') || n.includes('PRECIOS') || n.includes('NasaKiwe')) || sheetNames[0];
                        targetRange = `'${fallback}'!A1:D50`;
                        console.log(`🔄 Usando hoja alternativa: ${targetRange}`);
                    }
                } catch (e) {
                    console.log("⚠️ No se pudo listar las hojas, intentando rango directo...");
                }

                const sheetRes = await sheets.spreadsheets.values.get({
                    spreadsheetId: sheetId,
                    range: targetRange,
                });

                const rows = sheetRes.data.values || [];
                const materials = rows.filter((r, i) => i > 0 && r[0] && r[0].trim() !== ""); // Omitir cabecera y vacíos

                if (materials.length > 0) {
                    // 1. Buscar posición y extensión de {{tabla}} (Buscador Robusto)
                    const doc = await docs.documents.get({ documentId: newDocId });
                    let tableLocation = null;

                    console.log("🔍 Escaneando párrafos en busca de {{tabla}}...");
                    doc.data.body.content.forEach((element, idx) => {
                        if (element.paragraph) {
                            const pTextRaw = element.paragraph.elements
                                .map(el => (el.textRun?.content || ""))
                                .join("");

                            // LOG VERBOSO PARA DEPURAR (Solo si contiene algo parecido a tabla)
                            if (pTextRaw.toLowerCase().includes('tabla') || pTextRaw.includes('{')) {
                                console.log(`[Párrafo ${idx}]: "${pTextRaw.replace(/\n/g, "\\n")}"`);
                                console.log(`[Estructura]:`, JSON.stringify(element.paragraph.elements.map(el => ({ text: el.textRun?.content || "", start: el.startIndex, end: el.endIndex })), null, 2));
                            }

                            // Regex flexible: permite espacios entre llaves y palabra
                            const tableRegex = /\{\{\s*tabla\s*\}\}/i;

                            if (tableRegex.test(pTextRaw)) {
                                console.log(`🎯 MATCH HALLADO con Regex en párrafo ${idx}`);
                                element.paragraph.elements.forEach(el => {
                                    const part = el.textRun?.content || "";
                                    if (part.includes('{') || part.includes('tabla') || part.includes('}')) {
                                        if (!tableLocation) {
                                            tableLocation = {
                                                startIndex: el.startIndex,
                                                endIndex: el.endIndex
                                            };
                                        } else {
                                            tableLocation.endIndex = el.endIndex;
                                        }
                                    }
                                });
                            }
                        }
                    });

                    if (tableLocation) {
                        const { startIndex, endIndex } = tableLocation;
                        console.log(`📍 Marcador {{tabla}} hallado en [${startIndex}, ${endIndex}]. Ejecutando algoritmo de precisión...`);

                        // 2. Eliminar marcador e insertar tabla vacía en una sola operación atómica si es posible
                        const tableRows = materials.length + 1;
                        const tableCols = 4;

                        const initRequests = [
                            { deleteContentRange: { range: { startIndex, endIndex } } },
                            { insertTable: { rows: tableRows, columns: tableCols, location: { index: startIndex } } }
                        ];

                        await docs.documents.batchUpdate({ documentId: newDocId, requestBody: { requests: initRequests } });

                        // 3. Poblar la tabla (Refresco de índices)
                        const docUpdated = await docs.documents.get({ documentId: newDocId });
                        let tableObj = null;

                        docUpdated.data.body.content.forEach(element => {
                            // La tabla ahora debería empezar en startIndex
                            if (element.table && element.startIndex === startIndex) {
                                tableObj = element.table;
                            }
                        });

                        if (tableObj) {
                            const fillRequests = [];
                            const headers = ["Ítem", "Descripción", "Und", "Cant"];

                            // Preparar Cabecera
                            headers.forEach((h, col) => {
                                const cell = tableObj.tableRows[0].tableCells[col];
                                const cellStart = cell.content[0].startIndex;
                                fillRequests.push({ insertText: { text: h, location: { index: cellStart } } });
                                fillRequests.push({ updateTextStyle: { range: { startIndex: cellStart, endIndex: cellStart + h.length }, textStyle: { bold: true }, fields: "bold" } });
                            });

                            // Preparar Datos
                            materials.forEach((mRow, rIdx) => {
                                mRow.forEach((val, cIdx) => {
                                    if (cIdx < tableCols) {
                                        const cell = tableObj.tableRows[rIdx + 1].tableCells[cIdx];
                                        const cellStart = cell.content[0].startIndex;
                                        fillRequests.push({ insertText: { text: String(val || ""), location: { index: cellStart } } });
                                    }
                                });
                            });

                            // 4. Ejecutar en ORDEN INVERSO (Índices descendentes) para mantener integridad
                            // Ordenamos por startIndex de mayor a menor
                            const sortedRequests = fillRequests.sort((a, b) => {
                                const indexA = (a.insertText?.location?.index) || (a.updateTextStyle?.range?.startIndex) || 0;
                                const indexB = (b.insertText?.location?.index) || (b.updateTextStyle?.range?.startIndex) || 0;
                                return indexB - indexA;
                            });

                            await docs.documents.batchUpdate({ documentId: newDocId, requestBody: { requests: sortedRequests } });
                            console.log("✅ Tabla de precisión insertada y poblada con éxito.");
                        }
                    } else {
                        console.log("⚠️ No se encontró el marcador {{tabla}} en el documento.");
                    }
                }
            } catch (sheetErr) {
                console.error("⚠️ Error procesando tabla dinámica:", sheetErr.message);
            }
            // --- FIN LÓGICA DE TABLA ---

            if (requests.length > 0) {
                const batchResponse = await docs.documents.batchUpdate({
                    documentId: newDocId,
                    requestBody: { requests },
                });
                console.log(`DEBUG: Reemplazo completado en ${newDocId}`);
            }
        }

        // Devolver la URL del nuevo documento generado (con parametros de limpieza)
        const docUrl = `https://docs.google.com/document/d/${newDocId}/edit?rm=minimal&embedded=true`;

        res.json({
            success: true,
            documentId: newDocId,
            documentUrl: docUrl
        });

    } catch (error) {
        console.error("Error en Google API:", error);
        // Si es un error de autenticación de Google, devolvemos 401 explícito
        const statusCode = error.code === 401 || error.status === 401 ? 401 : 500;
        res.status(statusCode).json({
            error: error.message || "Error interno generando el documento.",
            isAuthError: statusCode === 401
        });
    }
});

app.post('/api/docs/llenar', async (req, res) => {
    try {
        const { accessToken, formData } = req.body;
        const templateId = '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0'; // ID de plantilla oficial

        if (!accessToken) {
            return res.status(401).json({ error: "Access token requerido" });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const options = { auth };
        if (API_KEY) options.key = API_KEY;

        const drive = google.drive({ version: 'v3', ...options });
        const docs = google.docs({ version: 'v1', ...options });

        const processNumber = formData?.numero || 'Generado';
        const folderName = `Expediente ${processNumber}`;
        // Unificamos el nombre con el del batch para que NO cree un tercer archivo
        const newDocumentName = `Estudio de Conveniencia - ${processNumber}`;
        const rootFolderId = '11_IB0SzUixT42NZnccjhO8jG0KQSh7WK';

        console.log(`DEBUG: Iniciando flujo /api/docs/llenar para ${newDocumentName}`);

        // 1. Obtener o crear carpeta (Idempotente)
        const targetFolderId = await getOrCreateFolder(drive, rootFolderId, folderName);

        // 2. Obtener o crear archivo (Idempotente)
        const newDocId = await getOrCreateFile(drive, targetFolderId, newDocumentName, templateId);

        // --- NUEVA LÓGICA: INSERCIÓN DE TABLA DESDE SHEETS ---
        try {
            const sheets = google.sheets({ version: 'v4', auth });
            const sheetId = '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs';
            console.log(`📊 Obteniendo materiales para tabla en /api/docs/llenar...`);

            // Resolución defensiva de nombre de hoja
            let targetRange = 'PRECIOS_NasaKiwe!A1:D50';
            try {
                const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
                const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);

                if (!sheetNames.includes('PRECIOS_NasaKiwe')) {
                    console.log(`⚠️ Hoja 'PRECIOS_NasaKiwe' no hallada en /llenar. Disponibles: ${sheetNames.join(', ')}`);
                    const fallback = sheetNames.find(n => n.includes('Materiales') || n.includes('PRECIOS') || n.includes('NasaKiwe')) || sheetNames[0];
                    targetRange = `'${fallback}'!A1:D50`;
                    console.log(`🔄 Usando hoja alternativa: ${targetRange}`);
                }
            } catch (e) {
                console.log("⚠️ No se pudo listar las hojas en /llenar, intentando rango directo...");
            }

            const sheetRes = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: targetRange,
            });

            const rows = sheetRes.data.values || [];
            const materials = rows.filter((r, i) => i > 0 && r[0] && r[0].trim() !== "");

            if (materials.length > 0) {
                const doc = await docs.documents.get({ documentId: newDocId });
                let tableLocation = null;

                doc.data.body.content.forEach(element => {
                    if (element.paragraph) {
                        const pText = element.paragraph.elements.map(el => (el.textRun?.content || "")).join("");
                        if (pText.includes('{{tabla}}')) {
                            element.paragraph.elements.forEach(el => {
                                if (el.textRun && (el.textRun.content.includes('{{') || el.textRun.content.includes('tabla'))) {
                                    if (!tableLocation) {
                                        tableLocation = { startIndex: el.startIndex, endIndex: el.endIndex };
                                    } else {
                                        tableLocation.endIndex = el.endIndex;
                                    }
                                }
                            });
                        }
                    }
                });

                if (tableLocation) {
                    const { startIndex, endIndex } = tableLocation;
                    console.log(`📍 Marcador {{tabla}} hallado en /llenar [${startIndex}, ${endIndex}].`);
                    // ... resto del bloque ...

                    const tableRows = materials.length + 1;
                    const tableCols = 4;

                    // Borrar marcador e insertar tabla
                    await docs.documents.batchUpdate({
                        documentId: newDocId,
                        requestBody: {
                            requests: [
                                { deleteContentRange: { range: { startIndex, endIndex } } },
                                { insertTable: { rows: tableRows, columns: tableCols, location: { index: startIndex } } }
                            ]
                        }
                    });

                    // Refrescar y poblar
                    const docUpdated = await docs.documents.get({ documentId: newDocId });
                    let tableObj = null;
                    docUpdated.data.body.content.forEach(element => {
                        if (element.table && element.startIndex === startIndex) {
                            tableObj = element.table;
                        }
                    });

                    if (tableObj) {
                        const fillRequests = [];
                        const headers = ["Ítem", "Descripción", "Und", "Cant"];

                        // Cabeceras
                        headers.forEach((h, col) => {
                            const cell = tableObj.tableRows[0].tableCells[col];
                            const cellStart = cell.content[0].startIndex;
                            fillRequests.push({ insertText: { text: h, location: { index: cellStart } } });
                            fillRequests.push({ updateTextStyle: { range: { startIndex: cellStart, endIndex: cellStart + h.length }, textStyle: { bold: true }, fields: "bold" } });
                        });

                        // Cuerpo
                        materials.forEach((mRow, rIdx) => {
                            mRow.forEach((val, cIdx) => {
                                if (cIdx < tableCols) {
                                    const cell = tableObj.tableRows[rIdx + 1].tableCells[cIdx];
                                    const cellStart = cell.content[0].startIndex;
                                    fillRequests.push({ insertText: { text: String(val || ""), location: { index: cellStart } } });
                                }
                            });
                        });

                        // Orden inverso para integridad de índices
                        const sortedRequests = fillRequests.sort((a, b) => {
                            const indexA = (a.insertText?.location?.index) || (a.updateTextStyle?.range?.startIndex) || 0;
                            const indexB = (b.insertText?.location?.index) || (b.updateTextStyle?.range?.startIndex) || 0;
                            return indexB - indexA;
                        });

                        await docs.documents.batchUpdate({ documentId: newDocId, requestBody: { requests: sortedRequests } });
                        console.log("✅ Tabla unificada poblada con algoritmo de precisión.");
                    }
                }
            }
        } catch (sheetErr) {
            console.error("⚠️ Error tabla dinámica en /llenar:", sheetErr.message);
        }

        // 3. Reemplazar marcadores
        const requests = [
            { replaceAllText: { containsText: { text: '{{fecha}}', matchCase: false }, replaceText: String(formData.fecha || '') } },
            { replaceAllText: { containsText: { text: '{{objeto}}', matchCase: false }, replaceText: String(formData.objeto || '') } },
            { replaceAllText: { containsText: { text: '{{numero}}', matchCase: false }, replaceText: String(formData.numero || '') } },
            { replaceAllText: { containsText: { text: '{{valor}}', matchCase: false }, replaceText: String(formData.valor || '') } }
        ];

        await docs.documents.batchUpdate({
            documentId: newDocId,
            requestBody: { requests },
        });

        console.log(`DEBUG: Llenado completado para ${newDocId}`);

        res.json({
            success: true,
            message: "Documento unificado y actualizado",
            documentId: newDocId,
            url: `https://docs.google.com/document/d/${newDocId}/edit?rm=minimal&embedded=true`
        });

    } catch (error) {
        console.error("Error en /api/docs/llenar:", error);
        const statusCode = error.code === 401 || error.status === 401 ? 401 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message,
            isAuthError: statusCode === 401
        });
    }
});

app.post('/api/google/test-new-doc', async (req, res) => {
    try {
        const { accessToken, sheetId, formData } = req.body;
        if (!accessToken || !sheetId) return res.status(401).json({ error: "Faltan tokens o IDs" });

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const docs = google.docs({ version: 'v1', auth });
        const sheets = google.sheets({ version: 'v4', auth });
        const drive = google.drive({ version: 'v3', auth });

        // 1. Crear documento en blanco
        console.log("🛠️ Creando documento de prueba en blanco...");
        const createRes = await drive.files.create({
            requestBody: { name: `TEST-DIAGNOSTICO-${formData.numero_proceso || 'GENERICO'}`, mimeType: 'application/vnd.google-apps.document' },
            fields: 'id'
        });
        const newDocId = createRes.data.id;

        // 2. Insertar texto inicial y el marcador {{tabla}}
        await docs.documents.batchUpdate({
            documentId: newDocId,
            requestBody: {
                requests: [
                    { insertText: { location: { index: 1 }, text: "DOCUMENTO DE DIAGNÓSTICO DE TABLAS (SIN PLANTILLA)\n\n" } },
                    { insertText: { location: { index: 52 }, text: "A continuación se debe insertar la tabla:\n\n{{tabla}}\n\nFin del documento de prueba." } }
                ]
            }
        });

        // 3. Obtener datos del Excel (usando lógica defensiva)
        let targetRange = 'A1:D100';
        try {
            const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
            const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
            const fallback = sheetNames.find(n => n.includes('Materiales') || n.includes('PRECIOS') || n.includes('NasaKiwe')) || sheetNames[0];
            targetRange = `'${fallback}'!A1:D100`;
        } catch (e) { }

        const sheetRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: targetRange });
        const materials = (sheetRes.data.values || []).filter(row => row && (row[0] || row[1]));
        console.log(`📊 Datos Excel recuperados: ${materials.length} filas para insertar.`);

        const tableRows = materials.length + 1;
        const tableCols = 4;

        // 4. Ejecutar Algoritmo de Precisión
        const docInitial = await docs.documents.get({ documentId: newDocId });
        let startIndex = -1, endIndex = -1;
        docInitial.data.body.content.forEach(el => {
            if (el.paragraph) {
                const combined = el.paragraph.elements.map(e => e.textRun?.content || "").join("");
                if (combined.includes("{{tabla}}")) {
                    startIndex = el.startIndex + combined.indexOf("{{tabla}}");
                    endIndex = startIndex + "{{tabla}}".length;
                }
            }
        });

        console.log(`📍 Marcador {{tabla}} encontrado en índice: ${startIndex}`);

        if (startIndex !== -1) {
            // Limpia marcador e inserta tabla vacía
            await docs.documents.batchUpdate({
                documentId: newDocId,
                requestBody: {
                    requests: [
                        { deleteContentRange: { range: { startIndex, endIndex } } },
                        { insertTable: { rows: tableRows, columns: tableCols, location: { index: startIndex } } }
                    ]
                }
            });

            console.log("⚡ Tabla vacía insertada. Refrescando documento para poblar...");

            // Refrescar y Poblar
            const docLive = await docs.documents.get({ documentId: newDocId });
            let tableObj = null;
            docLive.data.body.content.forEach(el => {
                if (el.table) {
                    console.log(`📝 Mesa encontrada en el doc con startIndex: ${el.startIndex} (buscando cerca de ${startIndex})`);
                    // Permite un margen de error de +/- 2 en el índice debido a desplazamientos internos de Google Docs
                    if (Math.abs(el.startIndex - startIndex) <= 2) {
                        tableObj = el.table;
                        console.log(`🎯 Tabla vinculada exitosamente en índice ${el.startIndex}`);
                    }
                }
            });

            if (tableObj) {
                console.log("✅ Estructura de tabla detectada. Iniciando poblado...");
                const fillReqs = [];
                const headers = ["Item", "Descripcion", "Unidad", "Cantidad"];
                headers.forEach((h, col) => {
                    const c = tableObj.tableRows[0].tableCells[col];
                    fillReqs.push({ insertText: { text: h, location: { index: c.content[0].startIndex } } });
                });

                // Cuerpo
                materials.forEach((mRow, rIdx) => {
                    mRow.forEach((val, cIdx) => {
                        if (cIdx < 4 && val && String(val).trim() !== "") {
                            const c = tableObj.tableRows[rIdx + 1].tableCells[cIdx];
                            fillReqs.push({ insertText: { text: String(val), location: { index: c.content[0].startIndex } } });
                        }
                    });
                });

                console.log(`📤 Enviando ${fillReqs.length} solicitudes de inserción de texto en reversa...`);
                const sorted = fillReqs.sort((a, b) => b.insertText.location.index - a.insertText.location.index);
                await docs.documents.batchUpdate({ documentId: newDocId, requestBody: { requests: sorted } });
                console.log("🎊 Proceso de diagnóstico finalizado con éxito.");
            } else {
                console.log("❌ ERROR: No se encontró la tabla en el índice esperado después de insertarla.");
            }
        }

        res.json({ success: true, url: `https://docs.google.com/document/d/${newDocId}/edit` });

    } catch (error) {
        console.error("Error en test-new-doc:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor proxy de Google API corriendo en http://localhost:${PORT}`);
    console.log(`Esperando peticiones con access_token...`);
});

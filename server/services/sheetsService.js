import { google } from 'googleapis';
import { getServiceAccountAuth } from './googleAuthService.js';

export async function readSheet(sheetId, range) {
    const auth = await getServiceAccountAuth();

    const sheets = google.sheets({ version: 'v4', auth });

    // Resolución defensiva del nombre de la hoja
    let targetRange = range || 'A1:D100';
    try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);

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
    if (!rows || rows.length === 0) return [];

    // Filtrar primero para eliminar cabeceras y filas vacías
    const cleanRows = rows.filter(row =>
        row[0] &&
        row[0].toLowerCase() !== 'ítem' &&
        row[0].toLowerCase() !== 'item' &&
        row[0] !== ''
    );

    // Mapear con IDs secuenciales basados en el resultado limpio
    return cleanRows.map((row, index) => ({
        id: index + 1,
        item: row[0] || '',
        descripcion: row[1] || '',
        unidad: row[2] || '',
        cantidad: parseFloat((row[3] || '0').replace(',', '.')) || 0,
    }));
}

export async function updateSheetRows(sheetId, range, values) {
    const auth = await getServiceAccountAuth();

    const sheets = google.sheets({ version: 'v4', auth });

    return sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
    });
}

export async function deleteSheetRow(sheetId, rowIndex) {
    const auth = await getServiceAccountAuth();

    const sheets = google.sheets({ version: 'v4', auth });

    return sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: 0,
                        dimension: 'ROWS',
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1
                    }
                }
            }]
        }
    });
}

export async function appendSheetRow(sheetId, values) {
    const auth = await getServiceAccountAuth();

    const sheets = google.sheets({ version: 'v4', auth });

    return sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Hoja 1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
    });
}

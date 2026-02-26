import { google } from 'googleapis';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function readSheet(accessToken, sheetId, range) {
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

    const data = rows.map((row, index) => ({
        id: index + 1,
        item: row[0] || '',
        descripcion: row[1] || '',
        unidad: row[2] || '',
        cantidad: parseFloat((row[3] || '0').replace(',', '.')) || 0,
    }));

    return data.filter(d =>
        d.item.toLowerCase() !== 'ítem' &&
        d.item.toLowerCase() !== 'item' &&
        d.item !== ''
    );
}

export async function updateSheetRows(accessToken, sheetId, range, values) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const options = { version: 'v4', auth };
    if (API_KEY) options.key = API_KEY;
    const sheets = google.sheets(options);

    return sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
    });
}

export async function deleteSheetRow(accessToken, sheetId, rowIndex) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const options = { version: 'v4', auth };
    if (API_KEY) options.key = API_KEY;
    const sheets = google.sheets(options);

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

export async function appendSheetRow(accessToken, sheetId, values) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const options = { version: 'v4', auth };
    if (API_KEY) options.key = API_KEY;
    const sheets = google.sheets(options);

    return sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Hoja 1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
    });
}

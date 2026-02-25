import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const accessToken = process.argv[2]; // Pasar el token por argumento
const sheetId = '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs';

if (!accessToken) {
    console.error("Uso: node debug-sheets.js YOUR_ACCESS_TOKEN");
    process.exit(1);
}

async function debug() {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        console.log(`🔍 Inspeccionando Spreadsheet ID: ${sheetId}...`);
        const res = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        console.log("\n✅ Hojas encontradas en este archivo:");
        res.data.sheets.forEach(s => {
            console.log(`- "${s.properties.title}" (ID: ${s.properties.sheetId})`);
        });

    } catch (err) {
        console.error("❌ Error inspeccionando hojas:", err.message);
    }
}

debug();

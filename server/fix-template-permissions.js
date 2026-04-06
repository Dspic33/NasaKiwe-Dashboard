import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getServiceAccountAuth } from './services/googleAuthService.js';

async function fixPermissions() {
    try {
        const auth = await getServiceAccountAuth();
        const drive = google.drive({ version: 'v3', auth });
        
        const templateId = '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0';
        console.log(`🔐 Intentando hacer pública la plantilla: ${templateId}`);

        await drive.permissions.create({
            fileId: templateId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            },
            supportsAllDrives: true
        });

        console.log("✅ ¡ÉXITO! La plantilla ahora es pública (Lectura para cualquiera con el enlace).");
        console.log("👉 Esto debería quitar la 'cara triste' del IFrame inmediatamente.");

    } catch (error) {
        console.error("❌ Error al cambiar permisos:", error.message);
    }
}

fixPermissions();

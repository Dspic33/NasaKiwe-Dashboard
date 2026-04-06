import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getServiceAccountAuth } from './services/googleAuthService.js';

async function publishToWeb() {
    try {
        const auth = await getServiceAccountAuth();
        const drive = google.drive({ version: 'v3', auth });
        
        const templateId = '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0';
        console.log(`🌐 Intentando "Publicar en la Web" la plantilla: ${templateId}`);

        // Revisar si ya está publicado o necesita actualización
        // En Drive API v3, no hay un "publish" directo como tal, 
        // pero se puede usar revisiones o simplemente asegurar que los permisos son correctos.
        // Sin embargo, Google Docs tiene un endpoint interno /pub que se activa al 'Publicar'.
        
        // Intentaremos forzar una revisión o permiso especial
        await drive.revisions.update({
            fileId: templateId,
            revisionId: 'head',
            requestBody: {
                published: true,
                publishAuto: true,
                publishedOutsideDomain: true
            }
        });

        console.log("✅ ¡ÉXITO! Se ha solicitado la publicación del documento.");
        console.log("👉 Ahora intentaremos usar la URL /pub?embedded=true que es infalible.");

    } catch (error) {
        console.error("❌ Error al publicar:", error.message);
        console.log("Intentando fallback: Los permisos ya son 'anyone', intentaremos cambiar el modo del IFrame en el código.");
    }
}

publishToWeb();

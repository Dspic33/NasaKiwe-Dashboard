import { google } from 'googleapis';

const folderCache = new Map();
const folderCreationPromises = new Map();

/**
 * Helper para obtener o crear una carpeta de forma atómica e idempotente.
 * Previene que peticiones simultáneas creen carpetas duplicadas.
 */
export async function getOrCreateFolder(drive, rootFolderId, folderName) {
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

        try {
            await drive.permissions.create({
                fileId: id,
                requestBody: { role: 'writer', type: 'anyone' },
                supportsAllDrives: true
            });
            console.log(`🔐 Permisos públicos aplicados a la carpeta ${id}`);
        } catch (permErr) {
            console.warn(`⚠️ No se pudieron asignar permisos a la carpeta: ${permErr.message}`);
        }

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
export async function getOrCreateFile(drive, folderId, fileName, templateId) {
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

// Compartir automáticamente: "Cualquier persona con el enlace puede editar" (necesario para iframes)
try {
    await drive.permissions.create({
        fileId: newFileId,
        requestBody: {
            role: 'writer',
            type: 'anyone'
        },
        supportsAllDrives: true
    });
    console.log(`🔐 Permisos públicos aplicados al archivo ${newFileId}`);
} catch (permErr) {
    console.warn(`⚠️ No se pudieron asignar permisos públicos: ${permErr.message}`);
}

    return newFileId;
}

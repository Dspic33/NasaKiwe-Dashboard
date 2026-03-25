const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class GoogleIntegrationService {

    constructor() {
        // Obtenemos estado guardado en local o simulamos desconectado
        this.isConnected = !!localStorage.getItem('real_google_access_token') || localStorage.getItem('google_auth_token') === 'true'

        // Datos mockeados de una hoja de Google Sheets para Materiales
        this.mockSheetData = [
            { id: 1, item: '1.1', descripcion: 'Cemento Gris Portland x 50kg', unidad: 'Bulto', valor_unitario: 35000 },
            { id: 2, item: '1.2', descripcion: 'Arena de Peña lavada', unidad: 'm3', valor_unitario: 65000 },
            { id: 3, item: '1.3', descripcion: 'Ladrillo Prensado Estructural', unidad: 'Und', valor_unitario: 800 },
            { id: 4, item: '2.1', descripcion: 'Varilla Corrugada 1/2"', unidad: 'Und', valor_unitario: 22000 },
            { id: 5, item: '2.2', descripcion: 'Varilla Corrugada 3/8"', unidad: 'Und', valor_unitario: 14500 }
        ]
    }

    // SIMULACIÓN OAUTH
    async loginWithGoogle() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true
                localStorage.setItem('google_auth_token', 'true')
                resolve({
                    success: true,
                    email: 'asesor.vivienda@nasakiwe.gov.co',
                    lastSync: new Date().toISOString()
                })
            }, 1500) // Simular delay de red y payload de OAuth
        })
    }

    async logoutGoogle() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = false
                localStorage.removeItem('google_auth_token')
                resolve({ success: true })
            }, 500)
        })
    }

    getAuthStatus() {
        return this.isConnected
    }

    // SIMULACIÓN GOOGLE SHEETS AHORA CON PROXY REAL
    async getMaterialesFromSheet(sheetId) {
        if (!this.isConnected) throw new Error("No autenticado en Google. Ve a Configuración de Perfil.")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs', // ID real del excel
                    range: 'Hoja 1!A:D' // Asumimos un nombre de hoja genérico, se puede perfeccionar
                })
            });

            if (!req.ok) {
                throw new Error("HTTP error al leer Google Sheets");
            }

            const resData = await req.json();

            if (resData.success && resData.data.length > 0) {
                return {
                    success: true,
                    data: resData.data,
                    lastSync: new Date().toISOString()
                };
            } else {
                return {
                    success: false,
                    error: "La hoja está vacía o el rango es incorrecto"
                }
            }

        } catch (error) {
            console.warn("Fallo leyendo la hoja real, cayendo en fallback MOCK", error);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: this.mockSheetData,
                        lastSync: new Date().toISOString()
                    })
                }, 1000)
            })
        }
    }

    async updateMaterialEnSheet(rowData) {
        if (!this.isConnected) throw new Error("No autenticado en Google")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        const rowIndex = rowData.id;

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs',
                    range: `Hoja 1!A${rowIndex}:D${rowIndex}`,
                    values: [
                        [
                            rowData.item || '',
                            rowData.descripcion || '',
                            rowData.unidad || '',
                            rowData.cantidad !== undefined ? String(rowData.cantidad).replace('.', ',') : '0'
                        ]
                    ]
                })
            });

            if (!req.ok) throw new Error("HTTP error al actualizar Google Sheets");
            return { success: true, timestamp: new Date().toISOString() };
        } catch (error) {
            console.error("Fallo actualizando la hoja real", error);
            throw error;
        }
    }

    async addMaterialToSheet(rowData) {
        if (!this.isConnected) throw new Error("No autenticado en Google")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/append`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs',
                    values: [
                        [
                            rowData.item || '',
                            rowData.descripcion || '',
                            rowData.unidad || '',
                            rowData.cantidad !== undefined ? String(rowData.cantidad).replace('.', ',') : '0'
                        ]
                    ]
                })
            });

            if (!req.ok) throw new Error("HTTP error al añadir a Google Sheets");
            const res = await req.json();
            return { success: true, response: res.response };
        } catch (error) {
            console.error("Error añadiendo material a Sheet:", error);
            throw error;
        }
    }

    async deleteMaterialFromSheet(rowIndexInUI) {
        if (!this.isConnected) throw new Error("No autenticado en Google")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        // UI rowIndex 0 es el primer material después del encabezado.
        // Excel: Fila 1 = Encabezado. Fila 2 = Primer dato.
        // batchUpdate DeleteDimension: 0-based index. Fila 1 es index 0. Fila 2 es index 1.
        const googleRowIndex = rowIndexInUI + 1;

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs',
                    rowIndex: googleRowIndex
                })
            });

            if (!req.ok) throw new Error("HTTP error al eliminar de Google Sheets");
            return { success: true };
        } catch (error) {
            console.error("Error eliminando material de Sheet:", error);
            throw error;
        }
    }

    // SIMULACIÓN GOOGLE DOCS & DRIVE (AHORA LLAMA AL PROXY REAL)
    async generateDocsFromTemplates(procesoInfo) {
        if (!this.isConnected) throw new Error("No autenticado en Google. Ve a Configuración de Perfil.")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        // Para este proyecto, el admin tendría estos IDs preconfigurados en PanelAdminGoogle
        // Aquí le pasamos cualquier ID público/compartido creado por el usuario como plantilla

        // Mapeo de placeholders a enviar a Docs: {{fecha}}, {{numero}}, {{objeto}}, {{lugar}}, {{valor}}
        const rawFormData = {
            fecha: procesoInfo.fecha || new Date().toISOString().split('T')[0],
            numero: procesoInfo.numero_proceso || 'Borrador',
            objeto: procesoInfo.descripcion_objeto || 'Sin detalle',
            lugar: procesoInfo.lugar_ejecucion || 'No especificado',
            valor: Number(procesoInfo.valor_estimado || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
        }

        console.log("DEBUG: Datos enviados para generación de documentos:", rawFormData);

        try {
            // Único Documento Oficial: Estudio de Conveniencia y Oportunidad
            const estudioRes = await fetch(`${API_BASE_URL}/api/google/generate-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    templateId: '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0', // Template Principal
                    newDocumentName: `Estudio de Conveniencia - ${rawFormData.numero}`,
                    formData: rawFormData
                })
            });

            if (!estudioRes.ok) {
                if (estudioRes.status === 401) {
                    throw new Error("Tu sesión de Google ha expirado. Por favor, ve a 'Configuración de Perfil' y vuelve a conectar tu cuenta.");
                }
                throw new Error(`Error en Proxy backend al generar documento (Status: ${estudioRes.status})`);
            }

            const contentType = estudioRes.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                throw new Error("El servidor proxy no devolvió una respuesta JSON válida.");
            }

            const estudioData = await estudioRes.json();

            return {
                success: true,
                folderUrl: 'https://drive.google.com/drive/my-drive',
                documents: [
                    {
                        name: `Estudio de Conveniencia - ${rawFormData.numero}`,
                        type: 'doc',
                        url: estudioData.documentUrl || 'https://docs.google.com/'
                    }
                ]
            }

        } catch (err) {
            console.warn("Fallo en proxy real, usando respaldo fallback (MOCK):", err.message);
            // Si el backend no está corriendo, caemos en el behavior de demo:
            return new Promise((resolve) => setTimeout(() => resolve({
                success: true,
                documents: [
                    { name: `Estudio Previo`, type: 'doc', url: 'https://docs.google.com/document/u/0/create?rm=minimal' },
                    { name: `Minuta`, type: 'doc', url: 'https://docs.google.com/document/u/0/create?rm=minimal' },
                    { name: `CDP`, type: 'pdf', url: 'https://docs.google.com/document/u/0/create?rm=minimal' }
                ]
            }), 2000));
        }
    }
    async fillSpecificTemplate(formData) {
        if (!this.isConnected) throw new Error("No autenticado en Google. Ve a Configuración de Perfil.")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        const rawData = {
            fecha: formData.fecha || '',
            objeto: formData.descripcion_objeto || '',
            numero: formData.numero_proceso || '',
            valor: Number(formData.valor_estimado || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/docs/llenar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    formData: rawData
                })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Tu sesión de Google ha expirado. Por favor, ve a 'Configuración de Perfil' y vuelve a conectar tu cuenta.");
                    }
                    throw new Error(data.error || `Error del servidor (${response.status})`);
                }
                return data;
            } else {
                const text = await response.text();
                console.error("DEBUG: Respuesta no JSON recibida:", text.substring(0, 200));
                throw new Error(`El servidor de Google Proxy devolvió un error (HTML/Texto). Asegúrate de que el servidor esté corriendo y actualizado.`);
            }
        } catch (error) {
            console.error("Error en fillSpecificTemplate:", error);
            throw error;
        }
    }

    async fillLiveTestTemplate(formData) {
        if (!this.isConnected) throw new Error("No autenticado en Google. Ve a Configuración de Perfil.")

        const token = localStorage.getItem('real_google_access_token')
        if (!token) throw new Error("No se encontró token de acceso válido")

        try {
            const response = await fetch(`${API_BASE_URL}/api/google/test-new-doc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token,
                    sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs',
                    formData: formData
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error en diagnóstico");
            return data;
        } catch (error) {
            console.error("Error en fillLiveTestTemplate:", error);
            throw error;
        }
    }
}

export const googleService = new GoogleIntegrationService()

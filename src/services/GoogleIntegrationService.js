const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class GoogleIntegrationService {

    constructor() {
        // Al usar Service Account en el servidor, siempre se asume conexión habilitada.
        this.isConnected = true; 

        // Datos mockeados de una hoja de Google Sheets para Materiales
        this.mockSheetData = [
            { id: 1, item: '1.1', descripcion: 'Cemento Gris Portland x 50kg', unidad: 'Bulto', valor_unitario: 35000 },
            { id: 2, item: '1.2', descripcion: 'Arena de Peña lavada', unidad: 'm3', valor_unitario: 65000 },
            { id: 3, item: '1.3', descripcion: 'Ladrillo Prensado Estructural', unidad: 'Und', valor_unitario: 800 },
            { id: 4, item: '2.1', descripcion: 'Varilla Corrugada 1/2"', unidad: 'Und', valor_unitario: 22000 },
            { id: 5, item: '2.2', descripcion: 'Varilla Corrugada 3/8"', unidad: 'Und', valor_unitario: 14500 }
        ]
    }

    // SIMULACIÓN OAUTH (Para mantener la UI del Perfil contenta si existe botón, aunque ya no es estricto)
    async loginWithGoogle() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true
                localStorage.setItem('google_auth_token', 'true')
                resolve({
                    success: true,
                    email: 'service.account@nasakiwe.gov.co',
                    lastSync: new Date().toISOString()
                })
            }, 1000)
        })
    }

    async logoutGoogle() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: "La integración se maneja internamente seguro ahora." })
            }, 500)
        })
    }

    getAuthStatus() {
        return this.isConnected
    }

    // GOOGLE SHEETS
    async getMaterialesFromSheet(sheetId) {
        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs', // ID real del excel
                    range: 'Hoja 1!A:D' 
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
        const rowIndex = rowData.id;

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/append`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
        const googleRowIndex = rowIndexInUI + 1;

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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

    // GOOGLE DOCS & DRIVE (Generación por Service Account)
    async generateDocsFromTemplates(procesoInfo) {
        const rawFormData = {
            fecha: procesoInfo.fecha || new Date().toISOString().split('T')[0],
            numero: procesoInfo.numero_proceso || 'Borrador',
            objeto: procesoInfo.descripcion_objeto || 'Sin detalle',
            lugar: procesoInfo.lugar_ejecucion || 'No especificado',
            valor: Number(procesoInfo.valor_estimado || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
        }

        console.log("DEBUG: Datos enviados para generación de documentos (Service Account):", rawFormData);

        try {
            const estudioRes = await fetch(`${API_BASE_URL}/api/google/generate-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0', // Template Principal
                    newDocumentName: `Estudio de Conveniencia - ${rawFormData.numero}`,
                    formData: rawFormData
                })
            });

            if (!estudioRes.ok) {
                const errorData = await estudioRes.json().catch(() => ({}));
                const errorMessage = errorData.error || `Error del servidor (${estudioRes.status})`;
                throw new Error(`Error en Backend Service Account: ${errorMessage}`);
            }

            const estudioData = await estudioRes.json();

            return {
                success: true,
                folderUrl: 'https://drive.google.com/drive/my-drive', // URL temporal, idealmente devolver el folderId desde backend
                documents: [
                    {
                        name: `Estudio de Conveniencia - ${rawFormData.numero}`,
                        type: 'doc',
                        url: estudioData.documentUrl || 'https://docs.google.com/'
                    }
                ]
            }

        } catch (err) {
            const isLocalhost = API_BASE_URL.includes('localhost');
            const isNetworkError = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');

            if (isLocalhost && isNetworkError) {
                console.warn("Fallo en proxy local, usando respaldo fallback (MOCK):", err.message);
                return new Promise((resolve) => setTimeout(() => resolve({
                    success: true,
                    documents: [
                        { name: `Estudio Previo (DEMO)`, type: 'doc', url: 'https://docs.google.com/document/u/0/create?rm=minimal' },
                        { name: `Minuta (DEMO)`, type: 'doc', url: 'https://docs.google.com/document/u/0/create?rm=minimal' },
                        { name: `CDP (DEMO)`, type: 'pdf', url: 'https://docs.google.com/document/u/0/create?rm=minimal' }
                    ]
                }), 2000));
            }

            console.error("Error crítico en generación de documentos:", err);
            throw err;
        }
    }
    
    // Método consumido por TemplateViewer.jsx interactivo
    async fillSpecificTemplate(formData) {
        const rawData = {
            fecha: formData.fecha || '',
            objeto: formData.descripcion_objeto || '',
            numero: formData.numero_proceso || '',
            valor: Number(formData.valor_estimado || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/google/docs/llenar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formData: rawData
                })
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || `Error del servidor (${response.status})`);
                }
                return data;
            } else {
                const text = await response.text();
                throw new Error(`El servidor devolvió un error (HTML/Texto). Asegúrate de que el backend esté corriendo.`);
            }
        } catch (error) {
            console.error("Error en fillSpecificTemplate:", error);
            throw error;
        }
    }

    async fillLiveTestTemplate(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/google/test-new-doc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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

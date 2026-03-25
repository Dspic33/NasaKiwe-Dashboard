const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class GoogleIntegrationService {

    constructor() {
        // Modo simulación siempre conectado (el backend maneja el token real)
        this.isConnected = true
        localStorage.setItem('google_auth_token', 'true')

        // Datos mockeados de una hoja de Google Sheets para Materiales
        this.mockSheetData = [
            { id: 1, item: '1.1', descripcion: 'Cemento Gris Portland x 50kg', unidad: 'Bulto', valor_unitario: 35000 },
            { id: 2, item: '1.2', descripcion: 'Arena de Peña lavada', unidad: 'm3', valor_unitario: 65000 },
            { id: 3, item: '1.3', descripcion: 'Ladrillo Prensado Estructural', unidad: 'Und', valor_unitario: 800 },
            { id: 4, item: '2.1', descripcion: 'Varilla Corrugada 1/2"', unidad: 'Und', valor_unitario: 22000 },
            { id: 5, item: '2.2', descripcion: 'Varilla Corrugada 3/8"', unidad: 'Und', valor_unitario: 14500 }
        ]
    }

    /**
     * Obtiene un access_token válido del backend.
     * El backend usa el refresh_token almacenado en Supabase para renovarlo automáticamente.
     */
    async _getBackendToken() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/google/token`, { method: 'GET' })
            if (res.ok) {
                const data = await res.json()
                if (data.connected && data.access_token) return data.access_token
            }
        } catch (e) {
            console.warn('Backend token no disponible:', e.message)
        }
        return null
    }

    // SIMULACIÓN OAUTH (Redirige al backend)
    async loginWithGoogle() {
        window.location.href = `${API_BASE_URL}/auth/google/login`
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

    getAuthStatus() { return this.isConnected }

    // GOOGLE SHEETS
    async getMaterialesFromSheet(sheetId) {
        const token = await this._getBackendToken()
        if (!token) return { success: true, data: this.mockSheetData, lastSync: new Date().toISOString() }

        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: token, sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs', range: 'Hoja 1!A:D' })
            });
            if (!req.ok) throw new Error("Error HTTP Google Sheets");
            const resData = await req.json();
            if (resData.success && resData.data.length > 0) return { success: true, data: resData.data, lastSync: new Date().toISOString() };
            return { success: false, error: "La hoja está vacía" }
        } catch (error) {
            return { success: true, data: this.mockSheetData, lastSync: new Date().toISOString() }
        }
    }

    async updateMaterialEnSheet(rowData) {
        const token = await this._getBackendToken()
        if (!token) return { success: true, timestamp: new Date().toISOString() }
        const rowIndex = rowData.id;
        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token, sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs', range: `Hoja 1!A${rowIndex}:D${rowIndex}`,
                    values: [[rowData.item || '', rowData.descripcion || '', rowData.unidad || '', rowData.cantidad !== undefined ? String(rowData.cantidad).replace('.', ',') : '0']]
                })
            });
            if (!req.ok) throw new Error("Error actualizando Sheets");
            return { success: true, timestamp: new Date().toISOString() };
        } catch (error) { return { success: false, error: error.message }; }
    }

    async addMaterialToSheet(rowData) {
        const token = await this._getBackendToken()
        if (!token) return { success: true, response: 'mock' }
        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/append`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: token, sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs',
                    values: [[rowData.item || '', rowData.descripcion || '', rowData.unidad || '', rowData.cantidad !== undefined ? String(rowData.cantidad).replace('.', ',') : '0']]
                })
            });
            if (!req.ok) throw new Error("Error añadiendo a Sheets");
            return { success: true, response: (await req.json()).response };
        } catch (error) { return { success: false, error: error.message }; }
    }

    async deleteMaterialFromSheet(rowIndexInUI) {
        const token = await this._getBackendToken()
        if (!token) return { success: true }
        const googleRowIndex = rowIndexInUI + 1;
        try {
            const req = await fetch(`${API_BASE_URL}/api/google/sheets/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: token, sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs', rowIndex: googleRowIndex })
            });
            if (!req.ok) throw new Error("Error eliminando de Sheets");
            return { success: true };
        } catch (error) { return { success: false, error: error.message }; }
    }

    // GOOGLE DOCS & DRIVE
    async generateDocsFromTemplates(procesoInfo) {
        const token = await this._getBackendToken()
        if (!token) {
            return new Promise(resolve => setTimeout(() => resolve({
                success: true, folderUrl: 'https://drive.google.com/drive/my-drive',
                documents: [{ name: 'Estudio Previo (Demo)', type: 'doc', url: 'https://docs.google.com/document/u/0/create?rm=minimal' }]
            }), 1500))
        }

        const rawFormData = {
            fecha: procesoInfo.fecha || new Date().toISOString().split('T')[0],
            numero: procesoInfo.numero_proceso || 'Borrador',
            objeto: procesoInfo.descripcion_objeto || 'Sin detalle',
            lugar: procesoInfo.lugar_ejecucion || 'No especificado',
            valor: Number(procesoInfo.valor_estimado || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
        }

        try {
            const estudioRes = await fetch(`${API_BASE_URL}/api/google/generate-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: token, templateId: '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0', newDocumentName: `Estudio de Conveniencia - ${rawFormData.numero}`, formData: rawFormData })
            });
            if (!estudioRes.ok) throw new Error(`Error generando documento`);
            const data = await estudioRes.json();
            return {
                success: true, folderUrl: 'https://drive.google.com/drive/my-drive',
                documents: [{ name: `Estudio - ${rawFormData.numero}`, type: 'doc', url: data.documentUrl || 'https://docs.google.com/' }]
            }
        } catch (err) {
            return new Promise(resolve => setTimeout(() => resolve({
                success: true, documents: [{ name: 'Estudio Previo', type: 'doc', url: 'https://docs.google.com/document/u/0/create?rm=minimal' }]
            }), 2000));
        }
    }

    async fillSpecificTemplate(formData) {
        const token = await this._getBackendToken()
        if (!token) return { success: true, url: 'https://docs.google.com/document/u/0/create?rm=minimal' }
        
        const rawFormData = {
            fecha: formData.fecha || new Date().toISOString().split('T')[0],
            numero: formData.numero_proceso || 'Borrador',
            objeto: formData.descripcion_objeto || 'Sin detalle',
            lugar: formData.lugar_ejecucion || 'No especificado',
            valor: Number(formData.valor_estimado || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
        }

        try {
            // Utilizamos el mismo endpoint de generación de documentos pero con el nombre "Acta de Inicio"
            // Nota: Aquí podrías cambiar el templateId por el ID real de la plantilla del Acta de Inicio.
            // Por ahora usaremos la misma plantilla como demostración.
            const response = await fetch(`${API_BASE_URL}/api/google/generate-document`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    accessToken: token, 
                    templateId: '17HSl_q5nEo8qW0IGSc-WKTwthBRlahUWSPmjY2Plto0', // <-- ID de plantilla acta
                    newDocumentName: `Acta de Inicio - ${rawFormData.numero}`,
                    formData: rawFormData 
                })
            });
            
            if (!response.ok) throw new Error("Error en backend");
            const data = await response.json();
            return { success: true, url: data.documentUrl };
            
        } catch (error) { 
            console.error("Error en fillSpecificTemplate:", error);
            return { success: false, url: 'https://docs.google.com/document/u/0/create?rm=minimal' } 
        }
    }

    async fillLiveTestTemplate(formData) {
        const token = await this._getBackendToken()
        if (!token) return { success: true }
        try {
            const response = await fetch(`${API_BASE_URL}/api/google/test-new-doc`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: token, sheetId: '1j_WkLua3tB-N6DC-1_wKZJa1NXB_cBx1QmAPVw-rlAs', formData: formData })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) { return { success: false, error: error.message } }
    }
}

export const googleService = new GoogleIntegrationService()

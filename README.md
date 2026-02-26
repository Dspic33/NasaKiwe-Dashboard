# Dashboard de Funcionarios - Nasa Kiwe

## 📌 Introducción
Este es el portal institucional para la gestión de funcionarios y flujos contractuales de la **Corporación Nasa Kiwe**. El sistema permite centralizar la información de los trabajadores, sincronizar materiales desde Google Sheets y generar documentos automáticos (Estudios de Conveniencia, Contratos, etc.) en Google Drive.

## 🏗️ Arquitectura del Sistema

### Frontend
- **Framework:** React 18 (Vite)
- **Estilos:** Vanilla CSS (siguiendo manual de marca institucional)
- **Estado:** React Hooks
- **Autenticación:** Google OAuth 2.0 (Dominio restringido)

### Backend (Modular)
El servidor actúa como un proxy seguro para interactuar con las APIs de Google sin exponer secretos en el navegador.
- **Node.js + Express**
- **Servicios:**
  - `driveService.js`: Gestión de expedientes y permisos.
  - `sheetsService.js`: CRUD de materiales y precios.
  - `docsService.js`: Generación de documentos y reemplazo de variables.
- **Middleware:** Validación de tokens institucionales `@nasakiwe.gov.co`.

## ⚙️ Configuración y Despliegue

### Requisitos Previos
- Node.js (v18+)
- Cuenta de Google Cloud Console con APIs activadas (Drive, Docs, Sheets).

### Variables de Entorno (`.env`)
```env
# Frontend
VITE_GOOGLE_CLIENT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=...

# Backend (Secretos - NO USAR PREFIJO VITE_)
GOOGLE_API_KEY=...
PORT=3001
```

### Instalación
1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Iniciar desarrollo: `npm run dev`
4. Iniciar servidor backend: `node server/google-api.js`

## 🔐 Seguridad y Cumplimiento
- **Ley 1581 (Colombia):** El sistema restringe el acceso a documentos solo a usuarios autenticados con dominio `@nasakiwe.gov.co`.
- **RBAC:** Implementado en frontend mediante estados de usuario y en backend mediante validación de tokens.
- **WCAG 2.1:** Interfaz diseñada para accesibilidad (Nivel AA).

## 📄 Licencia
Software de propiedad institucional - Corporación Nasa Kiwe.

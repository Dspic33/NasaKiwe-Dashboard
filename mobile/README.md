# Nasa Kiwe - App Móvil de Residente 📱

Esta es la aplicación móvil diseñada para el **Residente de Obra**. Permite reportar avances técnicos y capturar evidencia fotográfica directamente desde la construcción.

## Características Principales

- **Offline-First**: Las fotos y reportes se guardan localmente si no hay conexión.
- **Sincronización Automática**: Los datos se cargan a la nube de Supabase al detectar internet.
- **Identidad Institucional**: Colores verde (#2D5F3E) y rojo (#C0001D) integrados.

## Cómo Ejecutar (Desarrollo)

1. Entra a la carpeta: `cd mobile`
2. Instala dependencias (si no lo has hecho): `npm install`
3. Inicia Expo: `npx expo start`
4. Escanea el código QR con la app **Expo Go** (Android/iOS).

## Cómo Generar el APK

Para generar el archivo instalable (.apk) para Android:

```bash
# 1. Instalar EAS CLI globalmente
npm install -g eas-cli

# 2. Iniciar sesión en Expo (requiere cuenta)
eas login

# 3. Configurar el proyecto
eas build:configure

# 4. Generar el APK
eas build -p android --profile preview
```

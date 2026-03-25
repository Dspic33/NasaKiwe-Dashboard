import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// En una app real de producción usaríamos variables de entorno seguras (ex. expo-constants)
// Aquí reutilizamos la configuración del proyecto para facilitar la integración inmediata
const SUPABASE_URL = "https://yjgbmqqewdvytokpvnfa.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ2JtcXFld2R2eXRva3B2bmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODQxODEsImV4cCI6MjA4ODY2MDE4MX0.GzrRf2o76toMoUuh8Hem9as27TIL6xjvgLFUc4FLhPU"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

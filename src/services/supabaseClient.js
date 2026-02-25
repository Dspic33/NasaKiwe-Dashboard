import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase no configurado. Asegúrate de tener las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env')
}

// Solo inicializar si las variables existen para evitar un crash fatal en el cliente
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

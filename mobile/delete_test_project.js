const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const TEST_ID = 'f8d3b2a1-5c1a-4e8b-9d7a-1b3c4d5e6f8a';

async function cleanup() {
  // Eliminar viviendas del proyecto de prueba
  const { error: vivError } = await supabase.from('viviendas').delete().eq('proyecto_id', TEST_ID);
  if (vivError) console.error('Error borrando viviendas:', vivError);
  else console.log('✅ Viviendas del proyecto test eliminadas');

  // Eliminar el proyecto de prueba
  const { error: projError } = await supabase.from('proyectos').delete().eq('id', TEST_ID);
  if (projError) console.error('Error borrando proyecto:', projError);
  else console.log('✅ PROYECTO TEST DE SINCRONIZACIÓN eliminado');
}

cleanup();

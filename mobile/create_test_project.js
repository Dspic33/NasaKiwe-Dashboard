const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createTestProject() {
  console.log('Creando proyecto de prueba para verificar sincronización...');
  
  const testID = 'test-sync-' + Date.now();
  const { data, error } = await supabase.from('proyectos').insert([
    {
      id: 'f8d3b2a1-5c1a-4e8b-9d7a-1b3c4d5e6f8a', // Un UUID válido diferente
      nombre: 'PROYECTO TEST DE SINCRONIZACIÓN',
      municipio: 'Test City',
      numero_proceso: 'TEST-001',
      estado: 'ACTIVO'
    }
  ]).select();

  if (error) {
    console.error('Error creating project:', error);
    process.exit(1);
  }

  console.log('Proyecto creado:', data[0].nombre);
  
  // Añadir una vivienda
  const { error: vivError } = await supabase.from('viviendas').insert([
    {
      proyecto_id: 'f8d3b2a1-5c1a-4e8b-9d7a-1b3c4d5e6f8a',
      numero_lote: '99',
      beneficiario: 'USUARIO TEST SINCRONIZACION'
    }
  ]);

  if (vivError) {
    console.error('Error creating dwelling:', vivError);
  } else {
    console.log('Vivienda de prueba añadida.');
  }
}

createTestProject();

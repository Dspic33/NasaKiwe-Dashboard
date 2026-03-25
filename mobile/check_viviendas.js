const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkViviendas() {
  const projectID = '6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f7a';
  console.log('Consultando viviendas para el proyecto:', projectID);
  
  const { data, error } = await supabase
    .from('viviendas')
    .select('id, numero_lote, beneficiario')
    .eq('proyecto_id', projectID)
    .order('numero_lote', { ascending: true });

  if (error) {
    console.error('Error fetching viviendas:', error);
    process.exit(1);
  }

  console.log(`Se encontraron ${data.length} viviendas:`);
  data.forEach(v => {
    console.log(`- ID: ${v.id}, Lote: ${v.numero_lote}, Beneficiario: ${v.beneficiario}`);
  });
}

checkViviendas();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function dumpViviendas() {
  const { data, error } = await supabase.from('viviendas').select('proyecto_id, numero_lote, beneficiario');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Total viviendas: ${data.length}`);
  data.forEach(v => {
    console.log(`- Proj: ${v.proyecto_id} | Lote: ${v.numero_lote} | Ben: ${v.beneficiario}`);
  });
}

dumpViviendas();

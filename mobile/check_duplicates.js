const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDuplicates() {
  const { data, error } = await supabase.from('proyectos').select('id, nombre, numero_proceso');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`Total proyectos: ${data.length}`);
  data.forEach(p => {
    console.log(`- ID: ${p.id} | Nombre: ${p.nombre} | Proceso: ${p.numero_proceso}`);
  });
}

checkDuplicates();

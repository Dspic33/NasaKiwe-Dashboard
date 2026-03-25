const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
  console.log('Consultando proyectos en Supabase...');
  const { data, error } = await supabase.from('proyectos').select('*');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Se encontraron ${data.length} proyectos.`);
    data.forEach(p => console.log(`- ID: ${p.id}, Nombre: ${p.nombre}`));
  }
}

checkProjects();

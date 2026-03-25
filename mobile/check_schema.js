const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.rpc('inspect_table_schema', { table_name: 'viviendas' });
  if (error) {
    // Si no existe la función, intentamos con una consulta directa a information_schema (si es posible vía RPC genérico o similar)
    console.log('No se pudo usar RPC inspect_table_schema, intentando consulta directa de columnas...');
    const { data: cols, error: colError } = await supabase.from('viviendas').select('*').limit(1);
    if (colError) {
      console.error(colError);
      process.exit(1);
    }
    console.log('Columnas encontradas:', Object.keys(cols[0]));
  } else {
    console.log(data);
  }
}

checkSchema();

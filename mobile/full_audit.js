const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fullAudit() {
  console.log('--- AUDITORIA DE BASE DE DATOS ---');
  
  // 1. Proyectos
  const { data: projs } = await supabase.from('proyectos').select('id, nombre, numero_proceso');
  console.log('\nPROYECTOS:');
  projs.forEach(p => console.log(`- ${p.id} | ${p.nombre} | ${p.numero_proceso}`));

  // 2. Contratos (Mapeo a proyectos)
  const { data: contrs } = await supabase.from('contratos').select('id, numero_proceso, bitacora_proyectos_id');
  console.log('\nCONTRATOS (Mapeo a Bitácora):');
  contrs.forEach(c => console.log(`- Contrato: ${c.numero_proceso} -> Proyecto Bitácora: ${c.bitacora_proyectos_id}`));

  // 3. Viviendas (Muestra las que tengan "Beneficiario Prueba")
  const { data: vivs } = await supabase.from('viviendas').select('id, proyecto_id, numero_lote, beneficiario');
  console.log('\nVIVIENDAS (Muestra):');
  vivs.forEach(v => {
    if (v.beneficiario && v.beneficiario.includes('Prueba')) {
      console.log(`- [MOCK?] Lote: ${v.numero_lote}, Ben: ${v.beneficiario}, ProjID: ${v.proyecto_id}`);
    } else if (v.proyecto_id === '6f8d3b2a-5c1a-4e8b-9d7a-1b3c4d5e6f7a') {
      console.log(`- [SYNCED] Lote: ${v.numero_lote}, Ben: ${v.beneficiario}, ProjID: ${v.proyecto_id}`);
    }
  });
}

fullAudit();

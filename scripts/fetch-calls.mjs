#!/usr/bin/env node
// Vuelca las llamadas recientes de Retell a un CSV (y guarda el JSON crudo de la
// última). Es el "handoff manual" sin n8n: lo usas para validar que la conversación
// funciona y que Retell rellena bien los campos de cualificación.
//
// Uso:
//   node scripts/fetch-calls.mjs [limit]
//
// Requiere la variable de entorno RETELL_API_KEY (y opcionalmente RETELL_AGENT_ID
// para filtrar solo este agente). Puedes ponerlas en un archivo .env en la raíz.
//
// Salidas:
//   leads/calls-export.csv   -> mismas columnas que tu Google Sheet (importable a mano)
//   leads/last-call-raw.json -> JSON completo de la llamada más reciente (inspección)
//
// Sin dependencias: solo Node (>=18).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// --- Mini cargador de .env (sin dependencias) ---
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const API_KEY = process.env.RETELL_API_KEY;
const AGENT_ID = process.env.RETELL_AGENT_ID; // opcional
const LIMIT = Number(process.argv[2]) || 50;

if (!API_KEY) {
  console.error('Falta RETELL_API_KEY (ponla en .env o como variable de entorno).');
  process.exit(1);
}

function csvEscape(v) {
  const s = (v ?? '').toString().replace(/\s+/g, ' ').trim();
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function estadoLlamada(call) {
  const reason = (call.disconnection_reason || '').toLowerCase();
  if (call.call_analysis?.in_voicemail || /voicemail|machine|answering/.test(reason)) return 'buzon';
  if (call.call_status && call.call_status !== 'ended') return call.call_status;
  return 'completada';
}

const COLUMNS = [
  'fecha', 'empresa', 'telefono', 'estado_llamada',
  'envia_a_canarias', 'interesado', 'tipo_mercancia', 'origen_mercancia',
  'destino_mercancia', 'frecuencia_y_volumen', 'operador_actual', 'mejoras_deseadas',
  'es_decisor', 'contacto_decisor', 'callback_dia_franja', 'solo_email', 'opt_out',
  'resumen', 'grabacion_url', 'closer_status',
];

function toRow(call) {
  const a = call.call_analysis || {};
  const c = a.custom_analysis_data || {};
  const dyn = call.retell_llm_dynamic_variables || {};
  return {
    fecha: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : '',
    empresa: dyn.company_name || c.company_name || '',
    telefono: call.to_number || '',
    estado_llamada: estadoLlamada(call),
    envia_a_canarias: c.envia_a_canarias ?? '',
    interesado: c.interesado ?? '',
    tipo_mercancia: c.tipo_mercancia ?? '',
    origen_mercancia: c.origen_mercancia ?? '',
    destino_mercancia: c.destino_mercancia ?? '',
    frecuencia_y_volumen: c.frecuencia_y_volumen ?? '',
    operador_actual: c.operador_actual ?? '',
    mejoras_deseadas: c.mejoras_deseadas ?? '',
    es_decisor: c.es_decisor ?? '',
    contacto_decisor: c.contacto_decisor ?? '',
    callback_dia_franja: c.callback_dia_franja ?? '',
    solo_email: c.solo_email ?? '',
    opt_out: c.opt_out ?? '',
    resumen: a.call_summary || '',
    grabacion_url: call.recording_url || '',
    closer_status: 'pendiente',
  };
}

async function main() {
  const body = { sort_order: 'descending', limit: LIMIT };
  if (AGENT_ID) body.filter_criteria = { agent_id: [AGENT_ID] };

  const res = await fetch('https://api.retellai.com/v2/list-calls', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`Error de la API de Retell (${res.status}): ${await res.text()}`);
    process.exit(1);
  }

  const data = await res.json();
  const calls = Array.isArray(data) ? data : data.calls || [];
  if (calls.length === 0) {
    console.log('No hay llamadas todavía. Haz una llamada de prueba web en el dashboard de Retell.');
    return;
  }

  // CSV
  const rows = calls.map(toRow);
  const csv = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((k) => csvEscape(r[k])).join(','))].join('\n') + '\n';
  writeFileSync('leads/calls-export.csv', csv, 'utf8');

  // JSON crudo de la más reciente (para confirmar nombres exactos de campos)
  writeFileSync('leads/last-call-raw.json', JSON.stringify(calls[0], null, 2), 'utf8');

  // Resumen en consola
  console.log(`OK  ${calls.length} llamadas -> leads/calls-export.csv`);
  console.log(`    JSON crudo de la última -> leads/last-call-raw.json\n`);
  for (const r of rows.slice(0, 10)) {
    console.log(`- ${r.fecha}  ${r.empresa || '(sin empresa)'}  [${r.estado_llamada}]`);
    console.log(`    canarias=${r.envia_a_canarias}  interesado=${r.interesado}  callback=${r.callback_dia_franja}`);
    if (r.resumen) console.log(`    resumen: ${r.resumen.slice(0, 120)}${r.resumen.length > 120 ? '…' : ''}`);
  }
  console.log(`\nRevisa leads/last-call-raw.json para ver los nombres EXACTOS dentro de custom_analysis_data.`);
}

main().catch((e) => {
  console.error('Fallo inesperado:', e.message);
  process.exit(1);
});

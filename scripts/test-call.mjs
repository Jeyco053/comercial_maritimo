#!/usr/bin/env node
// Lanza una llamada de PRUEBA real a un teléfono con el agente de Retell.
//
// Uso:
//   node scripts/test-call.mjs +34XXXXXXXXX "Empresa de Prueba"
//
// Requiere en .env:
//   RETELL_API_KEY      (la misma que usas en Bookia)
//   RETELL_FROM_NUMBER  (un número que tengas dado de alta en Retell, en E.164;
//                        al principio el que te da Retell, US/CA: +1...)
// Opcional:
//   RETELL_AGENT_ID     (fuerza este agente; si no, usa el asignado al número)
//
// Sin dependencias: solo Node (>=18).

import { readFileSync, existsSync } from 'node:fs';

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const API_KEY = process.env.RETELL_API_KEY;
const FROM = process.env.RETELL_FROM_NUMBER;
const AGENT = process.env.RETELL_AGENT_ID;
const TO = process.argv[2];
const COMPANY = process.argv[3] || 'tu empresa';

if (!API_KEY || !FROM || !TO) {
  console.error('Uso: node scripts/test-call.mjs +34XXXXXXXXX "Empresa"');
  console.error('Necesitas en .env: RETELL_API_KEY y RETELL_FROM_NUMBER (numero dado de alta en Retell).');
  process.exit(1);
}

const body = {
  from_number: FROM,
  to_number: TO,
  retell_llm_dynamic_variables: { company_name: COMPANY },
};
if (AGENT) body.override_agent_id = AGENT;

const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
  method: 'POST',
  headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const txt = await res.text();
if (!res.ok) {
  console.error(`Error de la API de Retell (${res.status}): ${txt}`);
  console.error('Revisa que RETELL_FROM_NUMBER esté dado de alta en Retell y tenga un agente asignado (o pasa RETELL_AGENT_ID).');
  process.exit(1);
}

const data = JSON.parse(txt);
console.log(`OK  llamada lanzada -> ${TO}`);
console.log(`    call_id: ${data.call_id}`);
console.log(`    estado:  ${data.call_status || '(registrando)'}`);
console.log('    Tu telefono deberia sonar en unos segundos. Caller ID = el numero de Retell (US en la prueba).');
console.log('    Al colgar, vuelca la ficha con: node scripts/fetch-calls.mjs');

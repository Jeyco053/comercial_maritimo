#!/usr/bin/env node
// Normaliza la salida del Apify Google Maps Scraper a un CSV listo para Retell Batch Call.
//
// Uso:
//   node scripts/normalize-phones.mjs <input.json> [output.csv]
//
// Entrada: export JSON del dataset de Apify (un array de objetos).
// Salida:  CSV con columnas  to_number,company_name,ciudad,sector
//          - to_number en formato E.164 (+34XXXXXXXXX)
//          - company_name se inyecta como variable dinámica en el prompt del agente
//
// Sin dependencias: solo Node (>=18).

import { readFileSync, writeFileSync } from 'node:fs';

const [, , inputPath, outputPath = 'leads/leads.csv'] = process.argv;

if (!inputPath) {
  console.error('Uso: node scripts/normalize-phones.mjs <input.json> [output.csv]');
  process.exit(1);
}

/**
 * Normaliza un teléfono español a E.164 (+34XXXXXXXXX) o devuelve null si no es válido.
 * Acepta formatos: "+34 928 12 34 56", "0034928123456", "928123456", "928 12 34 56"...
 * Descarta números no españoles o malformados para no gastar saldo en llamadas inválidas.
 */
function toE164ES(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const hadPlus = s.startsWith('+');
  let digits = s.replace(/\D/g, '');                 // deja solo dígitos
  if (digits.startsWith('00')) digits = digits.slice(2); // 0034... -> 34...
  if (!hadPlus && digits.length === 9) digits = '34' + digits; // 9xxxxxxxx -> 349xxxxxxxx
  if (digits.length === 11 && digits.startsWith('34')) {
    const local = digits.slice(2);
    if (/^[6-9]\d{8}$/.test(local)) return '+' + digits; // móvil 6/7, fijo 8/9
  }
  return null;
}

function csvEscape(v) {
  const s = (v ?? '').toString().replace(/\s+/g, ' ').trim();
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

let items;
try {
  items = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error(`No pude leer/parsear ${inputPath}: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(items)) {
  console.error('El JSON de entrada debe ser un array (export del dataset de Apify).');
  process.exit(1);
}

const rows = [];
const seen = new Set();
let skipped = 0;

for (const it of items) {
  const phone = toE164ES(it.phone ?? it.phoneUnformatted ?? it.telephone);
  if (!phone) { skipped++; continue; }
  if (seen.has(phone)) continue;          // dedupe por número
  seen.add(phone);
  rows.push({
    to_number: phone,
    company_name: it.title ?? it.name ?? '',
    ciudad: it.city ?? it.address ?? '',
    sector: it.categoryName ?? it.category ?? '',
  });
}

const header = 'to_number,company_name,ciudad,sector';
const csv = [
  header,
  ...rows.map((r) =>
    [r.to_number, r.company_name, r.ciudad, r.sector].map(csvEscape).join(','),
  ),
].join('\n') + '\n';

writeFileSync(outputPath, csv, 'utf8');
console.log(`OK  ${rows.length} contactos validos -> ${outputPath}`);
console.log(`    (${skipped} descartados por telefono invalido/no espanol; duplicados eliminados)`);

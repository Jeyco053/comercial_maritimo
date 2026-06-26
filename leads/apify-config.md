# Captación de leads — Apify Google Maps Scraper

Objetivo: obtener **negocios de la península que podrían enviar mercancía a Canarias**, con su **teléfono**.

## Actor
- En Apify, usa el actor **"Google Maps Scraper"** (`compass/crawler-google-places`).

## A quién buscar (términos de búsqueda)
Apunta a sectores que mueven mercancía hacia las islas. Ejemplos de `searchStringsArray`:
- `distribuidores alimentación`
- `mayoristas`
- `fabricantes muebles`
- `material construcción almacén`
- `empresas exportación`
- `ecommerce almacén logística`

Combínalos con **zonas de la península** (provincias/ciudades con puerto o polígonos industriales): Madrid, Valencia, Sevilla, Málaga, Cádiz, Barcelona, Zaragoza…

## Configuración recomendada
| Campo | Valor |
|---|---|
| `searchStringsArray` | términos de arriba |
| `locationQuery` / coordenadas | provincia o ciudad objetivo |
| `language` | `es` |
| `maxCrawledPlacesPerSearch` | empieza con **50–100** (MVP) |
| `skipClosedPlaces` | `true` |

## Campos que necesitamos (los demás se ignoran)
- `title` → nombre de la empresa
- `phone` / `phoneUnformatted` → teléfono
- `website` → opcional
- `city` / `address` → zona
- `categoryName` → sector

## Exportar
- Ejecuta el actor → **Dataset → Export → JSON** (más fiable que CSV para parsear).
- Guarda el archivo, p. ej. `leads/dataset.json`.

## Normalizar para Retell
```bash
node scripts/normalize-phones.mjs leads/dataset.json leads/leads.csv
```
El script:
- Convierte teléfonos a **E.164** (`+34…`).
- **Descarta** los sin teléfono válido o no españoles (no gastar saldo).
- **Elimina duplicados**.
- Genera `leads/leads.csv` con `to_number,company_name,ciudad,sector` → listo para subir a **Retell Batch Call**.

## Calidad de leads (consejos)
- Quita grandes cadenas/franquicias si no encajan con tu oferta.
- Prioriza negocios con web y reseñas (más reales/activos).
- Empieza con un lote pequeño y revisa la tasa de "sí transporta a Canarias" para afinar los términos de búsqueda.

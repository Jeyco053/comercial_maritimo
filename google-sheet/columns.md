# Google Sheet — "Negocios contactados"

El workflow de n8n y `scripts/fetch-calls.mjs` usan **auto-mapeo por nombre de columna**, así
que la **fila de cabecera de la hoja debe coincidir exactamente** con estos nombres (mismos
que los campos de Post-Call Analysis en Retell).

## Cabecera (pégala en la fila 1 de la hoja — separada por tabuladores)

```
fecha	empresa	telefono	estado_llamada	envia_a_canarias	interesado	tipo_mercancia	origen_mercancia	destino_mercancia	frecuencia_y_volumen	operador_actual	mejoras_deseadas	es_decisor	contacto_decisor	callback_dia_franja	solo_email	opt_out	resumen	grabacion_url	closer_status
```

## Versión CSV (Archivo → Importar)

```csv
fecha,empresa,telefono,estado_llamada,envia_a_canarias,interesado,tipo_mercancia,origen_mercancia,destino_mercancia,frecuencia_y_volumen,operador_actual,mejoras_deseadas,es_decisor,contacto_decisor,callback_dia_franja,solo_email,opt_out,resumen,grabacion_url,closer_status
```

## Qué significa cada columna

| Columna | Origen | Para qué |
|---|---|---|
| `fecha` | n8n / script | cuándo se hizo la llamada |
| `empresa` | variable dinámica `company_name` | nombre del negocio |
| `telefono` | `call.to_number` | número llamado |
| `estado_llamada` | derivado | `completada` / `buzon` / otro |
| `envia_a_canarias` | post-llamada | **filtro clave** para el closer |
| `interesado` | post-llamada | nivel de interés |
| `tipo_mercancia` | post-llamada | qué envían |
| `origen_mercancia` | post-llamada | desde dónde sale (península) |
| `destino_mercancia` | post-llamada | a qué isla/destino |
| `frecuencia_y_volumen` | post-llamada | cada cuánto y cuánto |
| `operador_actual` | post-llamada | transitario/competencia actual |
| `mejoras_deseadas` | post-llamada | qué mejorarían (pain points) |
| `es_decisor` | post-llamada | habla con quien decide |
| `contacto_decisor` | post-llamada | si no decide, con quién hablar |
| `callback_dia_franja` | post-llamada | día/hora preferida para el closer |
| `solo_email` | post-llamada | solo quiere info por email |
| `opt_out` | post-llamada | pidió no ser llamado |
| `resumen` | `call_summary` | resumen automático |
| `grabacion_url` | `recording_url` | escuchar la llamada |
| `closer_status` | manual | `pendiente` → `contactado` → `ganado`/`perdido` |

## Cómo trabaja el closer
1. Filtra `envia_a_canarias = true` y `interesado` en `alto`/`medio`.
2. Lee `resumen` + ficha; escucha `grabacion_url` si quiere.
3. Llama en `callback_dia_franja`; actualiza `closer_status`.
4. Respeta `opt_out = true` (no volver a llamar) y `solo_email = true` (enviar info, no llamar).

# Google Sheet — "Negocios contactados"

El workflow de n8n y `scripts/fetch-calls.mjs` usan **auto-mapeo por nombre de columna**, así
que la **fila de cabecera de la hoja debe coincidir exactamente** con estos nombres (mismos
que los campos de Post-Call Analysis en Retell → ver [`agent/post-call-analysis.md`](../agent/post-call-analysis.md)).

> El agente pasó de "setter" a **recopilar datos para cotizar**, así que la hoja tiene ahora
> 50 columnas: las 17 de cabecera/cualificación + las 30 de cotización (árbol de decisión) +
> `resumen`, `grabacion_url`, `closer_status` al final. Cualquier errata en un nombre rompe el
> auto-mapeo.

## Cabecera (pégala en la fila 1 de la hoja — separada por tabuladores)

```
fecha	empresa	telefono	estado_llamada	envia_a_canarias	interesado	tipo_mercancia	origen_mercancia	destino_mercancia	frecuencia_y_volumen	operador_actual	mejoras_deseadas	es_decisor	contacto_decisor	callback_dia_franja	solo_email	opt_out	tipo_carga	ruta_oferta	origen_completo	destino_completo	tipo_contenedor	tipo_servicio	trincaje_necesario	trincaje_quien	trincaje_certificado	peso	dimensiones	grua_izado	permisos_especiales	imo_adr	forma_mercancia	volquete	refrigerado	temperatura	fitosanitaria	fitosanitaria_tipo	multistop	despachante_propio	descarga_hammar	transbordable	almacen_logistico	open_top_tapa	preferencia_contacto	email_contacto	solo_grupaje	grupaje_datos	resumen	grabacion_url	closer_status
```

## Versión CSV (Archivo → Importar)

```csv
fecha,empresa,telefono,estado_llamada,envia_a_canarias,interesado,tipo_mercancia,origen_mercancia,destino_mercancia,frecuencia_y_volumen,operador_actual,mejoras_deseadas,es_decisor,contacto_decisor,callback_dia_franja,solo_email,opt_out,tipo_carga,ruta_oferta,origen_completo,destino_completo,tipo_contenedor,tipo_servicio,trincaje_necesario,trincaje_quien,trincaje_certificado,peso,dimensiones,grua_izado,permisos_especiales,imo_adr,forma_mercancia,volquete,refrigerado,temperatura,fitosanitaria,fitosanitaria_tipo,multistop,despachante_propio,descarga_hammar,transbordable,almacen_logistico,open_top_tapa,preferencia_contacto,email_contacto,solo_grupaje,grupaje_datos,resumen,grabacion_url,closer_status
```

## Qué significa cada columna

### Cabecera y cualificación
| Columna | Origen | Para qué |
|---|---|---|
| `fecha` | n8n / script | cuándo se hizo la llamada |
| `empresa` | variable dinámica `company_name` | nombre del negocio |
| `telefono` | `call.to_number` | número llamado |
| `estado_llamada` | derivado | `completada` / `buzon` / otro |
| `envia_a_canarias` | post-llamada | **filtro clave** |
| `interesado` | post-llamada | nivel de interés (`alto`/`medio`/`bajo`) |
| `tipo_mercancia` | post-llamada | qué mueven |
| `origen_mercancia` | post-llamada | origen (legacy; ver `origen_completo`) |
| `destino_mercancia` | post-llamada | destino (legacy; ver `destino_completo`) |
| `frecuencia_y_volumen` | post-llamada | cada cuánto y cuánto |
| `operador_actual` | post-llamada | naviera/transitaria actual |
| `mejoras_deseadas` | post-llamada | pain points |
| `es_decisor` | post-llamada | habla con quien decide |
| `contacto_decisor` | post-llamada | si no decide, con quién hablar |
| `callback_dia_franja` | post-llamada | día/franja para la 2ª llamada |
| `solo_email` | post-llamada | solo quiere info por email |
| `opt_out` | post-llamada | pidió no ser llamado |

### Datos de cotización (árbol de decisión)
| Columna | Origen | Para qué |
|---|---|---|
| `tipo_carga` | post-llamada | `COMPLETO` / `GRUPAJE` / `TTE` |
| `ruta_oferta` | post-llamada | ruta del catálogo ERP (PENINSULA-CANARIAS…) |
| `origen_completo` | post-llamada | origen completo (población/CP/zona) |
| `destino_completo` | post-llamada | destino completo (isla/población) |
| `tipo_contenedor` | post-llamada | 20/40/45 DRY, REEFER, OPEN TOP, FLAT RACK… |
| `tipo_servicio` | post-llamada | PUERTA/PUERTA, MUELLE/MUELLE… |
| `trincaje_necesario` | post-llamada | ¿necesita trincaje? |
| `trincaje_quien` | post-llamada | CLIENTE / PROVEEDOR / NUESTRO_TRANSPORTISTA |
| `trincaje_certificado` | post-llamada | ¿llega trincado y certificado, o necesitan que coordinemos el servicio? |
| `peso` | post-llamada | peso aproximado (clave en flat rack / carga especial) |
| `dimensiones` | post-llamada | largo × ancho × alto |
| `grua_izado` | post-llamada | grúa o carretilla; puntos de izado |
| `permisos_especiales` | post-llamada | sobremedida → posibles permisos de transporte terrestre |
| `imo_adr` | post-llamada | mercancía peligrosa IMO/ADR |
| `forma_mercancia` | post-llamada | granel/paquete/sacas/granalla (reciclaje) |
| `volquete` | post-llamada | ¿necesita volquete en la entrega? |
| `refrigerado` | post-llamada | ¿reefer? |
| `temperatura` | post-llamada | temperatura si refrigerado |
| `fitosanitaria` | post-llamada | ¿inspección fitosanitaria? |
| `fitosanitaria_tipo` | post-llamada | FISICA / DOCUMENTAL |
| `multistop` | post-llamada | recogida en varios puntos (cerámica) |
| `despachante_propio` | post-llamada | ¿tiene despachante propio? |
| `descarga_hammar` | post-llamada | descarga sin muelle / grúa hammar |
| `transbordable` | post-llamada | si es transbordable (cómo viene) |
| `almacen_logistico` | post-llamada | almacén cerca de puerto (muelle-puerta) |
| `open_top_tapa` | post-llamada | CON_TAPA / SIN_TAPA / TAPA_RIGIDA |
| `preferencia_contacto` | post-llamada | LLAMADA / EMAIL / AMBOS |
| `email_contacto` | post-llamada | email para la oferta/plantilla |
| `solo_grupaje` | post-llamada | solo hace grupaje (→ plantilla) |
| `grupaje_datos` | post-llamada | CP, pallets, medidas, peso, remonta |

### Cierre (siempre al final)
| Columna | Origen | Para qué |
|---|---|---|
| `resumen` | `call_summary` | resumen automático |
| `grabacion_url` | `recording_url` | escuchar la llamada |
| `closer_status` | manual | `pendiente` → `contactado` → `ganado`/`perdido` |

## Cómo trabaja el responsable comercial
1. Filtra `envia_a_canarias = true` y `interesado` en `alto`/`medio`.
2. Lee `resumen` + los datos de cotización; escucha `grabacion_url` si quiere.
3. Prepara la oferta y la entrega según `preferencia_contacto`:
   - `LLAMADA`/`AMBOS` → llama en `callback_dia_franja`.
   - `EMAIL`/`AMBOS` → envía la oferta a `email_contacto`.
   - `solo_grupaje = true` → envía la plantilla de grupaje a `email_contacto`.
4. Actualiza `closer_status`.
5. Respeta `opt_out = true` (no volver a llamar) y `solo_email = true` (enviar info, no llamar).

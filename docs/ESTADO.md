# Estado del proyecto y registro de cambios

> Documento para retomar el trabajo desde cualquier PC. Resume **qué es el proyecto hoy**,
> **qué se ha hecho** y **qué queda pendiente**. Última actualización: 2026-06-27.

## 1. Qué es (en una frase)

Agente de voz IA (**Jose**, de **Transcoesca**, una transitaria) que llama en frío a empresas,
**recopila todos los datos necesarios para cotizar** un transporte marítimo (Península↔Canarias,
entre islas, y puntualmente Baleares/internacional) y deja una ficha en Google Sheets. Con esos
datos, el **responsable comercial** prepara la oferta y la entrega en **2ª llamada o por email,
según prefiera el cliente**.

## 2. Cambio de enfoque importante (vs. la versión inicial)

El repo nació como un **agente "setter" single-prompt** (detectar Canarias + agendar 2ª llamada).
Tras entrevistar a un comercial y revisar el ERP, el proyecto pasó a:

- **Agente productivo = Conversation Flow** (`agent/conversation-flow.json`): un **árbol de
  decisión** con ramas por tipo de mercancía y contenedor.
- **Objetivo = cotizar**, no solo agendar: el agente reúne todos los datos para que el comercial
  prepare tarifa.
- **Tuteo** (tú/vosotros), nunca usted (lo pide la guía de comerciales de la empresa).
- El antiguo `agent/prompt.md` queda **LEGACY** (referencia histórica).

## 3. Arquitectura del flujo (end-to-end)

```
Apify (Google Maps) -> normalize-phones.mjs -> leads.csv
   -> Retell Batch Call (Twilio 800/900 + SIP)
   -> Agente "Jose" (Conversation Flow, voz castellana)
   -> Post-Call Analysis (39 campos) en custom_analysis_data
   -> webhook call_analyzed -> n8n -> Google Sheets (1 fila/empresa)
   -> Responsable comercial: prepara oferta -> 2a llamada o email segun preferencia
```

## 4. El Conversation Flow (`agent/conversation-flow.json`)

31 nodos: 21 `conversation` + 3 `subagent` + 7 `end` (9 de ellos globales). Verificado: JSON
válido, sin destinos rotos, todos los nodos alcanzables.

**Espina (camino feliz):** `greeting` -> `pitch_permission` (filtro) -> `split_carga`
(completo/grupaje) -> `ask_ruta` (origen/destino) -> `ask_contenedor` (tipo de equipo) ->
[`ask_servicio`] -> `merch_subagent` -> `transversales_subagent` -> `ask_volumen` ->
`ask_operador` -> `close_recap` (resumen + preferencia llamada/email) -> `capture_slot` /
`capture_email` -> `end_cotizar`.

**Ramas por contenedor:** `branch_flatrack` (flat rack / open side / plataforma -> trincaje:
quién + material), `branch_opentop` (con/sin tapa, rígida). Ambas confluyen en `ask_servicio`.

**Subagent de mercancía (`merch_subagent`):** profundiza solo en lo aplicable —
vehículo/maquinaria (trincaje), escayola/panel sándwich (cinta+cantoneras), reciclaje/chatarra
(forma granel/paquete/sacas/granalla + volquete + IMO/ADR), alimentación/piensos
(refrigerado/temperatura + fitosanitaria física/documental), bebidas/tabaco (docs + IMO/ADR),
plantas/abonos (fitosanitaria), cerámica (multistop + despachante propio), químicos (IMO/ADR).

**Subagent transversal (`transversales_subagent`):** almacén logístico (muelle-puerta),
descarga sin muelle (hammar / "dejar el contenedor en el suelo"), transbordo (cómo viene la
mercancía si el origen está lejos de puerto).

**Rama grupaje:** `grupaje_block` (CP origen/destino, nº pallets, medidas, peso, remontable) ->
`grupaje_email` -> `end_grupaje` (enviar plantilla).

**Nodos globales (interceptan en cualquier momento):** opt-out, no me interesa, contestador,
"¿quién sois?", piden precio, internacional/Baleares, "ahora no puedo", nuevo interlocutor,
solo-email.

**Config:** `language=es-ES`, `voice_id=retell-Cimo`, `model_choice=gpt-5.1` (cascading),
`ai_disclosure=true` (Retell añade la divulgación de IA automáticamente; el saludo solo menciona
la grabación), `start_speaker=agent`, `default_dynamic_variables.company_name`.

## 5. Modelo de datos (39 campos post-llamada)

**Fuente de verdad:** `post_call_analysis_data` en `agent/conversation-flow.json`.
Documentado para humanos en `agent/post-call-analysis.md`. **Los nombres deben coincidir
EXACTAMENTE** entre el flow, la cabecera de la Google Sheet (`google-sheet/columns.md`, 46
columnas) y el nodo "Construir ficha" de n8n (`n8n/workflow-handoff.json`), porque el mapeo es
por nombre. (Verificado automáticamente: 39 campos = 39 mapeos n8n = todos presentes como
columnas.)

- **13 de cualificación:** envia_a_canarias, interesado, tipo_mercancia, origen_mercancia,
  destino_mercancia, frecuencia_y_volumen, operador_actual, mejoras_deseadas, es_decisor,
  contacto_decisor, callback_dia_franja, solo_email, opt_out.
- **26 de cotización:** tipo_carga, ruta_oferta, origen_completo, destino_completo,
  tipo_contenedor, tipo_servicio, trincaje_necesario, trincaje_quien, trincaje_material,
  imo_adr, forma_mercancia, volquete, refrigerado, temperatura, fitosanitaria,
  fitosanitaria_tipo, multistop, despachante_propio, descarga_hammar, transbordable,
  almacen_logistico, open_top_tapa, preferencia_contacto, email_contacto, solo_grupaje,
  grupaje_datos.

## 6. Estructura de ficheros clave

| Fichero | Qué es |
|---|---|
| `agent/conversation-flow.json` | **Agente productivo** (importar en Retell) |
| `agent/post-call-analysis.md` | Doc de los 39 campos |
| `agent/begin-message.md` | Saludo (lo emite el nodo `greeting`); en tuteo |
| `agent/voicemail.md` | Buzón de voz (tuteo). **Pendiente: `[TELEFONO_DEVOLUCION]`** |
| `agent/prompt.md` | LEGACY (single-prompt, en usted) |
| `google-sheet/columns.md` | 46 columnas de la hoja |
| `n8n/workflow-handoff.json` | Webhook -> Construir ficha -> Google Sheets |
| `scripts/normalize-phones.mjs` | Apify JSON -> CSV E.164 para Retell Batch |
| `scripts/fetch-calls.mjs` | Vuelca llamadas de Retell a CSV (handoff manual) |
| `docs/validacion-sin-n8n.md` | Cómo probar sin Twilio/n8n |
| `docs/compliance-checklist.md` | Cumplimiento legal ES/UE |

## 7. Estado actual (qué está hecho)

- [x] Conversation Flow completo en tuteo, orientado a cotización (31 nodos, verificado).
- [x] 39 campos post-llamada alineados en flow + columns.md + n8n.
- [x] Docs actualizadas (README, post-call, columns, begin-message, voicemail a tuteo).
- [x] **Probado por llamada web (2 rondas)** con buen resultado. Ajustes aplicados a partir de
      los transcripts:
  - Separado contenedor y servicio (nodo `ask_servicio`) para no perder `tipo_servicio`.
  - Open side / plataforma enrutados a la rama de trincaje.
  - Pregunta de hammar reformulada (sin usar la palabra "hammar" de entrada).
  - Operador: pregunta "con cuál" también para transitarias.
  - Menos repetición de "Vale" (variar asentimientos en el global_prompt).
  - `ask_servicio` retiene hasta capturar origen Y destino.

## 8. Pendiente / próximos pasos

1. **Reimportar** el flow en Retell tras los últimos ajustes y seguir probando ramas no
   ejercitadas todavía: grupaje, flat rack/open side, mercancía especial (chatarra/IMO-ADR,
   alimentación/refrigerado), y objeciones globales (precio, Baleares, opt-out).
2. **Rellenar `[TELEFONO_DEVOLUCION]`** en `agent/voicemail.md` (formato dictado `9 22, 12, 34, 56`).
3. **Google Sheet:** crear la hoja con la cabecera de `google-sheet/columns.md` (46 columnas).
4. **n8n:** importar `n8n/workflow-handoff.json`, configurar credencial Google Sheets, seleccionar
   documento/pestaña, activar, y pegar la URL del webhook en el `webhook_url` del agente.
5. **Telefonía:** Twilio número **+34 800/900** + SIP trunk -> Retell (obligatorio legalmente;
   no móviles 6/7).
6. **Leads:** Apify (Google Maps Scraper) -> `node scripts/normalize-phones.mjs` -> `leads.csv`
   -> Retell Batch Call (mini-lote de 10-20 primero).
7. **Cumplimiento:** revisar `docs/compliance-checklist.md` antes de escalar volumen.
8. (Más adelante) Integración con el **ERP** usando los catálogos ya tipados (tipo_carga,
   ruta_oferta, tipo_contenedor, tipo_servicio, navieras/transitarias).

## 9. Cómo iterar el flow (bucle que funciona)

1. Reimportar `agent/conversation-flow.json` en Retell (crea un agente nuevo).
2. Llamada de prueba web (botón "Test / Talk to agent").
3. Pegar el transcript -> ajustar nodos/condiciones/textos -> volver a 1.

> Nota técnica: las transiciones del flow se evalúan por IA (tipo "prompt"). Para nodos que
> deben capturar 2 datos (p.ej. `ask_servicio` = origen+destino) usar una condición que retenga
> el nodo, no `Always` (que avanza tras la primera respuesta).

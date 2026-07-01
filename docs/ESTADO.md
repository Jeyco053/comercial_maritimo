# Estado del proyecto y registro de cambios

> Documento para retomar el trabajo desde cualquier PC. Resume **qué es el proyecto hoy**,
> **qué se ha hecho** y **qué queda pendiente**. Última actualización: n8n sincronizado a 43
> campos (tras el afinado de conversación, commit `eb3df65`).

## 1. Qué es (en una frase)

Agente de voz IA (**Jose**, de **Transcoesca**, una transitaria) que llama en frío a empresas,
**recopila todos los datos necesarios para cotizar** un transporte marítimo (Península↔Canarias,
entre islas, y puntualmente Baleares/internacional) y deja una ficha en Google Sheets. Con esos
datos, el **responsable comercial** prepara la oferta y la entrega en **2ª llamada o por email,
según prefiera el cliente**.

## 2. Enfoque

- **Agente productivo = Conversation Flow** (`agent/conversation-flow.json`): árbol de decisión
  con ramas por tipo de mercancía y contenedor. Objetivo = **cotizar**, no solo agendar.
- **Tuteo** (tú/vosotros), nunca usted (guía de comerciales de la empresa).
- `agent/prompt.md` = **LEGACY** (single-prompt histórico, en usted). No usar.

## 3. Arquitectura (end-to-end)

```
Apify (Google Maps) -> normalize-phones.mjs -> leads.csv
   -> Retell Batch Call (para PRODUCCION: Twilio 800/900 + SIP)
   -> Agente "Jose" (Conversation Flow, voz castellana retell-Cimo, gpt-5.1)
   -> Post-Call Analysis (43 campos) en custom_analysis_data
   -> webhook call_analyzed -> n8n -> Google Sheets (1 fila/empresa)
   -> Responsable comercial: prepara oferta -> 2a llamada o email segun preferencia
```

## 4. El Conversation Flow (`agent/conversation-flow.json`)

31 nodos. JSON válido, sin destinos rotos, todos alcanzables (verificado por script).

**Espina:** `greeting` → `pitch_permission` (filtro) → `split_carga` (completo/grupaje,
**inteligente**: solo pregunta si no está claro) → `ask_ruta` → `ask_contenedor` → [`ask_servicio`]
→ `merch_subagent` → `transversales_subagent` → `ask_volumen` → `ask_operador` → `close_recap`
(cierre) → `end_cotizar`.

**Enrutado del filtro (afinado):** desde `pitch_permission`, "completo/un 40/contenedores/genérico"
→ `split_carga`; "solo grupaje" → `grupaje_block`; "no aplica" → `end_decline`. `split_carga` NO
repregunta si ya está claro que es completo; pregunta solo ante "contenedores" genérico.

**Ramas de contenedor:**
- `branch_flatrack` (flat rack / open side / plataforma) → ahora es **subagent** de carga especial:
  captura **qué máquina/carga es, peso, dimensiones (largo×ancho×alto), cómo se carga (grúa/carretilla
  + puntos de izado), y trincaje (quién + si llega trincado y certificado o hay que coordinar el
  servicio)**. NO pregunta material de amarre (cadenas/cantoneras) ni afirma nada de permisos.
- `branch_opentop` (con/sin tapa, rígida). Ambas confluyen en `ask_servicio`. Los dos branches
  **retienen el nodo** hasta capturar sus dos datos (no `always_edge`).

**Subagent de mercancía (`merch_subagent`):** profundiza solo en lo aplicable —
maquinaria/vehículos (si va en flat rack ya está cubierto), escayola/panel (cinta+cantoneras),
**chatarra/reciclaje** (forma granel/sacas/granalla + **limpio/contaminado** + volquete + peso +
**ADR como flag** + docs ambientales/residuos), **alimentación** (qué producto: carne/pescado/
procesado + refrigerado/temperatura + control **sanitario/veterinario o fitosanitario** como flag),
bebidas/tabaco, plantas/abonos, cerámica (multistop + despachante), químicos.

**Subagent transversal:** almacén logístico (muelle-puerta), descarga sin muelle (hammar), transbordo
(solo mercancía general, NO carga especial de flat rack).

**Rama grupaje:** `grupaje_block` → `grupaje_email` → `end_grupaje` (plantilla).

**Cierre (`close_recap`)** → ahora **subagent** que en 1 nodo: resume una vez + recoge preferencia
(llamada/email) + día/franja (si llamada) + email, **agrupado y sin segunda ronda**. `capture_slot`
/`capture_email` quedan solo de respaldo.

**Nodos globales:** opt-out, no me interesa, contestador, "¿quién sois?", **piden precio** (reframe
comercial, sin cifras), internacional/Baleares, "ahora no puedo", nuevo interlocutor, solo-email.

**Reglas globales clave (en `global_prompt`):** anti-eco (no repetir la última palabra del cliente),
no despedirse hasta tener todos los datos, **ADR/peligrosidad como FLAG** (sí/no/parcial, sin pedir
clase ni nº UN), **control del lead** (asertivo: "con esto ya lo tenemos para cotizar"), agrupar
datos técnicos en una pregunta, no repreguntar lo ya dicho, no afirmar lo que no se sabe (permisos/
plazos/tarifas), reconducir señales de compra.

**Config:** `language=es-ES`, `voice_id=retell-Cimo`, `model_choice=gpt-5.1` cascading,
`ai_disclosure=true` (Retell añade la divulgación de IA; el saludo solo menciona grabación),
`start_speaker=agent`, `default_dynamic_variables.company_name`. **Transition flexibility = RIGID**
(decisión pendiente: probar Flex, ver §8).

## 5. Modelo de datos (43 campos post-llamada)

**Fuente de verdad:** `post_call_analysis_data` en `agent/conversation-flow.json`. Documentado en
`agent/post-call-analysis.md`. Los nombres deben coincidir EXACTO entre flow, `google-sheet/columns.md`
(50 columnas) y el nodo "Construir ficha" de `n8n/workflow-handoff.json`.

✅ **SINCRONIZADO:** flow **43 campos** = n8n **43 mapeos** = `columns.md` **50 columnas**
(43 + 7 derivadas: fecha/empresa/telefono/estado_llamada/resumen/grabacion_url/closer_status).
El Code node de n8n ya usa `trincaje_certificado` + `peso`, `dimensiones`, `grua_izado`,
`permisos_especiales` (verificado por script).

- **13 cualificación:** envia_a_canarias, interesado, tipo_mercancia, origen_mercancia,
  destino_mercancia, frecuencia_y_volumen, operador_actual, mejoras_deseadas, es_decisor,
  contacto_decisor, callback_dia_franja, solo_email, opt_out.
- **30 cotización:** tipo_carga, ruta_oferta, origen_completo, destino_completo, tipo_contenedor,
  tipo_servicio, trincaje_necesario, trincaje_quien, **trincaje_certificado**, **peso**,
  **dimensiones**, **grua_izado**, **permisos_especiales**, imo_adr, forma_mercancia, volquete,
  refrigerado, temperatura, fitosanitaria, fitosanitaria_tipo, multistop, despachante_propio,
  descarga_hammar, transbordable, almacen_logistico, open_top_tapa, preferencia_contacto,
  email_contacto, solo_grupaje, grupaje_datos.

## 6. Ficheros clave

| Fichero | Qué es |
|---|---|
| `agent/conversation-flow.json` | **Agente productivo** (importar en Retell) |
| `agent/post-call-analysis.md` | Doc de los campos |
| `agent/begin-message.md` | Saludo (lo emite el nodo `greeting`); tuteo |
| `agent/voicemail.md` | Buzón (tuteo). **Pendiente: `[TELEFONO_DEVOLUCION]`** |
| `agent/prompt.md` | LEGACY (single-prompt, en usted) |
| `docs/test-personas.md` | **Personas para el AI simulated chat** (P1–P26), verificadas |
| `google-sheet/columns.md` | 50 columnas de la hoja |
| `n8n/workflow-handoff.json` | Webhook → Construir ficha → Google Sheets (43 campos, sincronizado) |
| `scripts/normalize-phones.mjs` | Apify JSON → CSV E.164 para Retell Batch |
| `scripts/fetch-calls.mjs` | Vuelca llamadas de Retell a CSV (handoff manual) |
| `scripts/test-call.mjs` | **Lanza una llamada de prueba real** con Retell |
| `docs/validacion-sin-n8n.md` | Cómo probar sin Twilio/n8n |
| `docs/compliance-checklist.md` | Cumplimiento legal ES/UE |
| `.env.example` | RETELL_API_KEY, RETELL_AGENT_ID, RETELL_FROM_NUMBER |

## 7. Estado actual (qué está hecho)

- [x] Conversation Flow completo en tuteo, orientado a cotización (verificado).
- [x] **Afinado intensivo de conversación** validado por AI simulated chat, rama a rama:
  - **P1 completo**, **P15 grupaje**, **P2 flat rack/maquinaria**, **P6 chatarra/IMO-residuos**,
    **P7 alimentación/reefer**, **P18 piden precio**, **P16 opt-out** → todas limpias.
  - Mejoras aplicadas (todas commiteadas): enrutado completo/grupaje robusto, branches retienen
    2 datos, trincaje reframe (argollas/certificado, no cantoneras), maquinaria pregunta
    peso/dimensiones/izado, reefer pregunta tipo de producto, ADR como flag, chatarra a fondo
    (contaminado/residuos), cierre en 1 nodo agrupado, control del lead, anti-eco, no despedirse
    antes de tiempo, no repetir confirmaciones, no repreguntar operador, reframe de precio,
    `split_carga` inteligente.
- [x] `scripts/test-call.mjs` para prueba de llamada real.
- [x] `docs/test-personas.md` con 26 personas de prueba (verificadas por workflow).
- [x] **n8n sincronizado a 43 campos** (flow = n8n = columns; verificado por script).

## 8. Pendiente / próximos pasos

1. **Prueba de teléfono real (rápida, sin Twilio):** en Retell → Phone Numbers coge un número US;
   asígnalo al agente; rellena `.env` (RETELL_API_KEY, RETELL_FROM_NUMBER, RETELL_AGENT_ID); lanza
   `node scripts/test-call.mjs +34TUMOVIL "Empresa"`. Caller ID +1, solo para probar la voz.
2. ~~Regenerar el Code node de n8n a los 43 campos~~ ✅ **HECHO** (flow = n8n = columns, verificado).
3. **Google Sheet:** crear la hoja con la cabecera de `google-sheet/columns.md` (50 columnas).
4. **n8n:** importar el workflow, credencial Google Sheets, documento/pestaña, activar, y pegar la
   URL del webhook (Production) en el `webhook_url` del agente.
5. **Telefonía de producción:** Twilio **+34 800/900** + SIP → Retell (obligatorio legalmente;
   no móviles 6/7). Cambiar `RETELL_FROM_NUMBER` al +34.
6. **`[TELEFONO_DEVOLUCION]`** en `agent/voicemail.md` (formato dictado `9 22, 12, 34, 56`).
7. **Leads:** Apify → `normalize-phones.mjs` → `leads.csv` → Retell Batch Call (mini-lote 10–20).
8. **Cumplimiento:** revisar `docs/compliance-checklist.md` antes de escalar.
9. **Decisión Flex vs Rigid:** el flow está en RIGID (pasa por todos los nodos). Varios retoques de
   orden/cierre/repregunta son fricción de Rigid. Pendiente un **A/B con Flex** para ver si se
   resuelven solos sin perder captura de datos.
10. (Más adelante) Integración con el **ERP** usando catálogos tipados (tipo_carga, ruta_oferta,
    tipo_contenedor, tipo_servicio, navieras/transitarias).
11. Ramas de mercancía aún sin ejercitar en test: bebidas, plantas/abonos, cerámica, químicos,
    open top; y objeciones: "no me interesa", "nuevo interlocutor", Baleares/internacional.

## 9. Cómo iterar el flow (bucle que funciona)

1. **Reimportar** `agent/conversation-flow.json` en Retell **tras cada cambio** (Retell ejecuta la
   versión importada, no el fichero; importar suele **crear un agente/versión nuevo** → asegúrate de
   probar el recién importado, no el anterior).
2. AI simulated chat con una persona de `docs/test-personas.md` (poner `company_name`), o llamada web.
3. Pegar el transcript → ajustar nodos/condiciones/`global_prompt` → volver a 1.

**Notas técnicas:**
- Transiciones evaluadas por IA (tipo "prompt"). Para nodos que capturan 2 datos, usar edge con
  condición que **retenga** el nodo, no `always_edge` (avanza tras la 1ª respuesta).
- Editar el JSON: los saltos de línea dentro de un texto van como `\n` escapado (es JSON válido);
  validar siempre con `node -e "JSON.parse(...)"` antes de commitear.
- Repo: `Jeyco053/comercial_maritimo`. Identidad git local ya configurada. `.env` y `leads/*` están
  en `.gitignore` (nunca subir claves ni PII).

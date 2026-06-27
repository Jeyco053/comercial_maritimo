# Comercial Marítimo — Agente de voz IA para transporte a Canarias (Transcoesca)

Agente de voz con IA que hace la **primera llamada** a negocios para ofrecer **transporte marítimo de mercancías a Canarias** (transitaria: Península↔Canarias, entre islas, y puntualmente Baleares/internacional), **recopila todos los datos necesarios para cotizar** y deja una **ficha lista** en Google Sheets. Con esos datos, el **responsable comercial** prepara la oferta y la entrega en una **2ª llamada o por email, según prefiera el cliente**.

> **Agente productivo = Conversation Flow** (`agent/conversation-flow.json`): un **árbol de decisión** en **tuteo** con ramas por tipo de mercancía y contenedor (trincaje, IMO/ADR, fitosanitaria, hammar, transbordo, grupaje…). El antiguo single-prompt (`agent/prompt.md`) queda **legacy**.

> **MVP config-first:** casi todo es configuración de servicios. El valor está en el **flow** (`agent/conversation-flow.json`) y los **campos post-llamada** (`agent/post-call-analysis.md`). El único "código" es un script de normalización de teléfonos y un workflow de n8n.

---

## Arquitectura

```
Apify (Google Maps)  →  normalize-phones  →  CSV (to_number, company_name…)
        │
        ▼
Retell Batch Call  →  Agente Setter (voz castellana)  →  cuelga
        │                                                     │
        │  (desde número +34 800/900 vía Twilio SIP)          ▼
        │                                          Webhook: call_analyzed
        ▼                                                     │
   [conversación libre guiada por prompt]                     ▼
                                            n8n  →  Google Sheets (1 fila/negocio)
                                                         │
                                                         ▼
                                               Closer humano hace la 2ª llamada
```

## Estructura del repo

| Carpeta / fichero | Qué es |
|---|---|
| `agent/conversation-flow.json` | **Agente productivo:** Conversation Flow (árbol de decisión) importable en Retell |
| `agent/prompt.md` | ⚠️ Legacy: system prompt single-prompt (histórico) |
| `agent/begin-message.md` | Mensaje inicial (lo emite el nodo `greeting` del flow) |
| `agent/post-call-analysis.md` | Campos estructurados a extraer tras la llamada (~40) |
| `agent/voicemail.md` | Mensaje de buzón de voz |
| `leads/apify-config.md` | Cómo configurar el scraper de Google Maps |
| `scripts/normalize-phones.mjs` | Apify (JSON) → CSV E.164 listo para Retell Batch |
| `n8n/workflow-handoff.json` | Workflow importable: webhook → Google Sheets |
| `google-sheet/columns.md` | Columnas de la hoja (+ cabecera para crearla) |
| `docs/compliance-checklist.md` | Cumplimiento legal España/UE |

---

## Requisitos (cuentas)

- **Retell AI** (ya la usas en Bookia) → `RETELL_API_KEY`.
- **Twilio** (ya la tienes) → para un número **+34 800/900** y SIP trunk.
- **Apify** → para el Google Maps Scraper.
- **Google** → una hoja de cálculo + n8n con credencial de Google Sheets.
- **n8n** → tu instancia de `probadorN8N` ya levantada.

---

## Paso a paso

> 🟢 **¿Empezando? Valida primero el agente sin Twilio ni n8n.** Retell tiene **llamada de prueba web** (hablas tú por el micro). Sigue [docs/validacion-sin-n8n.md](docs/validacion-sin-n8n.md): creas el agente (Paso 1), lo pruebas por web, y con `node scripts/fetch-calls.mjs` vuelcas las llamadas a CSV. Los pasos de abajo (Twilio + n8n) son para cuando la conversación ya convenza.

### Paso 0 — Telefonía (gating) ⚠️
Retell solo da números US/CA, así que traemos uno español.
1. En **Twilio**: compra un número **+34 800 o 900** (no móvil 6/7 — lo prohíbe la Orden TDF/149/2025).
2. Activa **Elastic SIP Trunking** en Twilio y apunta el trunk a Retell.
3. En **Retell → Phone Numbers → Import**, importa el número en formato E.164 (`+34…`).

### Paso 1 — Crear el agente en Retell (Conversation Flow)
1. **Import Agent** → sube `agent/conversation-flow.json` (ya trae idioma `es-ES`, voz `retell-Cimo`, modelo, el árbol de nodos y los ~40 campos de Post-Call Analysis). O **Create Agent → Conversation Flow** y reconstruye los nodos a partir del JSON.
2. **Voice:** revisa/ajusta la voz **castellana** (prueba 2–3, elige la más natural). El flow viene con `retell-Cimo`.
3. **Revisa el árbol** en el editor visual: nodos de la espina (apertura → filtro → completo/grupaje → ruta → contenedor/servicio → cierre), subagents (mercancía, transversales, grupaje) y nodos globales (objeciones, precio, opt-out…).
4. **Post-Call Analysis:** ya viene en el JSON. Si tu plan no admite tipo *Selector*, los enumerados están como *Text* con las opciones en la descripción.
5. **Voicemail detection:** ON → acción **Leave a message** con el texto de `agent/voicemail.md` (el flow también tiene `global_contestador`).
6. **Webhook:** pon el `webhook_url` **a nivel de agente** apuntando a tu n8n (Paso 3). Así se aíslan los eventos de este agente de los de Bookia.
7. **Pendiente de rellenar:** `[TELEFONO_DEVOLUCION]` en `agent/voicemail.md`.

### Paso 2 — Captar leads (Apify)
1. Configura el **Google Maps Scraper** siguiendo `leads/apify-config.md` (sector + zona).
2. Exporta el dataset como **JSON**.
3. Normaliza y genera el CSV para Retell:
   ```bash
   node scripts/normalize-phones.mjs ruta/al/dataset.json leads/leads.csv
   ```
   Salida: `leads/leads.csv` con columnas `to_number,company_name,ciudad,sector`.

### Paso 3 — Workflow n8n (handoff a Sheets)
1. En n8n: **Import from File** → `n8n/workflow-handoff.json`.
2. Configura la credencial **Google Sheets (OAuth2)** y selecciona tu documento/hoja.
3. Copia la **URL del Webhook** (Production) y pégala en el `webhook_url` del agente (Paso 1.6).
4. Activa el workflow.

### Paso 4 — Google Sheet
1. Crea una hoja nueva con las columnas de `google-sheet/columns.md` (o importa el CSV de cabecera).
2. Apunta el nodo Google Sheets del workflow a esa hoja.

### Paso 5 — Llamada de prueba (verificación)
1. Lanza **una** llamada a **tu propio móvil** (Retell → Test, o Create Phone Call API).
2. Comprueba: divulgación de IA + grabación → pregunta filtro Canarias → conversación natural → cierre.
3. En n8n, abre la ejecución y **revisa el payload real de `call_analyzed`**: confirma los nombres exactos dentro de `call.call_analysis.custom_analysis_data` (ajusta el nodo de parseo si cambian).
4. Verifica que **aparece una fila** en Google Sheets con resumen, campos y enlace de grabación.

### Paso 6 — Mini-batch
1. En **Retell → Batch Call**, sube `leads/leads.csv` (10–20 contactos para empezar).
2. Revisa transcripciones y tasa de relleno de campos. Itera el prompt.
3. Escala a 100–300 cuando la conversación convenza.

---

## Cumplimiento (no opcional)
Lee `docs/compliance-checklist.md`. Lo crítico desde el día 1: **declarar IA + grabación al inicio** (ya está en el prompt) y **llamar desde 800/900**. La LIA formal y la revisión legal, antes de escalar volumen.

## Costes (orientativo)
~**0,13–0,31 $/min** todo incluido (voz + LLM + telefonía), no el titular de 0,07 $. Batch dialing ~0,005 $/marcación. Valídalo con el piloto.

# Ruta rápida de validación (sin n8n, sin Twilio)

**Objetivo:** confirmar que (a) la conversación funciona y suena natural, y (b) Retell rellena bien los campos de cualificación — **antes** de montar telefonía (Twilio) y automatización (n8n).

> 🔑 Clave: para probar el "cerebro" del agente **no necesitas número de teléfono**. Retell permite una **llamada de prueba web** desde el dashboard: hablas tú por el micrófono haciéndote pasar por un negocio.

## Pasos

1. **Crea el agente en Retell** (README → Paso 1): pega `agent/prompt.md`, elige voz castellana, crea los campos de `agent/post-call-analysis.md` y el buzón.
   - ⏭️ **Salta el Paso 0 (Twilio) por ahora.** No hace falta para la prueba web.

2. **Llamada de prueba web** en el dashboard de Retell → botón **Test / Talk to agent**. Haz dos pruebas:
   - **Caso A (interesado):** dices que SÍ enviáis mercancía a Canarias → contesta sus preguntas de descubrimiento → acepta la llamada del especialista.
   - **Caso B (no aplica):** dices que NO transportáis a Canarias → comprueba que cierra con cortesía y sin insistir.

3. **Revisa el resultado** en el detalle de la llamada (Retell): transcripción, grabación, **resumen** y **custom_analysis_data** (los campos rellenos). ¿Coinciden con lo que dijiste?

4. **(Recomendado) Vuelca las llamadas a CSV** con el script:
   ```bash
   # 1) copia .env.example a .env y pon tu RETELL_API_KEY (y RETELL_AGENT_ID)
   node scripts/fetch-calls.mjs
   ```
   Genera:
   - `leads/calls-export.csv` → **mismas columnas que tu Google Sheet** (lo importas a mano = tu handoff manual mientras no haya n8n).
   - `leads/last-call-raw.json` → JSON completo de la última llamada, para confirmar los **nombres exactos** dentro de `custom_analysis_data`.

5. **Itera el prompt** (`agent/prompt.md`) hasta que la conversación y la extracción te convenzan. Repite 2–4.

## El handoff manual (mientras tanto)

Sin n8n, el flujo para el closer es:
```
llamadas en Retell  →  node scripts/fetch-calls.mjs  →  leads/calls-export.csv
                                                            │ (importar a mano)
                                                            ▼
                                                    tu Google Sheet  →  closer
```

## Cuándo pasar a la siguiente fase

Cuando 5–10 llamadas web salgan bien y los campos se rellenen correctamente:
1. **Twilio 800/900 → Retell** (README → Paso 0) para llamadas reales por teléfono.
2. **n8n** (README → Paso 3) para que cada llamada caiga **sola** en Google Sheets (ya no harás el volcado a mano).

El `last-call-raw.json` que guardaste te servirá para ajustar el nodo de parseo de n8n con los nombres de campo reales.

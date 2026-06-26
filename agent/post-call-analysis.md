# Campos de Análisis Post-Llamada (Retell)

> Estos son los campos **realmente configurados** en el agente Transcoesca. Retell usa el
> **nombre del campo como clave** dentro de `call.call_analysis.custom_analysis_data`, así que
> el script y el workflow de n8n leen exactamente estos nombres. La conversación sigue siendo
> 100% libre; esto es solo extracción automática al colgar.

| Campo | Tipo recomendado | Descripción (lo que debe extraer) | Opciones (Selector) |
|---|---|---|---|
| `envia_a_canarias` | Boolean | ¿La empresa envía o transporta mercancía a Canarias? | — |
| `interesado` | Selector | Nivel de interés en recibir la propuesta | `alto`, `medio`, `bajo` |
| `tipo_mercancia` | Text | Tipo de mercancía que suelen enviar | — |
| `origen_mercancia` | Text | Población/provincia de la península desde donde sale | — |
| `destino_mercancia` | Text | Isla o destino de Canarias al que envían | — |
| `frecuencia_y_volumen` | Text | Cada cuánto envían y qué volumen (palets, contenedores, kilos) | — |
| `operador_actual` | Text | Operador o transitario con el que trabajan ahora | — |
| `mejoras_deseadas` | Text | Qué mejorarían del servicio actual (precio, plazos, incidencias) | — |
| `es_decisor` | Boolean | ¿La persona con la que se habló decide la contratación del transporte? | — |
| `contacto_decisor` | Text | Si no es el decisor, nombre/cargo de quién decide | — |
| `callback_dia_franja` | Text | Día y franja horaria preferida para la llamada del closer | — |
| `solo_email` | Boolean | ¿Prefiere solo recibir información por email, sin llamada? | — |
| `opt_out` | Boolean | ¿Pidió expresamente no ser llamado de nuevo? | — |

## Campos automáticos de Retell (ya activados, no hay que crearlos)
- **Call Summary** — resumen de la conversación.
- **Call Successful** — si la llamada cumplió el objetivo.
- **User Sentiment** — sentimiento del interlocutor.
- `recording_url`, `transcript` — grabación y transcripción (en el objeto de la llamada).

## Tipos: consejo
- **Boolean** para sí/no claros (`envia_a_canarias`, `es_decisor`, `solo_email`, `opt_out`).
- **Selector** para `interesado` (alto/medio/bajo) → permite al closer priorizar.
- **Text** para el resto (información abierta).

## Descripciones sugeridas (pégalas en el campo "description" de cada campo en Retell)
- **envia_a_canarias:** "Devuelve true solo si la persona confirma que su empresa envía o transporta mercancía a las Islas Canarias; false si lo niega o no aplica."
- **interesado:** "alto si quiere que le llamen / pide propuesta; medio si está abierto pero dubitativo; bajo si responde por compromiso o pide solo email."
- **es_decisor:** "true si la persona indica que gestiona o decide la contratación del transporte; false si dice que decide otra persona."
- **contacto_decisor:** "Si no es el decisor, anota el nombre y/o cargo de la persona con quien habría que hablar."
- **callback_dia_franja:** "Día y franja horaria que indicó para que le llame el especialista (ej.: 'martes por la mañana')."
- **solo_email:** "true si insiste en recibir solo información por email y no quiere llamada del especialista."
- **opt_out:** "true si pidió expresamente que no se le vuelva a llamar."

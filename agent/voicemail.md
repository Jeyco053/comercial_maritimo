# Mensaje de buzón de voz

> En Retell: **Voicemail detection = ON** → acción **Leave a message** → pega este texto.
> Cuando el sistema detecta un buzón, marca la llamada como buzón (en el handoff lo verás
> como `estado_llamada = buzon`) para reintentar. En el Conversation Flow esto lo cubre además
> el nodo global `global_contestador`.

```
Hola, te llamamos de Transcoesca. Trabajamos el transporte marítimo de mercancía a
Canarias y queríamos ver cómo podemos ayudarte con tus envíos. Si quieres, llámanos
cuando puedas. Te doy el número, despacio: [TELEFONO_DEVOLUCION]. De nuevo:
[TELEFONO_DEVOLUCION]. Volveremos a intentar contactarte. ¡Muchas gracias y buen día!
```

**Notas:**
- Mantenlo corto (10–15 s): los buzones largos se borran.
- Incluye empresa, motivo y número de devolución.
- **Formato del teléfono (importante para el TTS):** en `[TELEFONO_DEVOLUCION]` escribe el
  número en cifras agrupadas de dos en dos separadas por comas, para forzar pausas y que se
  pueda apuntar. Ejemplo de patrón (NO es un número real): `9 22, 12, 34, 56`. Nunca lo pegues
  como `922123456` de corrido: el TTS lo leería de golpe, demasiado rápido para apuntarlo.
- Se repite el número una vez ("De nuevo: …"): es el único dato accionable del buzón.
- No incluyas la divulgación de "asistente con IA" en el buzón (no hay interacción con una
  persona en tiempo real); sí mantenla en la conversación en vivo.

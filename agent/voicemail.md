# Mensaje de buzón de voz

> En Retell: **Voicemail detection = ON** → acción **Leave a message** → pega este texto.
> Cuando el sistema detecta un buzón, marca la llamada como buzón (en el handoff lo verás
> como `estado_llamada = buzon`) para que el closer/automatización pueda reintentar.

```
Hola, buenos días. Le llamamos de [EMPRESA]. Trabajamos el transporte marítimo de
mercancía a Canarias y nos gustaría contarle cómo podemos ayudarle con sus envíos.
Si lo desea, puede devolvernos la llamada al [TELEFONO_DEVOLUCION]. Volveremos a
intentar contactarle. Muchas gracias y que tenga buen día.
```

**Notas:**
- Mantenlo corto (10–15 s): los buzones largos se borran.
- Incluye empresa, motivo y número de devolución.
- No incluyas la divulgación de "asistente con IA" en el buzón (no hay interacción con una
  persona en tiempo real); sí mantenla en la conversación en vivo.

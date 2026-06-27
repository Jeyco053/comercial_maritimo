# Mensaje inicial del agente (Begin Message en Retell)

Lo primero que dice el agente en outbound (el agente habla primero).

> **Con el Conversation Flow** (`agent/conversation-flow.json`), este mensaje lo emite el
> **nodo `greeting`** (no hay un campo "Begin Message" aparte). Además, `handbook_config.ai_disclosure`
> está en **`true`**, así que **Retell añade la divulgación de IA automáticamente**: por eso el
> `greeting` solo menciona la **grabación** y no repite "asistente con inteligencia artificial"
> (si no, sonaría dos veces). Este `.md` queda como referencia del texto y para el agente
> single-prompt legacy.

Texto (en **tuteo**, coherente con la guía de la empresa):

```
Hola, soy Jose, de Transcoesca, una transitaria de transporte marítimo y grupaje entre la Península y Canarias y entre las islas. Te aviso de que la llamada queda grabada. ¿Te pillo en buen momento?
```

**Notas:**
- Configura el agente para que **hable primero** (Agent speaks first / Begin with agent).
- Mantén la **grabación activada** (la estás anunciando, es legal y la necesitas para el
  responsable comercial y para revisar llamadas).
- **Tuteo** en todo (tú/vosotros), nunca usted: lo pide la guía de comerciales de Transcoesca.
- Divulgación de IA: la añade Retell por `ai_disclosure: true`. Si en tu plan/instancia esa opción
  no estuviera activa, añade tú la frase: *"…soy Jose, un asistente con inteligencia artificial de
  Transcoesca…"* para cumplir el AI Act.
- **Variante más comercial (para A/B):** anclar el motivo desde el segundo 1 — *"…¿Hacéis algún
  envío marítimo o grupaje a Canarias o entre islas?"* directamente tras el saludo. Puede subir o
  bajar la tasa según el sector; mídelo.

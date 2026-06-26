# Mensaje inicial del agente (Begin Message en Retell)

Tu prompt (Paso 1) dice "Saluda con el mensaje inicial", pero ese texto NO está en el
prompt: va en el campo **Begin Message / Welcome message** de Retell (lo primero que dice
el agente, porque en outbound **el agente habla primero**).

Aquí va el aviso legal obligatorio (IA + grabación). Pégalo en **Begin Message**:

```
Hola, buenos días. Le llama Jose, un asistente virtual con inteligencia artificial de
Transcoesca. Le informo de que esta llamada queda grabada. ¿Le pillo en buen momento?
Solo le robo treinta segundos.
```

**Notas:**
- Configura el agente para que **hable primero** (Agent speaks first / Begin with agent).
- Mantén la **grabación activada** (la estás anunciando, es legal y la necesitas para el
  closer y para revisar llamadas).
- Si prefieres que el saludo varíe, puedes dejar Begin Message más corto e incluir la
  divulgación al principio del prompt — pero **el aviso de IA + grabación tiene que sonar
  sí o sí en la primera frase**.

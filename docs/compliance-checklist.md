# Cumplimiento legal — Llamadas comerciales con IA (España/UE)

> Resumen práctico, **no es asesoría legal**. Antes de escalar a campañas grandes, consulta con un DPO / abogado especializado (RGPD + LOPDGDD + LGT 11/2022 + Orden TDF/149/2025 + AI Act se solapan y las multas son altas).

## Imprescindible desde el día 1 (ya cubierto en el proyecto)
- [x] **Declarar que es una IA** en la primera frase de la llamada — *"…un asistente virtual con inteligencia artificial de [EMPRESA]"* (AI Act art. 50). Ya está en `agent/prompt.md`.
- [x] **Avisar de la grabación** al inicio, como aviso separado. Ya está en `agent/prompt.md`.
- [ ] **Originar desde número 800/900** vía Twilio — **nunca** desde móvil (prefijos 6/7). Lo prohíbe la **Orden TDF/149/2025** (en vigor desde 7-jun-2025; sanción hasta 2 M€).
- [x] **Opt-out fácil** en la llamada + registro `opt_out`. El prompt ya respeta el "no me llames más"; el handoff lo guarda.

## Antes de escalar volumen
- [ ] **Segmentar a empresas / roles corporativos**, no a autónomos ni personas físicas (base legal más segura). El cold B2B a personas físicas es jurídicamente arriesgado.
- [ ] **Juicio de Interés Legítimo (LIA / ponderación)** documentado y archivado (AEPD Circular 1/2023): interés, necesidad y equilibrio frente a los derechos del contactado.
- [ ] **Aviso de privacidad por capas** (RGPD arts. 13–14): origen de los datos, finalidad, base de interés legítimo, plazo de conservación y derecho de oposición; servido en o justo tras el primer contacto.
- [ ] **Lista Robinson** (ADIGITAL): consultar antes de contactar a cualquier no-cliente que pudiera ser un consumidor/persona física. Mantén además tu **lista de supresión interna** (los `opt_out`).
- [ ] **Grabaciones:** finalidad clara, minimización de datos, plazo de conservación definido y base jurídica documentada.

## Lo que NO debes hacer
- [ ] **No** te apoyes solo en el art. 19 LOPDGDD como base para prospección comercial (cubre *localizar* a profesionales, no hacerles marketing).
- [ ] **No** asumas que por ser B2B estás exento del AI Act: la transparencia (art. 50) se debe a **cualquier persona física** que conteste el teléfono, incluido un empleado.
- [ ] **No** uses móviles (6/7) ni ocultes el identificador de llamada.

## Fechas clave
- **Orden TDF/149/2025**: numeración 800/900 obligatoria desde **7-jun-2025**.
- **AI Act art. 50** (transparencia): aplicable desde **2-ago-2026** — constrúyelo ya para no tener que readaptar.

## Referencias
- AI Act art. 50 — transparencia de sistemas que interactúan con personas.
- Ley 11/2022 (LGT) art. 66.1.b — llamadas comerciales no solicitadas.
- AEPD Circular 1/2023 — marketing telefónico (consentimiento vs interés legítimo).
- Orden TDF/149/2025 — numeración para llamadas comerciales.
- Lista Robinson — listarobinson.es

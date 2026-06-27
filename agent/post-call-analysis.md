# Campos de Análisis Post-Llamada (Retell)

> **Fuente de verdad: [`agent/conversation-flow.json`](conversation-flow.json)** (clave
> `post_call_analysis_data`). Este `.md` documenta los mismos campos para humanos. Si editas uno,
> edita el otro. Retell usa el **nombre del campo como clave** dentro de
> `call.call_analysis.custom_analysis_data`, así que el script y el workflow de n8n leen
> exactamente estos nombres. La conversación sigue siendo libre (árbol de decisión); esto es solo
> extracción automática al colgar.
>
> El agente pasó de "setter" (cualificar + agendar) a **recopilar todos los datos para cotizar**.
> Por eso hay dos bloques de campos: los **básicos de cualificación** (13) y los **de cotización**
> (26), que alimentan la oferta que prepara el responsable comercial.

## Campos básicos de cualificación

| Campo | Tipo recomendado | Descripción (lo que debe extraer) | Opciones (Selector) |
|---|---|---|---|
| `envia_a_canarias` | Boolean | ¿La empresa envía o transporta mercancía a Canarias/entre islas? | — |
| `interesado` | Selector | Nivel de interés en recibir tarifa | `alto`, `medio`, `bajo` |
| `tipo_mercancia` | Text | Tipo de mercancía que suelen enviar | — |
| `origen_mercancia` | Text | Zona/provincia de origen (legacy; ver `origen_completo`) | — |
| `destino_mercancia` | Text | Isla/destino (legacy; ver `destino_completo`) | — |
| `frecuencia_y_volumen` | Text | Cada cuánto envían y qué volumen (palets, contenedores, kilos) | — |
| `operador_actual` | Text | Naviera/transitaria con la que trabajan ahora (si naviera, cuál) | — |
| `mejoras_deseadas` | Text | Qué mejorarían del servicio actual (precio, plazos, incidencias) | — |
| `es_decisor` | Boolean | ¿La persona decide la contratación del transporte? | — |
| `contacto_decisor` | Text | Si no es el decisor, nombre/cargo de quién decide | — |
| `callback_dia_franja` | Text | Día y franja para la 2ª llamada del responsable comercial (si la prefiere) | — |
| `solo_email` | Boolean | ¿Prefiere solo info por email, sin llamada? (no es opt-out) | — |
| `opt_out` | Boolean | ¿Pidió expresamente no ser llamado de nuevo? | — |

## Campos de cotización (árbol de decisión)

> Estos los provoca el árbol de nodos del flow (rama de contenedor, mercancía, transversales,
> grupaje y cierre). Booleano/Selector para sí-no y enumerados; Text para lo abierto. En Retell,
> si tu plan no permite tipo "Selector", déjalos como **Text** indicando las opciones válidas en
> la descripción (es como están en el JSON, para no fallar al importar).

| Campo | Tipo | Descripción (lo que debe extraer) | Opciones |
|---|---|---|---|
| `tipo_carga` | Selector | Tipo de carga | `COMPLETO`, `GRUPAJE`, `TTE` |
| `ruta_oferta` | Selector | Ruta/oferta (catálogo ERP) | `PENINSULA-CANARIAS`, `CANARIAS-PENINSULA`, `CANARIAS-CANARIAS`, `PENINSULA-BALEARES`, `BALEARES-PENINSULA`, `INTERNACIONAL-EXPORTACION`, `INTERNACIONAL-IMPORTACION` |
| `origen_completo` | Text | Origen lo más completo posible (población/CP/zona) | — |
| `destino_completo` | Text | Destino lo más completo posible (isla/población/CP) | — |
| `tipo_contenedor` | Text | Tipo y tamaño (20/40/45 DRY, REEFER, OPEN TOP, FLAT RACK, OPEN SIDE, PLATAFORMA, JAULA, PW-HC, CAMION…) | — |
| `tipo_servicio` | Text | Combinación de puntos (PUERTA/PUERTA, MUELLE/MUELLE, MUELLE/PUERTA, ALMACEN/MUELLE…) | — |
| `trincaje_necesario` | Boolean | ¿La carga necesita trincaje (amarre)? | — |
| `trincaje_quien` | Selector | Quién hace el trincaje | `CLIENTE`, `PROVEEDOR`, `NUESTRO_TRANSPORTISTA` |
| `trincaje_certificado` | Text | ¿Llega trincado y certificado para embarque, o necesitan que coordinemos el servicio? | — |
| `peso` | Text | Peso aproximado de la carga/máquina (clave en flat rack) | — |
| `dimensiones` | Text | Largo × ancho × alto de la carga | — |
| `grua_izado` | Text | Cómo se carga: grúa o carretilla; puntos de izado | — |
| `permisos_especiales` | Boolean | Sobremedida → posibles permisos de transporte terrestre | — |
| `imo_adr` | Boolean | ¿Lleva IMO o ADR (mercancía peligrosa)? | — |
| `forma_mercancia` | Text | Cómo viene (paletizada, paquetes, sacas, granel/granalla) — reciclaje | — |
| `volquete` | Boolean | ¿La entrega/descarga necesita volquete? | — |
| `refrigerado` | Boolean | ¿Requiere reefer (refrigerado)? | — |
| `temperatura` | Text | Temperatura si es refrigerado | — |
| `fitosanitaria` | Boolean | ¿Requiere inspección fitosanitaria? | — |
| `fitosanitaria_tipo` | Selector | Tipo de inspección | `FISICA`, `DOCUMENTAL` |
| `multistop` | Boolean | ¿Recogida en varios puntos (multistop)? — cerámica | — |
| `despachante_propio` | Boolean | ¿Tienen despachante de aduanas propio? | — |
| `descarga_hammar` | Text | Cómo se descarga sin muelle / si necesitan grúa hammar o bajar el contenedor al suelo | — |
| `transbordable` | Text | Si es transbordable: cómo viene (paletizada, medidas estándar/excepcionales) | — |
| `almacen_logistico` | Text | Si muelle-puerta: almacén logístico cerca de puerto y dónde | — |
| `open_top_tapa` | Selector | Para open top | `CON_TAPA`, `SIN_TAPA`, `TAPA_RIGIDA` |
| `preferencia_contacto` | Selector | Cómo prefiere recibir la oferta | `LLAMADA`, `EMAIL`, `AMBOS` |
| `email_contacto` | Text | Email para la oferta o la plantilla de grupaje | — |
| `solo_grupaje` | Boolean | ¿Solo hace grupaje? (→ enviar plantilla) | — |
| `grupaje_datos` | Text | CP origen/destino, nº pallets, medidas L/A/An, peso, tipo, si remonta | — |

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
- **interesado:** "alto si pide la propuesta o muestra urgencia ('queremos moverlo ya'); medio si acepta la llamada para comparar o como alternativa; bajo si responde por compromiso, pide solo email o duda mucho."
- **origen_mercancia:** "Población, provincia o zona de la península desde donde sale la mercancía, SOLO si la persona lo menciona. Si no se dice en la conversación, déjalo vacío; no lo infieras ni lo inventes."
- **destino_mercancia:** "Isla o islas de Canarias a las que envían (Tenerife, Gran Canaria, Lanzarote, Fuerteventura, La Palma, etc.), SOLO si se menciona. Si no se dice, vacío; no lo deduzcas."
- **frecuencia_y_volumen:** "Recoge ambas cosas si aparecen: cada cuánto envían (semanal/mensual/esporádico) y qué volumen (palets, contenedores, kilos). Si solo se menciona una, anota esa y deja constancia de que falta la otra."
- **es_decisor:** "true si la persona indica que gestiona o decide la contratación del transporte; false si dice que decide otra persona."
- **contacto_decisor:** "Nombre y/o cargo de quien decide la contratación del transporte. Prioriza el nombre propio si se da; si solo hay cargo genérico ('compras'), anótalo igualmente."
- **callback_dia_franja:** "Día y franja concretos confirmados al final (ej.: 'jueves por la mañana'). Si quedó vago ('esta semana', 'más tarde'), anótalo tal cual pero deja claro que no es concreto."
- **solo_email:** "true si prefiere recibir info por email y declina la llamada del especialista, pero SIN pedir dejar de ser contactado en general. Pedir email NO es opt_out."
- **opt_out:** "true SOLO si pide expresamente no volver a ser llamado/contactado ('no me llaméis más', 'borradme'). Pedir información por email NO es opt_out."

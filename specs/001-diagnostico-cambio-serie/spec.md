# Feature Specification: Diagnóstico y cambio de serie — Nivel 1

**Feature Branch**: `main`.

**Created**: 2026-10-22

**Status**: Alcance de presentación de Nivel 1 cerrado por aceptación del usuario el 2026-10-24: escenarios de ahorro, bases de TAC y cobertura de las tablas. El ajuste de patrimonio agregado al corte está implementado y verificado con pruebas automatizadas. La aceptación no acredita una nueva revisión visual ni un estudio de usabilidad con asesores. Repositorio privado por decisión del usuario.

**Input**: User description: "nivel 1, extrae todo el conteto del html y del md"

**Actualización solicitada — 2026-10-24**: Validar la fecha del patrimonio agregado solo cuando el ticket no alcanza el mínimo y la evaluación llega a agregación de R04. Conservar estados de reglas anteriores; descartar patrimonio posterior al corte y aplicar regla 5 si no hay agregado válido suficiente, explicando el motivo sin bloquear otras series de la AGF.

## Actualización de interacción — 2026-10-22

Las instrucciones posteriores del usuario prevalecen sobre el flujo original: inicio vacío, carga manual y sin descargas de ejemplo ni etiquetas genéricas de datos ficticios en la interfaz. Se conserva la fuente recibida en el catálogo. Por preferencia posterior del usuario, la consulta conserva las pestañas Vista general, Posiciones y Acceso y series, con tabla compacta y sin descripciones redundantes. Los errores de estructura y consistencia deben identificar el archivo y el campo o fila afectados. El objetivo SC-005 requiere medición con asesores reales y sigue pendiente.

## User Scenarios & Testing *(mandatory)*

### Ajuste de tablas — 2026-10-24

La previsualización prioriza el contenido completo de cartola, catálogo y acuerdos: campos del contrato, descripción original, emisores, series, productos sin serie y campos adicionales recibidos, incluidos objetos y listas anidados. Conserva los decimales de los números interpretados; los valores predeterminados de serie se identifican como normalizados. Búsqueda y paginación permiten consultar todos los registros. Los datos adicionales de seguros se muestran como entrada, sin ampliar el motor de nivel 1 a R11. Las acciones de analizar y limpiar se ubican después de las tarjetas de archivos y antes de «Revisa los datos».

El análisis distingue diagnóstico R02 (todas las posiciones, con monto, peso, TAC y costo anual), comparación R05 (serie actual, escenario elegible, puntos base, ahorro anual y condicional adicional) y acceso R04. La pestaña Series contiene una sola tabla con posición, serie, TAC, estado, regla y motivo, sin desplegables. Solo incluye posiciones con series evaluables. Un producto sin series puede ser computable para costos: depósitos y efectivo permanecen en el diagnóstico con costo cero, sin generar comparación entre series. Los productos sin identificar se conservan en diagnóstico, sin atribuirles costo ni ahorro.

La comparación elegible incluye las posiciones con serie, aunque conserven la actual; la tabla condicional incluye solo oportunidades con ahorro adicional positivo, comparadas desde la elegible aplicada o la actual si se conserva. Las celdas muestran serie y TAC, sin costos. Las condiciones son breves, sin prefijos R04: agregación requiere confirmación escrita de la AGF; falta de mandato requiere obtenerlo y reevaluar. Los totales de TAC indican su base computable. Al filtrar posiciones se oculta el pie global para no atribuirlo al subconjunto.

La evidencia completa y todas las tareas siguen disponibles en el resultado del motor, pero la interfaz actual no las expone en esta tabla. El enlace «Ver evidencia» abre la tabla general de Series; su navegación específica queda registrada como mejora posterior, fuera de este cierre. Véase `docs/acceptance-audit.md` para límites de verificación.

### User Story 1 - Entender el costo de la cartola (Priority: P1)

Como asesor distribuidor de fondos, quiero cargar una cartola y conocer su costo anual,
la proporción identificada y la evidencia de cada cifra para explicar al cliente cuánto paga.

**Why this priority**: Un diagnóstico correcto es el valor mínimo del producto y la base
para evaluar cualquier cambio de serie.

**Independent Test**: Cargar el ejemplo con su catálogo y acuerdos y comparar el diagnóstico
con la tabla de referencia de esta especificación, sin necesitar recomendaciones.

**Acceptance Scenarios**:

1. **Given** el caso ACC-4471 al 2026-09-30, **When** el asesor carga la cartola de siete
   posiciones, **Then** ve 235.000.000 CLP totales, seis posiciones identificadas por
   230.000.000 CLP y una sin identificar por 5.000.000 CLP, equivalente a 2,13 % del total.
2. **Given** esas seis posiciones, **When** consulta su diagnóstico, **Then** ve costo anual
   de 5.180.000 CLP y TAC ponderada de 2,2522 %, incluyendo el depósito con costo cero
   y la posición Gamma aunque no exista acuerdo para proponerla.
3. **Given** una posición con cuotas por valor cuota distintas del monto declarado,
   **When** calcula, **Then** recibe una advertencia con ambos montos y la diferencia;
   el monto declarado se conserva como base identificada del cálculo.
4. **Given** una cartola inválida, **When** intenta cargarla, **Then** ve el campo o fila
   afectado y la corrección requerida sin recibir un diagnóstico aparentemente válido.

---

### User Story 2 - Explicar qué series puede usar cada posición (Priority: P2)

Como asesor, quiero consultar todas las series del fondo de cada posición, su costo y su
estado de acceso para distinguir alternativas utilizables, condicionadas y descartadas.

**Why this priority**: Una serie barata carece de valor si no se puede ofrecer al cliente.

**Independent Test**: Evaluar una posición de 60.000.000 CLP en Alfa Deuda UF con catálogo,
acuerdos y datos APV del ejemplo, sin calcular una cartera propuesta.

**Acceptance Scenarios**:

1. **Given** Alfa Deuda UF CLASI, **When** evalúa alternativas, **Then** ve B elegible por
   regla 6; F condicional por regla 4; M condicional por regla 3; APV bloqueada por regla 2.
2. **Given** Alfa RV Global y Beta Balanceado, **When** consulta sus series, **Then** Alfa A
   está bloqueada por cierre, Beta M es elegible por existir mandato y sus series APV están
   bloqueadas porque el cliente no tiene plan APV.
3. **Given** Gamma sin acuerdo vigente, **When** consulta su posición, **Then** la serie
   poseída sigue marcada como actual y B aparece fuera de alcance por regla 0.
4. **Given** una serie que simultáneamente no está habilitada y está cerrada,
   **When** se evalúa, **Then** prevalece fuera de alcance por regla 0.
5. **Given** ticket igual al mínimo, **When** se evalúa una serie abierta y permitida sin
   otras restricciones, **Then** es elegible sin recurrir al patrimonio agregado.
6. **Given** ticket inferior al mínimo y patrimonio agregado suficiente con fecha anterior
   o igual al corte, **When** ninguna regla 0 a 3 aplica, **Then** la serie es condicional
   por regla 4 y muestra ticket, mínimo, patrimonio, fecha y corte utilizados.
7. **Given** corte 2026-09-30, ticket de 60.000.000 CLP y patrimonio de 180.000.000 CLP
   al 2026-10-01, **When** se evalúan B con mínimo 5.000.000 y F con mínimo 100.000.000
   de Alfa Deuda UF, **Then** B sigue elegible por regla 6 y F queda bloqueada por regla 5:
   el patrimonio posterior no acredita el mínimo al corte. Se conserva su monto y fecha
   como evidencia, sin presentarlos como patrimonio aceptado.
8. **Given** patrimonio posterior al corte y una serie sin habilitación, cerrada, solo APV
   sin plan APV o que exige mandato ausente, **When** se evalúa, **Then** conserva
   respectivamente regla 0, 1, 2 o 3; la fecha del patrimonio no sustituye ese estado.
9. **Given** ticket igual o superior al mínimo y patrimonio posterior al corte,
   **When** ninguna regla 0 a 3 aplica, **Then** la serie es elegible por regla 6
   sin exigir patrimonio agregado válido al corte.
10. **Given** ticket inferior al mínimo y agregado de fecha válida pero de monto insuficiente,
    **When** ninguna regla anterior aplica, **Then** la serie queda bloqueada por regla 5
    con motivo de monto insuficiente, diferenciado del patrimonio posterior al corte.
11. **Given** dos acuerdos vigentes de la misma AGF con mandatos, series habilitadas o
    patrimonios distintos, **When** termina la carga de los tres archivos, **Then** ve una
    advertencia en Acuerdos de distribución y el botón «Analizar cartola» queda deshabilitado.
    El sistema no evalúa R04 ni combina atributos: se debe cargar un archivo corregido.

---

### User Story 3 - Comparar ahorro elegible y ahorro condicionado (Priority: P3)

Como asesor, quiero ver el cambio más barato accesible dentro del mismo fondo y AGF,
con el ahorro en pesos y puntos base, para preparar una explicación verificable al cliente.

**Why this priority**: Convierte el diagnóstico en una acción potencial sin cambiar la inversión.

**Independent Test**: Comparar CLASI con las series del mismo fondo para una sola posición;
Alfa Deuda UF debe dar 65 bps y 390.000 CLP anuales elegibles, más 300.000 CLP condicionales.

**Acceptance Scenarios**:

1. **Given** el caso completo, **When** calcula cambios elegibles, **Then** el ahorro suma
   1.650.000 CLP al año y el costo posterior es 3.530.000 CLP, con TAC de 1,5348 % sobre
   los mismos 230.000.000 CLP identificados.
2. **Given** las F de Alfa, **When** consulta oportunidades condicionadas, **Then** ve
   615.000 CLP adicionales separados, sus condiciones de agregación y tareas previas;
   esas series no se incorporan al escenario elegible.
3. **Given** Gamma o un fondo sin alternativa más barata elegible, **When** compara,
   **Then** ve ahorro cero y la explicación; no se cambia de fondo ni AGF.
4. **Given** las comisiones modificadas sin cambiar TAC ni habilitación,
   **When** repite el análisis, **Then** obtiene exactamente los mismos cambios y ahorros.
5. **Given** un empate de TAC con la serie actual, **When** compara, **Then** conserva
   la actual y no presenta un ahorro inexistente.
6. **Given** una serie barata bloqueada por depender de patrimonio posterior al corte,
   **When** se calcula el ahorro, **Then** esa serie no se usa como destino elegible ni
   como oportunidad condicional; las demás alternativas se comparan según su propio estado.
   Una alternativa condicional por mandato conserva su estado y exige reevaluar los mínimos
   y la fecha del patrimonio tras formalizarlo; no se acredita agregación con el dato posterior.

---

### User Story 4 - Repetir y revisar el análisis con datos distintos (Priority: P3)

Como evaluador o asesor, quiero cargar otro caso y modificar datos ficticios de referencia
para comprobar que los resultados responden a las reglas y poder revisar el análisis en pantalla.

**Why this priority**: Demuestra que la solución calcula y explica, sin depender de respuestas fijas.

**Independent Test**: Cargar una nueva cartola o sustituir el catálogo por una variante ficticia;
comprobar que solo aparecen los resultados correspondientes a la nueva entrada.

**Acceptance Scenarios**:

1. **Given** el caso de ejemplo, **When** el mínimo de Alfa B sube por encima del ticket
   y del patrimonio agregado, **Then** pasa a bloqueada por regla 5 y deja de generar
   el ahorro elegible anterior.
2. **Given** dos cargas válidas sucesivas, **When** termina la segunda, **Then** identificación,
   fecha, advertencias, estados y totales corresponden únicamente a la segunda carga.
3. **Given** el sitio publicado y una sesión privada sin cuentas, **When** se abre y carga
   el ejemplo, **Then** se puede completar el diagnóstico y comparación en español,
   tanto en escritorio como en pantalla estrecha y mediante teclado.

### Edge Cases

- Acuerdo inexistente, inactivo, futuro, vencido o sin habilitación específica: regla 0.
  Una comisión cero sigue representando una serie habilitada si su entrada existe.
- Inicio de acuerdo exactamente en el corte: no vigente por la redacción estricta de R01.
  Fin exactamente en el corte: vigente; fin ausente significa sin vencimiento establecido.
- Serie cerrada y solo APV: prevalece cierre; falta de mandato y mínimo incumplido:
  prevalece condición de mandato conforme a primera coincidencia.
- Ticket igual al mínimo: elegible; patrimonio agregado igual al mínimo con ticket menor
  y fecha anterior o igual al corte: condicional. No se suman tickets de posiciones distintas
  para fabricar elegibilidad.
- Patrimonio anterior al corte o exactamente en el corte: admite evaluación de agregación.
  Patrimonio posterior, aunque sea suficiente: no acredita mínimos al corte; si el ticket
  es inferior y no aplicó regla 0 a 3, se aplica regla 5 con motivo temporal explícito.
- Fecha posterior compartida por varias series de una AGF: solo afecta a las que llegan a
  agregación y la necesitan. No invalida el acuerdo, el diagnóstico ni las series cuyo ticket
  cumple el mínimo; tampoco reemplaza un estado ya determinado por reglas 0 a 3.
- Serie actual ya es la más barata o todas las alternativas cuestan más: ahorro cero.
  Empate entre alternativas más baratas: mostrar todas las empatadas con elección estable.
- Producto o serie desconocidos: conservar descripción y monto como sin identificar;
  no atribuir una TAC cero por falta de información.
- Cartola vacía, total cero o ninguna posición computable: importes cero cuando corresponda
  y TAC/pesos no disponibles; no dividir por cero ni presentar una mejora.
- Monto negativo, no numérico, fecha imposible, moneda distinta de CLP o identificadores
  duplicados en catálogo o acuerdos: mostrar advertencia al cargar y no habilitar el análisis
  hasta corregir el archivo. Dos acuerdos para la misma AGF son un conflicto de datos, incluso
  si aparentan ser equivalentes; no se combinan patrimonio, mandato, series o fechas.
- Monto cero es válido, genera costo cero y no altera el total; su ticket sigue siendo cero.
- Dos posiciones distintas del mismo fondo se evalúan por separado; una repetición en la
  cartola no se elimina silenciosamente. No se combinan montos para alcanzar mínimos.
- Cuotas o valor cuota nulos en un depósito son válidos; en fondos sin ambos datos se usa
  el monto declarado con advertencia de que no se comprobó la valorización.
- Seguro, `other` o producto sin costo verificable: declarar por separado y excluir de la
  base de TAC; no esconder su monto dentro de las posiciones computables.
- Una nueva carga inválida invalida la presentación de resultados como vigentes y permite
  corregirla y volver a seleccionar los archivos; no conserva cifras anteriores bajo los nuevos datos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La aplicación DEBE iniciar vacía y permitir seleccionar manualmente cartola, catálogo y acuerdos JSON. Los archivos de referencia se usan para comprobar resultados; no se cargan automáticamente.
  El formato mínimo de nivel 1 es JSON, opción admitida por el enunciado «JSON o CSV».
- **FR-002**: El análisis DEBE usar cartola, catálogo y acuerdos reemplazables por variantes
  ficticias, conservando referencia del cliente, corte, versión del catálogo y fuente de costos.
- **FR-003**: El sistema DEBE validar los campos necesarios y relaciones antes de calcular,
  distinguir una posición sin identificar de un dato inválido y señalar errores por campo o fila.
- **FR-004**: El sistema DEBE mostrar monto total, monto computable para TAC, monto sin
  identificar y porcentaje sin identificar sobre la cartola completa, además de otras exclusiones.
- **FR-005**: El diagnóstico DEBE calcular costo por posición, peso y TAC ponderada con R02:
  `peso_i = monto_i / total_identificado`; `costo_i = monto_i × tac_pct_i / 100`;
  `TAC_pct = Σ(peso_i × tac_pct_i)`; `costo_anual = Σ(costo_i)`.
- **FR-006**: Efectivo y depósitos DEBEN integrar la base computable con costo cero.
  Fondos mutuos y de inversión DEBEN usar la TAC de su serie; ETF solo cuentan cuando el
  catálogo declara su costo. Seguros, `other` y líneas sin identificar quedan fuera de esa base.
- **FR-007**: El sistema DEBE contrastar cuotas por valor cuota con el monto declarado cuando
  existan ambos datos y advertir diferencias superiores a 1 CLP, sin corregir silenciosamente
  el dato original ni sustituir su monto para la ponderación.
- **FR-008**: Se DEBE distinguir y declarar lectura de todo el catálogo frente a propuesta
  limitada por acuerdos vigentes y habilitación de serie; depósitos y efectivo no requieren AGF.
- **FR-008a**: Todo resultado de nivel 1 DEBE mostrar esta declaración, sustituyendo
  `{distribuidor}` por el valor recibido: «Esta propuesta considera productos de las
  administradoras con las que {distribuidor} mantiene acuerdos de distribución vigentes.
  Puede haber en el mercado alternativas de menor costo fuera de ese universo.»
- **FR-009**: Un acuerdo DEBE considerarse vigente si `estado = active`, su inicio es anterior
  al corte y su fin es nulo o igual/posterior al corte. La habilitación depende de que la serie
  figure bajo el producto, sin usar el valor de su comisión como condición de acceso.
- **FR-009a**: Si existen varios acuerdos vigentes de una misma AGF, el sistema NO DEBE
  combinar mandato, habilitación, patrimonio, fechas o evidencia entre
  registros. El archivo de acuerdos DEBE contener un único registro por AGF. Si detecta
  duplicados, DEBE mostrar una advertencia asociada a Acuerdos de distribución al terminar
  de cargar los tres archivos, deshabilitar «Analizar cartola» y exigir un archivo corregido.
  No DEBE iniciar R04 ni producir recomendaciones parciales.
- **FR-010**: La pantalla DEBE identificar la serie actual y evaluar cada alternativa por el
  orden de R04 de la tabla siguiente, exponiendo estado, número de regla y motivo con evidencia.
- **FR-011**: Campos omitidos de serie DEBEN interpretarse como `abierta = true`,
  `solo_apv = false` y `requiere_mandato = false`, según la nota del catálogo.
  TAC y mínimos necesarios no pueden inventarse si faltan.
- **FR-012**: El ticket DEBE ser el monto individual de la posición. La agregación solo permite
  estado condicional y DEBE mostrar ticket, patrimonio agregado, su fecha, corte de cartola
  y mínimo requerido. La validez temporal del patrimonio DEBE comprobarse únicamente si
  ninguna regla 0 a 3 determinó estado y el ticket es inferior al mínimo. Para justificar
  regla 4, el patrimonio DEBE alcanzar el mínimo y tener fecha anterior o igual al corte.
  Un dato posterior NO DEBE acreditar agregación: si no hay patrimonio válido suficiente,
  se aplica regla 5 y se explica si el impedimento es temporal o de monto. Una fecha posterior
  correctamente formada NO DEBE provocar rechazo global del archivo, invalidar el acuerdo
  ni bloquear otras series que no dependan del agregado. Si el ticket alcanza el mínimo,
  esta comprobación temporal no se necesita; se conserva regla 6 si ninguna anterior aplica.
- **FR-013**: Las alternativas condicionales DEBEN separarse de las elegibles y generar una
  lista de tareas de confirmación escrita. La herramienta prepara el análisis; no ejecuta cambios.
  Una condición por mandato de regla 3 DEBE conservarse aunque el patrimonio sea posterior;
  si además falta mínimo individual, las tareas DEBEN exigir acreditar patrimonio suficiente
  al corte o cumplir el mínimo con el ticket, y reevaluar R04 antes de cualquier ejecución.
- **FR-014**: Por posición se DEBE elegir la serie elegible de menor TAC dentro del mismo
  fondo y AGF solo si reduce el costo actual; sin alternativa válida se mantiene la posición.
- **FR-015**: El ahorro DEBE expresarse como `(TAC_actual_pct − TAC_nueva_pct) × monto / 100`
  en CLP anuales y `(TAC_actual_pct − TAC_nueva_pct) × 100` en bps. El total DEBE sumar
  ahorros por posición y mostrar costo y TAC posteriores con el mismo denominador.
- **FR-016**: El ahorro condicional adicional DEBE medirse respecto de la mejor opción elegible
  aplicada, o de la actual si se conserva; solo se informa si es positivo, con condición y serie.
  No se suma al ahorro elegible ni al escenario posterior sin condiciones.
  La interfaz DEBE mostrar por separado el escenario con condiciones cumplidas: costo
  elegible menos ahorro condicional adicional; ahorro total posible igual a ahorro elegible
  más adicional. Este escenario requiere cumplir las condiciones y reevaluar el acceso.
  La tabla condicional compara la serie elegible aplicada (o actual si se conserva) con
  la condicional, mostrando las series y sus TAC sobre esa misma base. Para el ejemplo: ahorro
  total posible 2.265.000 CLP, costo 2.915.000 CLP y TAC ponderada 1,2674 % sobre 230.000.000 CLP.
  Debajo de la tabla condicional, un resumen DEBE explicar el ahorro elegible y el cambio
  de TAC, el adicional sujeto a condiciones y el total posible. Si una posición con series
  se conserva por falta de acuerdo vigente, DEBE explicar el motivo y recordar que cambiar
  de AGF corresponde al Nivel 2. Todos los importes y nombres provienen del análisis cargado.
  Los pies de TAC de las tablas DEBEN indicar «TAC de estas posiciones» y su base computable
  para distinguir los subconjuntos de la base global del gráfico, sin añadir columnas.
- **FR-017**: La posición Gamma DEBE conservar su costo diagnosticado y ahorro cero por serie;
  alternativas de Delta u otra AGF no pueden sustituirla en este nivel.
- **FR-018**: Las comisiones NO DEBEN cambiar selección, empates, costos ni ahorro. Se conservan
  como contexto; no se muestran como costo adicional a la TAC ni como incentivo recomendado.
- **FR-019**: El análisis DEBE mostrar fecha y fuente de costos declaradas en los archivos, restricciones
  del universo y advertencias, con explicaciones en español. DEBE declarar que una persona
  revisa y decide; no ofrecer promesas de rentabilidad ni garantías de niveles no cubiertos.
- **FR-020**: La presentación DEBE ser utilizable en escritorio, pantalla estrecha y teclado,
  con foco visible y acceso a tablas, motivos y advertencias sin depender solo del color.
- **FR-021**: La herramienta DEBE recalcular al analizar datos nuevos y evitar mezclar resultados
  entre cargas. Mismas entradas DEBEN generar los mismos estados, cifras y orden de empates.
- **FR-022**: El nivel 1 DEBE disponer de resultados verificables con el ejemplo y variaciones
  de mínimos, cierre, mandato, APV, acuerdos y comisiones; no basta reproducir cifras estáticas.
- **FR-023**: La entrega DEBE incluir especificación propia, pruebas del motor y guía de uso,
  ejecución, pruebas, stack elegido y justificación, límites y decisiones discutidas.
- **FR-024**: La entrega DEBE funcionar en navegador sin servidor de aplicación, base de datos,
  cuentas ni llaves de API; usar datos ficticios y permitir publicación con marca propia en
  repositorio público y GitHub Pages. La publicación y envío de enlaces son pasos de entrega.

#### Orden obligatorio de elegibilidad — FR-010 / R04

Se detiene en la primera coincidencia. La etiqueta «actual» identifica tenencia y no concede
permiso para recomendar una nueva contratación de esa serie.

| Regla | Primera condición aplicable | Estado |
| --- | --- | --- |
| 0 | AGF sin acuerdo vigente o serie no habilitada | `out_of_scope` |
| 1 | Serie cerrada | `blocked` |
| 2 | Solo APV y cliente sin plan APV | `blocked` |
| 3 | Exige mandato y no existe para esa AGF | `conditional` |
| 4 | Mínimo mayor que ticket y patrimonio agregado alcanza el mínimo con fecha anterior o igual al corte | `conditional` |
| 5 | Mínimo mayor que ticket y sin patrimonio válido al corte suficiente para regla 4 | `blocked` |
| 6 | Ninguna anterior | `eligible` |

La fecha del patrimonio se contrasta con el corte solo al necesitar agregación, después de
las reglas 0 a 3. No constituye una regla previa ni una restricción global de la AGF.
En regla 5, un patrimonio posterior se informa como no utilizable al corte, no como monto
inferior si su importe sí alcanza el mínimo. La evidencia conserva el dato declarado y la
razón de descarte. Las fechas ausentes o imposibles siguen sujetas a validación de entrada
de FR-003; esta aclaración no cambia los campos obligatorios del contrato.

#### Referencia de diagnóstico — FR-004 a FR-006

Cliente ACC-4471, perfil moderado evaluado el 2025-08-14, sin APV; corte 2026-09-30.
Catálogo `ejemplo-2026-10`, fuente «Dato de ejemplo», corte de costos 2026-09-30.

| Posición | Monto CLP | Peso computable | TAC % | Costo anual CLP |
| --- | --- | --- | --- | --- |
| alfa-deuda-uf / CLASI | 60.000.000 | 26,09 % | 2,10 | 1.260.000 |
| alfa-rv-global / CLASI | 45.000.000 | 19,57 % | 3,20 | 1.440.000 |
| beta-balanceado / CLASI | 50.000.000 | 21,74 % | 2,80 | 1.400.000 |
| beta-corto-clp / CLASI | 30.000.000 | 13,04 % | 1,10 | 330.000 |
| gamma-rv-chile / CLASI | 25.000.000 | 10,87 % | 3,00 | 750.000 |
| deposito-uf-90d | 20.000.000 | 8,70 % | 0,00 | 0 |
| Total computable | 230.000.000 | 100,00 % | 2,2522 | 5.180.000 |

La séptima posición, «FM Zeta Acciones Asia, serie A», tiene 5.000.000 CLP sin identificar.
Los pesos mostrados pueden sumar 100,01 % por redondeo; el cálculo usa pesos sin redondear.

#### Referencia de estados — FR-010 a FR-013

| Producto | Serie actual | Alternativa | Estado | Regla | Evidencia |
| --- | --- | --- | --- | --- | --- |
| alfa-deuda-uf | CLASI | B | eligible | 6 | Ticket 60 M; mínimo 5 M |
| alfa-deuda-uf | CLASI | F | conditional | 4 | Mínimo 100 M; agregado Alfa 180 M |
| alfa-deuda-uf | CLASI | M | conditional | 3 | Alfa sin mandato |
| alfa-deuda-uf | CLASI | APV | blocked | 2 | Cliente sin APV |
| alfa-rv-global | CLASI | A | blocked | 1 | Serie cerrada |
| alfa-rv-global | CLASI | B | eligible | 6 | Ticket 45 M; mínimo 5 M |
| alfa-rv-global | CLASI | F | conditional | 4 | Mínimo 150 M; agregado Alfa 180 M |
| alfa-rv-global | CLASI | APV | blocked | 2 | Cliente sin APV |
| beta-balanceado | CLASI | B | eligible | 6 | Ticket 50 M; mínimo 20 M |
| beta-balanceado | CLASI | M | eligible | 6 | Beta con mandato; mínimo cero |
| beta-balanceado | CLASI | APV | blocked | 2 | Cliente sin APV |
| beta-corto-clp | CLASI | B | eligible | 6 | Ticket 30 M; mínimo 10 M |
| gamma-rv-chile | CLASI | B | out_of_scope | 0 | Sin acuerdo Gamma |

M significa millones de CLP. Las cinco series CLASI poseídas aparecen como «actual»;
el depósito carece de serie. El patrimonio agregado de Alfa tiene fecha 2026-09-30.

#### Referencia de ahorro — FR-014 a FR-017

| Posición | Cambio elegible | Bps | Ahorro CLP/año | Condicional adicional CLP/año |
| --- | --- | --- | --- | --- |
| alfa-deuda-uf | CLASI 2,10 % → B 1,45 % | 65 | 390.000 | F 0,95 %: 300.000 |
| alfa-rv-global | CLASI 3,20 % → B 2,30 % | 90 | 405.000 | F 1,60 %: 315.000 |
| beta-balanceado | CLASI 2,80 % → M 1,30 % | 150 | 750.000 | 0 |
| beta-corto-clp | CLASI 1,10 % → B 0,75 % | 35 | 105.000 | 0 |
| gamma-rv-chile | Sin cambio | 0 | 0 | 0 |
| deposito-uf-90d | Sin cambio | 0 | 0 | 0 |
| Total | Mismos fondos, AGF y montos | — | 1.650.000 | 615.000 |

Los 210.000.000 CLP de la tabla de cambios del enunciado corresponden a cinco posiciones
con fondos; no reemplazan la base de 230.000.000 CLP para calcular la TAC posterior.

### Key Entities *(include if feature involves data)*

- **Cliente**: Referencia ficticia, condición APV, perfil y fecha de evaluación.
- **Cartola**: Fecha de corte, moneda CLP y conjunto de posiciones originales.
- **Posición**: Producto y serie, descripción original, cuotas, valor cuota y monto declarado;
  conserva su identidad individual y clasificación de reconocimiento.
- **Emisor y producto**: AGF, banco o aseguradora; tipo, categoría, liquidez y series disponibles.
- **Serie**: Código, TAC anual porcentual, mínimo, apertura, restricción APV y mandato.
- **Catálogo**: Productos, emisores, versión, fecha de corte y fuente de costos.
- **Acuerdo**: Distribuidor, AGF, estado, intervalo de vigencia, habilitación por producto/serie,
  comisión, existencia de mandato y patrimonio agregado con fecha.
- **Evaluación de acceso**: Posición y alternativa evaluada, ticket, estado, regla y motivo.
  Si requiere agregación, incluye corte y fecha del patrimonio, monto declarado y motivo
  de aceptación o descarte del patrimonio para ese mínimo.
- **Diagnóstico**: Totales, exclusiones, pesos, costos actuales y advertencias con evidencia.
- **Comparación de series**: Alternativas elegibles, cambio elegido, empates, ahorro en CLP
  y bps, oportunidad condicional adicional y tareas previas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de montos y costos del caso de referencia coincide con las tablas,
  y las TAC y porcentajes coinciden al número de decimales mostrado.
- **SC-002**: Las 13 alternativas de la referencia y las cinco series actuales se presentan
  con su clasificación y explicación correctas; ninguna serie bloqueada, condicional
  o fuera de alcance se usa como destino del escenario elegible.
- **SC-003**: La comparación produce exactamente 1.650.000 CLP elegibles, 615.000 CLP
  condicionales adicionales y 3.530.000 CLP de costo posterior, manteniendo fondos y montos.
- **SC-004**: Cambiar solo comisiones deja el 100 % de resultados financieros y selecciones
  sin cambios; modificar mínimo, cierre, APV, mandato o acuerdo cambia todos los estados
  y ahorros afectados conforme al orden declarado.
- **SC-005**: Un asesor puede seleccionar manualmente los tres archivos de referencia y localizar costo actual, ahorro elegible,
  ahorro condicional y motivo de rechazo de Gamma en menos de tres minutos, tanto en
  escritorio como en móvil estrecho, sin asistencia ni cuentas.
- **SC-006**: Todos los resultados incluyen cliente, corte, referencia de costos y declaración
  del universo; todas las posiciones excluidas mantienen monto y motivo visibles.
- **SC-007**: Cada entrada inválida de los casos límite produce un mensaje que identifica
  la causa, y ninguna produce cifras no finitas ni resultados anteriores presentados como nuevos.
- **SC-008**: Repetir tres veces cada caso con las mismas entradas produce los mismos montos,
  estados y selección; las acciones principales se completan mediante teclado con foco visible.
- **SC-009**: La entrega final ofrece repositorio y sitio públicos con marca propia, documentación
  de uso y pruebas; el caso completo se puede revisar desde una sesión privada sin autenticación.
- **SC-010**: El 100 % de los escenarios temporales de historia 2, casos 6 a 10, reproduce
  los estados y reglas previstos: fecha anterior/igual, posterior, ticket suficiente,
  prioridad de reglas 0 a 3 y monto insuficiente. En el caso mixto de Alfa, B conserva
  regla 6 mientras F aplica regla 5 con motivo temporal; ninguna oportunidad de ahorro
  utiliza F. La fecha posterior no altera el costo diagnosticado ni los estados de las
  series que no necesitan agregación. Los casos de regla 3 conservan tareas de reevaluación.

La condición de repositorio y sitio públicos de SC-009 sigue pendiente de configuración con el nombre propio del titular; la usabilidad de SC-005 sigue pendiente de medición.

## Assumptions

- **Alcance acordado**: Nivel 1: leer, diagnosticar, evaluar acceso y comparar series del mismo
  fondo y AGF. R01, R02, R04 y R05 son obligatorias; independencia de comisiones y honestidad
  se mantienen como restricciones transversales de la constitución.
- **Contexto completo**: Se consultaron las nueve secciones de ambos documentos. Los cinco
  JSON embebidos son equivalentes. [context.md](context.md) conserva síntesis, trazabilidad,
  catálogo completo y los cinco conjuntos de datos ficticios para las fases siguientes.
- **Fuera de alcance**: Reasignación entre fondos o AGF, optimización de riesgo y concentración,
  metas, retornos y escenarios (R03, R06, R07), controles completos R08/R09, sección de seguros
  de R11, documento inmutable e impresión de R12 e historia de R13. No se presenta el ahorro
  de series como recomendación global más barata de todo el mercado o categoría.
- **Formato elegido**: JSON satisface la alternativa de importación del enunciado. CSV queda
  fuera de esta entrega; no se exige interpretar cartolas PDF, nombres aproximados ni texto libre.
- **Identificación**: Coincidencia exacta de identificadores de producto y código de serie.
  Se mantiene cada línea sin consolidar tickets ni eliminar duplicados de cartola.
- **Redondeo**: Operaciones sin redondeo intermedio; presentación CLP al peso, TAC agregada
  a cuatro decimales y pesos de posiciones a dos. Mitades se redondean hacia arriba para montos
  no negativos. Diferencias de valorización de hasta 1 CLP se toleran; el umbral se declara.
- **Fechas**: Se usa el corte de la cartola y no la fecha del equipo. Se conserva literalmente
  «empezó antes» en R01: inicio estricto anterior al corte y término inclusivo. Cambiar este
  límite requiere una decisión explícita porque modifica elegibilidad.
- **Patrimonio agregado al corte**: Para esta aclaración, `patrimonio_al <= corte` satisface
  la condición temporal de agregación; no se añade un plazo máximo de antigüedad. Un monto
  con fecha posterior no se retrotrae ni se presume válido al corte. El contrato actual no
  aporta otra acreditación histórica que permita aceptarlo. La confirmación escrita posterior
  sigue siendo tarea previa y no convierte por sí sola ese dato futuro en patrimonio al corte.
  La comprobación es por alternativa que necesita agregación; no modifica la vigencia R01.
- **Empates**: Conservar actual si no existe reducción estricta; si varias alternativas comparten
  la TAC mínima menor a la actual, listarlas y elegir por código de serie en orden lexicográfico,
  sin usar comisión. La condición debe informarse como empate de costo.
- **Fuentes incompletas**: No inventar fechas de obtención ausentes en el catálogo; declarar
  «no informada». El catálogo es ficticio y no se consulta información de mercado externa.
- **Comisiones**: Se preservan para trazabilidad; no se incluyen en la vista de análisis del
  cliente por defecto. Si se habilita su visualización, es una opción explícita y no cambia
  el cálculo. La decisión del documento formal se revisará al abordar nivel 3.
- **Perfil y riesgo**: Se conserva el perfil como contexto; no se determina vencimiento ni
  recalcula volatilidad en nivel 1. El cambio de serie conserva fondo, exposición y monto.
- **Productos adicionales**: Seguros y `other` se reconocen y declaran aparte, sin propuesta.
  No se atribuye costo cero a ETF sin costo declarado. El tratamiento detallado de seguros
  queda para su nivel, evitando exigir una sección documental no implementada.
- **Entrega documental**: Esta especificación es la fuente de alcance; la entrega futura DEBE
  incluir el `SPEC.md` propio solicitado con referencia a ella. El anexo es material interno:
  no se publica el enunciado ni se copia su diseño o marca en la solución del candidato.
- **Dependencias**: Datos ficticios provistos y constitución v1.0.0. Su fecha de ratificación
  pendiente no altera las reglas del nivel 1. Stack, estructura de archivos y despliegue se
  deciden en planificación. La aplicación de nivel 1 está construida y dispone de despliegue manual en Pages.

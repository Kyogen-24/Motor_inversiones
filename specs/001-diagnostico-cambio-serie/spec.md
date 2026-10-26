# Diagnóstico de costos y comparación de series — Nivel 1

Proyecto: Motor_inversiones. Revisión documental: 2026-10-24.

El nivel 1 permite cargar una cartola, entender sus costos, evaluar el acceso a las series de cada fondo y comparar el ahorro disponible sin cambiar de fondo ni de administradora. Aplica R01, R02, R04 y R05, con independencia de comisiones como principio transversal.

Esta especificación define el comportamiento y los criterios de aceptación del nivel 1. Los datos ficticios y sus resultados concretos están en la [guía de validación](quickstart.md). El [registro de verificación](checklists/validation.md) distingue lo comprobado de los pendientes. La aplicación también contiene otras modalidades, pero no forman parte de esta revisión ni cambian el diagnóstico de nivel 1.

## Decisiones vigentes del proyecto

- La aplicación inicia vacía. Cartola, catálogo y acuerdos se seleccionan manualmente; no hay carga automática de ejemplos.
- El monto declarado de cada posición es la base del cálculo. Cuotas por valor cuota se usa para comprobarlo y advertir diferencias, sin sustituirlo.
- El corte de la cartola determina la vigencia. El inicio del acuerdo debe ser estrictamente anterior al corte y su término puede coincidir con él.
- El patrimonio agregado se considera solo después de las reglas 0 a 3 y cuando el ticket individual no alcanza el mínimo. Si su fecha es posterior al corte, esa alternativa queda bloqueada por regla 5 con motivo temporal. El dato no invalida todo el conjunto ni altera las series que no lo necesitan.
- Se admite un único registro de acuerdo por emisor. Los duplicados se rechazan aunque uno sea histórico o los registros tengan condiciones iguales; no se combinan ni se elige el más reciente.
- Una serie poseída puede conservarse aunque no esté disponible para nuevas compras. «Actual» identifica tenencia y no concede acceso.
- Los empates más baratos se conservan como evidencia y se resuelven de forma estable por código de serie. Si no hay reducción estricta, se conserva la tenencia.

## Recorridos y aceptación

### Historia 1. Cargar y diagnosticar la cartola — Prioridad P1

Como asesor, quiero conocer el costo de la cartera y distinguir los importes computables, no identificados y excluidos para explicar la situación actual.

Se acepta cuando:

1. Los tres archivos permiten obtener todas las posiciones originales, sin eliminar duplicados ni perder líneas sin identificar.
2. El resumen concilia el monto total con la base computable, el importe sin identificar y las exclusiones. El porcentaje sin identificar utiliza el total de la cartola.
3. Las tenencias con costo conocido siguen en el diagnóstico aunque no exista acuerdo para proponer una nueva contratación.
4. Un archivo inválido señala el conjunto y el campo o fila afectados y retira la vigencia del resultado anterior.
5. Si la diferencia absoluta entre cuotas por valor cuota y monto declarado supera 1 CLP, se muestra una advertencia. Se conserva el monto declarado.

### Historia 2. Comprender el acceso a cada serie — Prioridad P1

Como asesor, quiero distinguir alternativas elegibles, condicionales, bloqueadas y fuera de alcance, con sus motivos y evidencia.

Se acepta cuando:

1. Cada serie del fondo identificado se evalúa por la primera coincidencia de R04.
2. La ausencia de acuerdo o habilitación prevalece sobre el cierre y las demás restricciones.
3. Una serie exclusiva APV queda bloqueada si el cliente no tiene plan APV, salvo que una regla anterior ya determine su estado.
4. La falta de mandato produce estado condicional antes de revisar mínimos. Formalizarlo exige repetir la evaluación completa.
5. La tenencia actual conserva su identificación sin convertirse por ello en una nueva contratación elegible.

### Historia 3. Comparar ahorro elegible y condicional — Prioridad P1

Como asesor, quiero comparar series del mismo fondo y AGF y explicar qué ahorro es elegible y cuál requiere condiciones previas.

Se acepta cuando:

1. El escenario posterior aplica únicamente cambios elegibles con ahorro positivo y conserva montos y base computable.
2. El ahorro condicional adicional se mide desde la mejor opción elegible aplicada, o desde la actual si se conserva. Se presenta separado y con sus tareas previas.
3. Sin una alternativa elegible más barata, se mantiene la serie y se explica el ahorro cero.
4. Otro fondo o AGF no aparece como destino de un cambio de serie de nivel 1.
5. Los empates no se resuelven por comisión ni se suman como si fueran ahorros acumulables.

### Historia 4. Repetir el análisis — Prioridad P2

Como asesor, quiero reemplazar las entradas y comprobar cómo cambian los resultados sin depender de nombres ni cifras fijas.

Se acepta cuando:

1. Cambiar una TAC actualiza el costo y los ahorros afectados.
2. Cambiar solo comisiones, manteniendo habilitación y condiciones, conserva las decisiones y cifras financieras.
3. Repetir las mismas entradas produce el mismo resultado, sin modificar los datos ni usar el reloj del dispositivo para decisiones.
4. Una lectura anterior no puede reemplazar los datos o resultados de la revisión vigente.

### Historia 5. Reconocer productos sin series y exclusiones — Prioridad P2

Como asesor, quiero ver efectivo, depósitos y exclusiones sin distorsionar el costo de los fondos ni perder patrimonio declarado.

Se acepta cuando:

1. Efectivo y depósitos entran en la base computable con costo cero, sin serie ni acuerdo de AGF.
2. Añadir efectivo modifica la base y los pesos, pero no crea costo ni ahorro por serie.
3. Seguros y otros productos reconocidos quedan excluidos con su motivo, sin confundirse con posiciones desconocidas. Un ETF solo computa si el catálogo declara su TAC.

## Casos límite

| Caso | Comportamiento |
| --- | --- |
| Acuerdo ausente, inactivo, vencido o con inicio no anterior al corte | La tenencia se diagnostica; nuevas series quedan fuera de alcance por regla 0. |
| Serie no habilitada, aunque esté abierta | Fuera de alcance por regla 0. La existencia de la clave habilita; una comisión cero no la elimina. |
| Fin del acuerdo igual al corte | Se admite por término; se comprueban estado e inicio. |
| Patrimonio posterior y ticket insuficiente, tras superar reglas 0–3 | Regla 5 con motivo temporal; las demás series y el diagnóstico continúan. |
| Patrimonio posterior con ticket suficiente o una regla previa aplicable | No reemplaza el estado determinado por esa regla ni rechaza el análisis. |
| Mandato formalizado con ticket insuficiente y patrimonio posterior | La nueva evaluación puede pasar de condicional por mandato a bloqueada por regla 5. |
| Patrimonio en la fecha de corte | Puede acreditar agregación si alcanza el mínimo. |
| Dos acuerdos del mismo emisor, incluso históricos | Error de coherencia; corregir el archivo antes de analizar. |
| Cierre y APV sin plan simultáneos | Prevalece cierre por regla 1. |
| Mandato y mínimo incumplidos simultáneamente | Prevalece mandato por regla 3; sus tareas no dan por resuelto el mínimo. |
| Ticket igual al mínimo | Cumple ese mínimo, sin recurrir al agregado. |
| Ticket inferior al mínimo y patrimonio válido suficiente | Condicional por regla 4; requiere confirmación escrita y reevaluación. |
| Ticket y patrimonio válido insuficientes | Bloqueada por regla 5 con motivo de monto. |
| Valor que al presentarse coincide con el mínimo | Se decide con el importe sin redondear, no con su representación visual. |
| Discrepancia de valorización exactamente de 1 CLP | No activa la advertencia; debe superar el umbral. |
| Total o base computable cero | Los porcentajes, TAC y pesos no calculables son nulos; no se divide por cero. |
| Producto o serie actual desconocidos | Se conserva la línea como sin identificar, con monto y motivo, sin inventar TAC. |
| Campo obligatorio ausente o tipo inválido | Error de entrada. Solo las tres banderas opcionales de serie reciben valores predeterminados. |
| Seguro, other o ETF sin TAC declarada | Exclusión conocida, con monto y motivo. |
| Dos posiciones del mismo fondo | Se evalúan por separado; no se suman tickets para cumplir mínimos. |
| Empate o ausencia de reducción estricta | Conservar tenencia o resolver la mejora empatada por código, sin comisión. |
| Varias oportunidades condicionales por posición | Se agrega únicamente la mejor reducción adicional positiva. |
| Nueva carga inválida | Retirar los resultados anteriores como vigentes y permitir corregir el archivo. |

## Requisitos funcionales

- **FR-001**: La aplicación permite seleccionar manualmente cartola, catálogo y acuerdos en JSON o CSV, combinados libremente. El diagnóstico no requiere supuestos ni una meta y no carga ejemplos automáticamente.
- **FR-002**: Se distinguen errores de lectura, sintaxis, estructura y coherencia. Se rechazan identificadores ambiguos y acuerdos duplicados por emisor. Un patrimonio posterior bien formado no invalida el archivo: su efecto se evalúa por alternativa en R04.
- **FR-003**: El resultado conserva cliente, corte, versión y fuente del catálogo, corte de costos y contexto del distribuidor y acuerdos utilizados.
- **FR-004 (R01)**: Se diagnostican las tenencias con costo reconocido aunque no sean contratables. Los destinos de cambio se limitan al universo habilitado y se declara que pueden existir alternativas fuera de él.
- **FR-005 (R01)**: Un acuerdo vigente tiene estado activo, inicio anterior al corte y fin nulo o igual/posterior al corte. La serie debe figurar bajo su producto. Efectivo y depósitos no requieren acuerdo de AGF.
- **FR-006 (R02)**: Cada posición conserva monto, producto, serie e identidad original. Su clasificación distingue computable, sin identificar y excluida con motivo.
- **FR-007 (R02)**: El total concilia como computable más sin identificar más excluido. El importe reconocido o identificado incluye las exclusiones conocidas; no se confunde con la base computable. El porcentaje sin identificar utiliza el total de la cartola.
- **FR-008 (R02)**: Costo anual de posición = monto × TAC porcentual / 100. La TAC ponderada es costo anual total / base computable × 100. Los pesos usan esa misma base, sin redondeo intermedio. Efectivo y depósitos computan a costo cero.
- **FR-009 (R02)**: Si existen cuotas y valor cuota, se comparan con el monto declarado. Una diferencia absoluta mayor de 1 CLP genera advertencia sin sustituir el monto. La falta de ambos datos de valorización de un fondo se declara.
- **FR-010 (R04)**: El ticket es el monto individual de la posición. No se suman otras tenencias ni se confunde el ticket con patrimonio agregado.
- **FR-011 (R04)**: Se aplica la primera coincidencia: 0 acuerdo/habilitación ausente; 1 cerrada; 2 APV sin plan; 3 mandato ausente; 4 ticket insuficiente y patrimonio válido suficiente al corte; 5 ticket insuficiente sin ese patrimonio válido; 6 ninguna anterior.
- **FR-012 (R04)**: El resultado del motor incluye estado, regla, motivo y evidencia de ticket, mínimo, condiciones, acuerdo y patrimonio con fecha. «Actual» no reemplaza el estado en el motor. La exposición completa de esa evidencia en la interfaz se verifica por separado.
- **FR-013 (R04)**: Las alternativas condicionales se separan de las elegibles, con confirmación escrita y tareas previas. Al actualizar datos se reevalúan todas las reglas. No hay ejecución ni registro de contrataciones.
- **FR-014 (R05)**: Se elige la menor TAC elegible del mismo fondo y AGF solo si reduce el costo actual. Se conservan los empates de una mejora y se elige de forma estable por código. En empate con la actual se conserva la tenencia.
- **FR-015 (R05)**: Ahorro anual = monto × (TAC actual − TAC nueva) / 100; ahorro en puntos base = (TAC actual − TAC nueva) × 100. Se informa por posición y agregado sin sumar alternativas excluyentes.
- **FR-016 (R05)**: El costo y la TAC posteriores conservan capital, posiciones y base computable y aplican solo mejoras elegibles.
- **FR-017 (R05)**: El adicional condicional parte de la mejor opción elegible aplicada o de la actual. Solo se agrega la mejor oportunidad positiva por posición. El escenario con condiciones cumplidas se muestra separado y no se presenta como ahorro ya elegible.
- **FR-018**: Las comisiones no alteran diagnóstico, acceso, selección, empates ni ahorro si no cambia la habilitación. Se conservan como contexto y no se suman a la TAC.
- **FR-019**: Se puede repetir el análisis con cualquiera de los tres archivos sustituido. Las mismas entradas producen las mismas decisiones y cifras sin mutarlas ni consultar la fecha actual del dispositivo.
- **FR-020**: Se calcula antes de redondear. La presentación usa CLP al peso, TAC agregada a cuatro decimales y pesos a dos, con mitades hacia arriba para importes no negativos. Los mínimos y empates se comparan sin redondeo de pantalla.
- **FR-021**: El recorrido se puede consultar en escritorio, móvil y teclado, con foco, etiquetas, unidades y motivos que no dependan del color. Las comprobaciones visuales pendientes se declaran como tales.
- **FR-022**: El cálculo funciona en el navegador sin cuentas, servidor de aplicación, base de datos ni servicios financieros externos. La publicación del sitio estático es una comprobación de entrega independiente.
- **FR-023**: Seleccionar un archivo nuevo invalida los resultados dependientes. Una lectura obsoleta no puede sobrescribir la revisión vigente.
- **FR-024**: La documentación mantiene trazabilidad entre requisitos, módulos y pruebas reales. Una tarea marcada no sustituye evidencia de su verificación.

### Orden de acceso R04

| Regla | Primera condición aplicable | Estado |
| --- | --- | --- |
| 0 | Sin acuerdo vigente o serie no habilitada | out_of_scope |
| 1 | Serie cerrada | blocked |
| 2 | Solo APV y cliente sin plan APV | blocked |
| 3 | Mandato requerido y ausente | conditional |
| 4 | Ticket inferior al mínimo; patrimonio suficiente y fecha anterior o igual al corte | conditional |
| 5 | Ticket inferior al mínimo sin patrimonio válido suficiente al corte | blocked |
| 6 | Ninguna anterior | eligible |

La fecha del patrimonio solo influye cuando se necesita agregación y no se aplicó una regla previa. Un monto posterior se conserva como evidencia descartada; no se le atribuye validez retrospectiva ni una caducidad no definida a los patrimonios anteriores.

## Trazabilidad

| Regla | Requisitos | Recorridos |
| --- | --- | --- |
| R01 | FR-003–005 | Contexto, vigencia y universo |
| R02 | FR-006–009 y FR-020 | Diagnóstico, valorización, exclusiones y base cero |
| R04 | FR-010–013 y FR-002 | Acceso, precedencia, mínimos y patrimonio al corte |
| R05 | FR-014–017 | Cambio de serie y adicional condicional |
| Independencia de comisiones | FR-018 | Repetición sin alterar decisiones financieras |
| Entrada y experiencia | FR-001–003 y FR-019–024 | Carga manual, determinismo, consulta y validación |

## Entidades principales

Cartola y posición conservan las tenencias originales. Catálogo identifica emisores, productos y series. Acuerdos expresa el universo del distribuidor y sus condiciones. El análisis reúne diagnóstico, evaluaciones de acceso, comparación, advertencias y contexto. Los nombres exactos de campos están en [data-model.md](data-model.md) y en los contratos.

## Criterios de éxito

- **SC-001**: Todas las posiciones se conservan y los totales y costos concilian con cálculos independientes y las entradas de validación.
- **SC-002**: Las alternativas y casos de precedencia producen el estado, regla y motivo esperados; ninguna alternativa inaccesible financia un cambio elegible.
- **SC-003**: Ahorro elegible, adicional condicional y posterior concilian por posición y agregado sin cambiar fondos, AGF ni base computable.
- **SC-004**: Cada decisión y ahorro tiene motivo y evidencia en el resultado. La consulta completa desde la interfaz debe acreditarse con el recorrido real, no solo con la existencia del dato o de un componente aislado.
- **SC-005**: Las variaciones de TAC, mínimos y condiciones actualizan lo que corresponde; variar solo comisiones o reloj del dispositivo no altera resultados financieros.
- **SC-006**: Los errores no dejan resultados inválidos como vigentes y el usuario puede corregir y volver a cargar.
- **SC-007**: El recorrido completo se puede realizar en escritorio, móvil y teclado. La evidencia automatizada de HTML no acredita por sí sola revisión visual, contraste, zoom ni publicación.

La cartola CSV representa una posición por registro y repite los datos del cliente y el corte sin diferencias entre filas. Catálogo y acuerdos admiten CSV de rutas tipadas para conservar su estructura anidada. Ambos formatos se convierten al modelo común antes de validar y analizar. El formato se detalla en [contracts/input-csv.md](contracts/input-csv.md).

## Convenciones y límites

El nivel 1 identifica productos y series por coincidencia exacta. No interpreta PDF ni nombres aproximados; no calcula vencimiento de perfil, proyección, volatilidad ni metas. Cambiar fondo o AGF pertenece a otra modalidad y no se presenta como ahorro por serie.

La precisión técnica y los límites efectivos están en [contracts/input-json.md](contracts/input-json.md) y [contracts/analysis.md](contracts/analysis.md). El límite del número JSON no debe confundirse con la precisión decimal del cálculo posterior. La ausencia de una fuente se declara; no se fabrica historia ni un costo faltante.

La verificación local y las limitaciones actuales se conservan en [implementation-status.md](implementation-status.md). Esta especificación no acredita despliegue, auditoría de accesibilidad ni cumplimiento de funcionalidades de otros niveles.

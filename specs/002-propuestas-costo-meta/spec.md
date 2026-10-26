# Propuestas de costo y meta — Nivel 2

Creada el 2026-10-24. Actualizada el 2026-10-25 tras la corrección y verificación local del motor.

Esta especificación define el comportamiento del nivel 2. El [modelo de datos](data-model.md) y los [contratos](contracts/propuestas.md) describen sus salidas; [research.md](research.md) registra las decisiones de diseño y [tasks.md](tasks.md) conserva su trazabilidad de implementación. Los datos de validación y sus resultados numéricos pertenecen a la [guía de validación](quickstart.md); el registro de las comprobaciones realizadas está en [Corrección y aceptación de nivel 2](../../docs/correccion-nivel-2.md). La verificación local no implica publicación ni aceptación de funcionalidades fuera de este alcance.

## Propósito y alcance

El asesor puede preparar dos tipos de propuesta: reducir el costo de una cartera sin aumentar su riesgo, o distribuir el capital de una meta según las fechas en que se necesitará el dinero. En ambos casos debe poder explicar qué se propone, por qué se eligió cada alternativa y qué restricciones o supuestos condicionan el resultado.

El nivel 2 incorpora R03, R06 y R07 y conserva las validaciones, exclusiones y reglas de acceso del nivel 1. La herramienta prepara propuestas para revisión humana; no ejecuta operaciones. El retorno no se utiliza como objetivo para seleccionar inversiones ni para justificar un aumento de riesgo.

## Decisiones acordadas

Las aclaraciones del 2026-10-24 fijaron cinco criterios:

1. La mejora de costo conserva los montos por categoría. Solo puede cambiar esa distribución cuando sea necesario para cumplir el perfil o los límites de concentración, sin aumentar la volatilidad.
2. Si el capital de una meta es insuficiente, se reservan los valores presentes de los pagos en orden cronológico. El remanente corresponde al primer pago que no puede financiarse por completo.
3. La cobertura se mide por las UF efectivamente pagadas sobre las UF exigidas. Incluye pagos parciales y no se calcula contando pagos completos.
4. La conclusión de la meta depende del escenario base después de descontar costos. Un excedente de valor presente bruto no basta para afirmar que alcanza.
5. En una meta, el mínimo de entrada se comprueba con la nueva inversión total en el mismo fondo y serie entre todos los tramos. No se suman tenencias existentes para fabricar acceso.

## Recorridos y criterios de aceptación

### Historia 1. Reducir el costo sin elevar el riesgo — Prioridad P1

Como asesor, quiero comparar la cartera actual con una alternativa de menor costo que conserve o reduzca su riesgo, para explicar los cambios de serie o de fondo con evidencia.

Este recorrido requiere cartola, catálogo, acuerdos y supuestos; no necesita una meta. Se considera aceptado cuando:

1. La propuesta compara series elegibles del mismo fondo y equivalentes de la misma categoría dentro de los acuerdos vigentes. Cada cambio explica el origen, el destino y su efecto en costo y riesgo.
2. Una alternativa que aumente la volatilidad queda fuera de la mejora automática, aunque tenga menor TAC.
3. Entre fondos equivalentes elegibles, el motor puede elegir el de menor TAC y muestra la categoría compartida y la evidencia de acceso. El orden de los cambios debe estar justificado.
4. Las series bloqueadas, condicionales o fuera de acuerdos no reciben nuevas inversiones. Retener una posición existente no se confunde con autorizar una compra en ella.
5. Si la cartera ya cumple perfil y concentración, se conservan los montos por categoría. Un costo menor en otra categoría no justifica cambiar esa distribución.
6. Si una restricción exige reasignar entre categorías, la propuesta identifica esa restricción y comprueba que la volatilidad final no aumenta.
7. Si no se encuentra una mejora admisible, se informa ese resultado sin presentar un ahorro inexistente ni afirmar que se probó la inexistencia de otras soluciones.

### Historia 2. Financiar una meta según sus fechas de pago — Prioridad P1

Como asesor, quiero asignar el capital de una meta a inversiones acordes con sus plazos y saber qué pagos se cubren, para explicar cualquier brecha sin resolverla aumentando el riesgo permitido.

Este recorrido añade la meta a las entradas anteriores. Se considera aceptado cuando:

1. Los desembolsos se ordenan por fecha y cada uno se asigna al tramo que corresponde desde la fecha de referencia. Los pagos simultáneos conservan su identidad.
2. Cada tramo utiliza categorías admitidas, series elegibles de menor TAC y liquidez compatible con su primer pago. Efectivo y depósitos se consideran sin inventarles una serie.
3. Cuando el capital no cubre los valores presentes, se reserva primero para los pagos próximos, se asigna el remanente al primero incompleto y se informa lo que queda sin financiar.
4. El excedente inicial se destina al tramo ocupado más largo. Si no puede invertirse respetando las restricciones, se informa como capital no asignable y queda fuera de las proyecciones.
5. El límite de crecimiento se reduce cuando se acerca el primer pago. La propuesta muestra el máximo del perfil, la reducción aplicada y el crecimiento efectivo.
6. El ticket final de una inversión compartida por varios tramos se verifica sobre su suma. Si cambia ese importe, se vuelve a evaluar el acceso antes de cerrar la propuesta.
7. La reserva informada por pago coincide con el capital realmente invertido después de aplicar los límites. No se conserva como financiado un importe que quedó sin asignar.
8. La conclusión distingue el déficit o excedente de VP de los pagos pendientes en base neta. Solo afirma que alcanza cuando todos los desembolsos se pagan íntegramente en sus fechas.

### Historia 3. Explicar los supuestos y escenarios — Prioridad P2

Como asesor, quiero revisar las tasas, los costos y las trayectorias que sustentan una propuesta, para distinguir los cálculos de los supuestos y explicar sus límites.

Se considera aceptado cuando:

1. Los retornos, la volatilidad, los valores presentes, los costos acumulados y los saldos proyectados llevan la etiqueta «supuesto» y permiten consultar sus fuentes.
2. Cada propuesta presenta los escenarios adverso, base y favorable. La modalidad de costo usa un horizonte común de cinco años; la meta utiliza sus fechas de pago.
3. Los escenarios mantienen las mismas decisiones iniciales y política de retiros. Solo varía el ajuste al retorno real bruto supuesto.
4. Cambiar un retorno actualiza las cifras que dependen de él sin convertirlo en un criterio de selección ni alterar las reglas de acceso o los límites permitidos.
5. La evidencia permite reconstruir los saldos, costos, rescates y transferencias, y distinguir el primer pago pendiente del agotamiento total.

## Requisitos funcionales

### Entradas y reglas compartidas

- **FR-001**: El nivel 2 conserva las validaciones, exclusiones y reglas R01, R02, R04 y R05. Las nuevas inversiones en fondos requieren acuerdo vigente y serie elegible; efectivo y depósitos mantienen su tratamiento sin serie ni acuerdo de AGF.
- **FR-002**: Las entradas se cargan manualmente. Costo requiere cartola, catálogo, acuerdos y supuestos; meta requiere además sus desembolsos y capital asignado. Se conservan referencias, fechas, versiones y avisos. Un archivo ajeno a una modalidad no debe bloquearla.

### Mejora de costo — R07

- **FR-003**: Los objetivos se ordenan así: mantener o reducir la volatilidad, minimizar el costo dentro del universo permitido y respetar los máximos por fondo y AGF. El retorno y las comisiones no son objetivos ni criterios de desempate.
- **FR-004**: Se conservan los montos por categoría salvo reparación necesaria de perfil o concentración. El motor evalúa series del mismo fondo y equivalentes de la misma categoría; cada cambio identifica su fase, motivo y acceso. La reparación también considera efectivo y depósitos sin serie ni acuerdo de AGF, con costo cero. Una reasignación entre categorías debe explicar la restricción que la exige. Si no se encuentra una cartera admisible, se informa sin atribuir al buscador una prueba de imposibilidad.
- **FR-005**: El riesgo actual y propuesto se mide con el mismo método y los mismos supuestos: volatilidad ponderada simple, calculada como la suma del peso de cada posición por la volatilidad de su categoría. La base computable y el capital se conservan. Una propuesta que aumente esa volatilidad no puede presentarse como mejora automática de nivel 2.

### Costos y proyecciones — R03

- **FR-006**: El costo acumulado se estima por instrumento y período con el saldo medio anterior al retiro. Para un intervalo de `dt` años: `saldo_medio = (saldo_inicial + saldo_antes_del_retiro) / 2` y `costo = saldo_medio × TAC_pct / 100 × dt`. Se muestran fechas, saldos, retiros y TAC. La trayectoria usa retorno neto; el costo informativo no se descuenta una segunda vez.
- **FR-007**: El retorno real neto supuesto es el retorno bruto ponderado supuesto menos la TAC ponderada. Ambos componentes, sus categorías y sus bases deben ser trazables. No se presentan como historia ni promesa.
- **FR-008**: Toda cifra que dependa de retornos, volatilidad, VP, costo acumulado o evolución futura se identifica como «supuesto». Las fuentes y fechas recibidas se conservan para consulta y sus ausencias se indican sin inventarlas. La interfaz no añade comentarios genéricos de prueba ni convierte anotaciones técnicas del archivo en avisos automáticos del análisis.

### Asignación de una meta — R06

- **FR-009**: Los pagos se ordenan por fecha e índice original. Los años se calculan como días reales divididos por 365,25; los meses se miden por aniversarios calendario y su fracción. Cada pago pertenece al tramo cuyo inicio está incluido y cuyo final está excluido; el último tramo es abierto.
- **FR-010**: El VP de un tramo se calcula como `Σ flujo / (1 + r_real)^t`, con `t` en años y `r_real` igual al promedio aritmético simple de los retornos reales brutos supuestos de sus categorías efectivamente seleccionadas, cada una una vez. Se muestran tasa, flujos, plazo y VP en UF. El peso requerido es VP dividido por capital asignado. Sin soporte invertido no se inventa una tasa ni un VP de selección.
- **FR-011**: Si la suma de VP supera el capital, se informa el déficit y se reservan los pagos cronológicamente hasta agotar el capital admisible. El remanente corresponde al primero incompleto; no se reparte el déficit proporcionalmente entre todos. Si sobra capital, se asigna al tramo ocupado más largo dentro de sus restricciones. Capital, VP y brecha se expresan en UF y CLP de referencia cuando sean calculables.
- **FR-012**: La selección respeta el orden de categorías declarado por tramo, luego la menor TAC elegible y la liquidez compatible con el primer pago servido. Si una restricción cambia la selección, se explica la alternativa descartada. Efectivo y depósitos mantienen TAC cero.
- **FR-012a**: El ticket de una nueva inversión de meta suma todas sus asignaciones en el mismo fondo y serie entre tramos. Se evalúa con el importe final y la primera coincidencia de R04. No incorpora tenencias existentes ni convierte patrimonio agregado condicional en elegibilidad automática. La concentración suma todas las series y tramos de cada fondo y todos los fondos de cada AGF.
- **FR-013**: Los máximos por fondo y AGF se aplican sobre el capital asignado a la meta, aunque una parte no pueda invertirse. Se distingue esa base del capital invertido usado para TAC y retornos ponderados. Ningún destino puede exceder su cupo para mejorar la cobertura.
- **FR-014**: El peso de crecimiento es `Σ peso_i × factor_i`, con factor 1 para renta variable, 0,5 para balanceados y 0 para el resto. El máximo efectivo es `máximo del perfil × min(1, meses hasta el primer pago / 24)`. Se muestran máximo general, meses y crecimiento efectivo, usando el capital asignado como base de pesos. El tope reducido se añade cuando la proximidad del pago modifica el máximo general.
- **FR-015**: La meta conserva acceso, categoría, liquidez, perfil y concentración aunque eso deje pagos pendientes. No cierra una brecha agregando riesgo. Se informa el capital no asignable, el pendiente y las restricciones que impidieron financiarlo.
- **FR-015a**: La conclusión «alcanza en el escenario base» exige una propuesta admisible y todos los pagos íntegros y oportunos después de TAC. En otro caso se informa «no alcanza en el escenario base», con pendientes por pago y total. Esta brecha es distinta del déficit o excedente inicial de VP y no representa el capital adicional exacto necesario hoy.

### Escenarios, evidencia e interacción

- **FR-016**: Cada modalidad presenta tres escenarios: adverso con −1,5 puntos porcentuales, base sin ajuste y favorable con +1,5 puntos porcentuales sobre el retorno real bruto de cada categoría, antes de TAC. Costo informa saldo final UF a cinco años. Meta informa saldo final, agotamiento si lo hay y cobertura por monto: `UF pagadas / UF exigidas × 100`, incluidos los pagos parciales.
- **FR-017**: Los escenarios conservan composición inicial, acceso, límites, costos, método de riesgo y política de retiros. No se reoptimiza la cartera para cada escenario. Los rescates respetan la liquidez; solo se transfieren excedentes liberados de tramos sin pagos futuros, sin consumir reservas comprometidas. La coordinación de pagos no puede contar dos veces el mismo dinero disponible.
- **FR-018**: Ambas modalidades muestran cartera actual y propuesta, asignaciones, justificación de cambios, costo anual y acumulado supuesto, TAC, retornos bruto y neto supuestos, volatilidad, crecimiento, concentración, restricciones, advertencias y tareas condicionales. La cartera actual de una meta se presenta como referencia, sin inferir ventas ni origen de su presupuesto. Los pesos, tickets y reservas corresponden a importes finales verificados.
- **FR-018a**: La evidencia de acceso identifica el lote de costo o los tramos de meta, el producto, la serie y el importe final. Las otras series del mismo producto se evalúan al importe de esa decisión, sin tickets nulos ni presentarlas como destinos elegidos. Las condiciones conservan sus tareas previas a una eventual ejecución. La pantalla prioriza resultados y escenarios; el detalle de acceso, VP, concentración y trayectoria permanece consultable.
- **FR-019**: La propuesta declara su universo limitado a acuerdos de distribución vigentes, la posible existencia de alternativas de menor costo fuera de él y la revisión humana previa a cualquier ejecución. Conserva el monto y porcentaje sin identificar del diagnóstico. Distingue las tenencias conservadas de los destinos de nueva inversión y la búsqueda de candidatos de una certificación de óptimo global.
- **FR-020**: Las mismas entradas producen las mismas decisiones, orden, estados y cifras. Una nueva carga invalida resultados anteriores. La búsqueda tiene un presupuesto declarado; si se agota, se informa sin presentarlo como una restricción financiera ni como prueba de inviabilidad.
- **FR-021**: Ambas modalidades pueden revisarse en escritorio, pantalla estrecha y con teclado. Las tablas tienen encabezados, nombre accesible y regiones desplazables con foco. El cálculo permite seguir navegando; los errores se muestran en la vista activa y una respuesta antigua no puede reemplazar el resultado de una revisión vigente.

## Casos límite

- Un dato necesario ausente o inválido impide el recorrido afectado y señala el archivo y campo que debe corregirse. No se completa con un supuesto inventado.
- Los tramos tienen identificadores únicos, son contiguos y contienen categorías admitidas. El perfil del cliente debe estar definido; no se modifican los factores de crecimiento para hacer caber una propuesta.
- Los pagos deben ser posteriores a la referencia y tener importe positivo. Los pagos simultáneos mantienen su detalle y comparten la liquidez sin duplicarla.
- Una serie actual barata puede retenerse aunque no admita nuevas compras. Ante igualdad de costo se conserva la tenencia; los demás empates se resuelven de forma estable por producto y serie.
- Si cambia un reparto o ticket, se reevalúan acceso y límites con los importes finales. Los mínimos de lotes de costo no se acreditan sumando posiciones distintas.
- Con capital cero no se inventan inversiones ni se divide por cero. Se informa la falta de cobertura y se dejan como no disponibles los retornos, pesos o VP que no puedan calcularse.
- Una reserva sin inversión no declara categorías efectivas ni tasa de VP. Si falta soporte para parte de la meta, la brecha global de VP se muestra como no disponible; se conservan los pagos y las inversiones parciales admisibles.
- Un pago pendiente puede coexistir con saldo positivo en reservas futuras. Agotamiento total significa saldo agregado cero, no el primer incumplimiento parcial. Los retiros completos no dejan residuos decimales que oculten ese agotamiento.
- Los retornos pueden ser negativos dentro del dominio válido de la proyección. Un ajuste que impida calcularla se informa como error; no se trunca ni se oculta la tasa.
- Si no se encuentra un candidato dentro del presupuesto de búsqueda, se declara ese límite. No se afirma que ninguna solución pueda existir.

## Entidades principales

| Entidad | Qué representa |
| --- | --- |
| Supuesto | Retorno bruto, volatilidad, perfil, concentración, tramos, escenarios y referencia UF declarados para el cálculo |
| Propuesta de costo | Cartera admisible comparada con la actual, con cambios y ahorro justificables |
| Equivalente | Fondo de la misma categoría dentro del universo permitido |
| Meta y desembolso | Capital asignado y pagos futuros identificados por fecha e importe UF |
| Tramo y reserva | Horizonte, categorías permitidas y capital realmente destinado a sus pagos |
| Trayectoria | Evolución de saldos, costos, liquidaciones, retiros y transferencias |
| Escenario | Ajuste al retorno bruto supuesto aplicado a las mismas decisiones iniciales |

## Criterios de éxito

- **SC-001**: El asesor genera y revisa una propuesta de costo con cartola, catálogo, acuerdos y supuestos, sin cargar una meta.
- **SC-002**: La propuesta de meta clasifica todos los desembolsos, muestra sus reservas y VP calculables y concluye si los pagos se cubren en base neta, con sus brechas separadas.
- **SC-003**: Todos los destinos de nueva inversión cumplen las reglas aplicables de acceso, categoría, liquidez, concentración y perfil. Los descartes y condicionales no financian automáticamente la propuesta.
- **SC-004**: Toda mejora de costo conserva el capital computable y tiene volatilidad ponderada menor o igual que la cartera actual, con el mismo método y supuestos.
- **SC-005**: Todas las cifras dependientes de supuestos están rotuladas y permiten consultar su fuente y fecha, o su ausencia explícita.
- **SC-006**: Cada propuesta presenta los tres escenarios definidos y el resultado correspondiente a su modalidad.
- **SC-006a**: La cobertura coincide con la proporción de UF efectivamente pagadas, incluidos los pagos parciales. El pendiente de cada pago y el total concilian con los importes exigidos.
- **SC-007**: Una meta no cubierta informa lo pendiente sin superar los límites permitidos ni ocultar capital no asignable.
- **SC-007a**: Si el VP bruto resulta suficiente pero quedan pagos pendientes en base neta, la conclusión es «no alcanza en el escenario base». Ambas medidas aparecen con etiquetas distintas.
- **SC-008**: En escritorio, móvil y teclado se puede llegar a cambios, tramos, escenarios y advertencias, leer sus encabezados y desplazar las tablas sin depender del color.
- **SC-009**: Repetir las mismas entradas reproduce los resultados sin redondear. Cambiar un dato actualiza únicamente los resultados que dependen de él y no deja cifras antiguas como vigentes.

## Convenciones y límites de la entrega

Las tasas y los límites proceden de las entradas declaradas. Las conversiones CLP/UF usan exclusivamente su valor y fecha de referencia; no pronostican la UF futura. Los cálculos no se redondean para decidir acceso o límites; la presentación usa CLP al peso, UF y tasas a cuatro decimales, y pesos o cobertura a dos, con mitades hacia arriba.

La volatilidad ponderada simple no incorpora correlaciones. La búsqueda de candidatos es determinista y acotada: puede encontrar una propuesta admisible sin demostrar el menor costo global. El resultado debe explicar ambas limitaciones.

El alcance termina en R07. Los controles formales del nivel 3, la ejecución, los documentos firmados, la huella, el tratamiento completo de seguros y la historia de retornos quedan fuera de esta entrega.

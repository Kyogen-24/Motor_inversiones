# Modelo de datos — Nivel 2

Este documento describe las entradas y salidas de la implementación. Las reglas están en [spec.md](spec.md), las decisiones de cálculo en [research.md](research.md) y el contrato de presentación en [contracts/propuestas.md](contracts/propuestas.md). Los tipos compartidos se mantienen en `src/domain/proposalModel.ts`; el nivel 1 conserva su modelo y su versión de resultado.

Los importes y tasas calculados se entregan como cadenas decimales. Las entradas JSON siguen usando números con las restricciones de precisión del nivel 1. Los cálculos no se redondean para decidir acceso ni límites. Un valor `null` indica que no puede calcularse o no corresponde; no se reemplaza por un cero ficticio.

## Entradas

| Tipo | Contenido | Relaciones principales |
| --- | --- | --- |
| `Supuestos` | Referencia UF, categorías, perfiles, límites, tramos, escenarios y metadatos opcionales | La UF coincide con la referencia de cartola y meta; existe el perfil del cliente |
| `Categoria` | Familia admitida por el motor | Determina retorno bruto, volatilidad y factor de crecimiento declarados |
| `Tramo` | Identificador, meses inicial/final y categorías en orden | Identificadores únicos, intervalos contiguos, inicio incluido y final excluido; último abierto |
| `Meta` | Nombre, tipo, cliente, capital asignado, valor/fecha UF y desembolsos | Cliente y referencia coinciden con las otras entradas; capital no negativo |
| `Desembolso` | Fecha e importe UF | Fecha posterior a referencia e importe positivo; los pagos repetidos conservan identidad |
| `Escenario` | Identificador y ajuste al retorno bruto | Adverso −1,5 pp, base 0 pp y favorable +1,5 pp |

`EntradaPropuestaCosto` contiene cartola, catálogo, acuerdos y supuestos. `EntradaPropuestaMeta` añade la meta. La modalidad se elige al invocar el caso de uso; no es un campo adicional exigido en estos objetos de entrada.

Los nombres de archivo y los objetos `File` pertenecen al flujo de carga. Los casos de uso no leen archivos ni inventan fechas o fuentes. Los campos adicionales recibidos se conservan para su revisión.

## Asignaciones y acceso

`Asignacion` identifica producto, serie, emisor, nombre, categoría, monto CLP, monto UF, TAC y liquidez. Efectivo y depósitos usan serie nula, TAC cero y no requieren acuerdo de AGF como destinos de reparación o de una meta. La evidencia financiera puede añadir peso, retorno bruto y neto supuestos y volatilidad.

- En costo, `loteOrigen` conserva la identidad de la posición original. Los tickets de lotes distintos no se suman para acreditar mínimos. `fase` distingue retención, cambio de serie, equivalente y reparación de perfil o concentración.
- En meta, `tramoId` conserva la reserva de cada asignación y `ticketFinalClp` informa la suma final de la nueva inversión en el mismo fondo y serie entre tramos.
- La retención de una tenencia fuera de acuerdos no autoriza nuevas compras.

`EvidenciaDecision` contiene producto y nombre, serie evaluada y asignada, ticket CLP, uso, lote o tramos, estado, motivo y tareas. El uso distingue destino propuesto, tenencia conservada y otra serie del mismo producto. Los accesos condicionales se muestran con sus tareas previas y no financian automáticamente la propuesta. `cambios`, `advertencias`, `restricciones` y `motivosNoAdmisible` conservan las explicaciones para el asesor.

## Resumen financiero y fuentes

`ResumenFinanciero` contiene capital invertido CLP/UF, costo anual, TAC ponderada, retornos bruto/neto supuestos, volatilidad, crecimiento y concentraciones por fondo y AGF.

`basePesosClp` declara la base de concentración y crecimiento. En costo coincide con el capital computable conservado. En meta es el presupuesto asignado, aunque parte no se invierta. La TAC y los retornos ponderados usan el capital invertido; no se normalizan los pesos sobre esa base para ocultar capital no asignable.

`FuentesPropuesta` conserva cliente y corte, distribuidor, versión/fecha/fuente del catálogo, metadatos de supuestos, aviso y referencia UF. Incluye monto y porcentaje sin identificar, monto identificado excluido, detalle de exclusiones y nombres de emisores, usando la clasificación del diagnóstico. Las exclusiones tienen nombre, importe CLP y motivo, sin repetirlas como mensajes libres. Las ausencias se indican como no informadas. El contexto de cálculo no atribuye a la fecha UF el significado de fecha de un retorno histórico.

La evidencia de acceso usa solo importes positivos de decisiones concretas. Las otras series del mismo producto se evalúan al importe asignado a la decisión correspondiente, sin afirmar que cumplen por sí solas las restricciones del resto de la cartera. Los tickets de costo se mantienen separados por lote y los de meta se consolidan por producto y serie entre tramos.

La cartera actual de una meta es una referencia informativa. Su capital puede ser distinto del presupuesto de la meta; no implica ventas ni identifica el origen de ese presupuesto.

## Reservas y pagos de meta

`ReservaMeta` contiene tramo, categorías efectivas, retorno bruto promedio supuesto, VP UF, capital realmente invertido y asignaciones. `pesoRequeridoPct` corresponde a VP/capital asignado y `pesoEfectivoPct` a capital invertido del tramo/capital asignado.

`PagoMeta` conserva índice original, fecha, importe UF, meses, tramo, VP y pendiente base. `reservadoVpUf` y `noFinanciadoInicialUf` se reconcilian cronológicamente contra las inversiones finales, después de aplicar los límites.

Se mantienen separados:

- `deficitVpUf`: parte de la suma de VP que excede el capital asignado.
- `excedenteVpUf`: parte del capital que excede la suma de VP.
- `capitalNoAsignableUf`: presupuesto sin destino admisible, fuera de las proyecciones.
- `pendienteBaseClp` y los pendientes UF por pago: importes no cubiertos a tiempo en el escenario base neto.
- `conclusionBase`: alcanza solo si todos los pagos se cubren con una propuesta admisible.

La suma de inversiones y capital no asignable coincide con el capital asignado. El peso requerido puede superar el presupuesto disponible; el peso efectivo no representa capital inexistente.

Sin inversión en una reserva, sus categorías efectivas quedan vacías y su tasa y VP son nulos. Si falta soporte para algún tramo, el VP total y su brecha no se inventan. Se conservan las inversiones parciales admisibles y los pendientes de los escenarios.

## Trayectorias y liquidaciones

`EscenarioResultado` contiene identificador, ajuste, saldo final UF, costo acumulado UF, cobertura, total pagado/pendiente, agotamiento total, primer pago pendiente y detalle por pago. Su evidencia se desglosa en:

| Tipo o campo | Información |
| --- | --- |
| `PeriodoProyeccion` | Fechas, índice de asignación, saldo inicial, saldo antes del retiro, retorno bruto supuesto, TAC y costo del período |
| `Rescate` | Fecha de pago y liquidación, asignación, índice del pago, UF y marca de transferencia desde un excedente liberado |
| `PagoEscenario` | Índice original, fecha, UF pagadas y pendientes |
| `agotamientoTramos` | Fecha de agotamiento observada por reserva |

La trayectoria capitaliza a retorno neto hasta la liquidación. El costo por saldo medio es informativo y no se debita otra vez. Los importes liquidados para pagos no siguen capitalizando. Las transferencias respetan liquidez y no consumen reservas de pagos futuros.

`fechaAgotamiento` requiere saldo agregado cero. `primeraFechaPendiente` puede aparecer antes si una reserva corta resulta insuficiente y quedan otras con saldo positivo. Sin pagos, cobertura y pendientes de meta son nulos; costo usa el horizonte de cinco años.

## Resultados, búsqueda y estados

La salida distingue `PropuestaCosto` y `PropuestaMeta`, ambas con `versionReglas` de nivel 2. `admisible` separa cumplimiento de restricciones de ahorro o cobertura.

| Estado | Significado |
| --- | --- |
| `propuesta` | Candidato admisible con mejora de costo o meta cubierta, según la modalidad |
| `propuesta_parcial` | Meta con pagos pendientes o capital no asignable; las inversiones incluidas siguen cumpliendo restricciones |
| `sin_mejora` | No se encontró ahorro de costo; no se fabrica una mejora |
| `sin_candidato` | No se encontró una inversión admisible; se muestran motivos y el alcance de la búsqueda |

`Busqueda` informa estado completo o presupuesto agotado, nodos, presupuesto y `optimalidad: no_demostrada`. El fin de la búsqueda no certifica un óptimo continuo ni inexistencia de otras soluciones.

Con capital cero, la meta devuelve `sin_candidato`, motivo `capital_cero`, sin búsqueda ni inversiones. Los escenarios informan saldo, costo, pagos y cobertura cero, con todos los desembolsos pendientes y agotamiento en referencia. Riesgo, retornos y VP de selección no se inventan.

Los errores de entrada quedan fuera de los estados financieros y afectan al recorrido correspondiente. El flujo de pantalla distingue carga, validación, cálculo y resultado o error. Una nueva carga invalida los resultados dependientes y cancela el cálculo anterior; solo la revisión vigente puede actualizar la pantalla. No hay historial ni persistencia.

## Invariantes

1. Las mismas entradas y presupuesto producen las mismas decisiones, orden y cifras sin mutar los datos recibidos.
2. Ninguna nueva inversión bloqueada, condicional o fuera de alcance financia una propuesta.
3. Concentración suma series y tramos; no se modifican los factores de crecimiento para hacer caber una meta.
4. La mejora de costo conserva capital y no aumenta volatilidad. Solo una restricción justifica cambiar categorías.
5. Pagado más pendiente coincide con lo exigido por pago y en total; la cobertura incluye pagos parciales.
6. Los escenarios mantienen las decisiones iniciales y la política de retiros; solo cambia el ajuste al retorno bruto.
7. Cada cifra dependiente de supuestos se identifica y puede rastrearse hasta sus entradas.
8. Reservas, pesos y tickets reflejan importes finales verificados, sin duplicar capital ni liquidez.

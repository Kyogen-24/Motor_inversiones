# Modelo de datos: ajuste temporal de R04

## Entradas existentes

| Entidad | Campos relevantes | Relación y validación |
| --- | --- | --- |
| Cartola | `corte`, `posiciones`, `cliente.plan_apv` | Corte válido AAAA-MM-DD; referencia temporal explícita. |
| Posición | `producto`, `serie`, `monto_clp` | Ticket individual; no sumar tickets entre líneas. |
| Producto/Serie | `emisor`, `codigo`, `minimo_clp`, `abierta`, `solo_apv`, `requiere_mandato`, `tac_pct` | Resolver producto y AGF exactos; mínimos no negativos, banderas normalizadas. |
| Acuerdo | `emisor`, `estado`, `vigente_desde/hasta`, `series`, `mandato`, `patrimonio_agregado_clp`, `patrimonio_al` | Una AGF; habilitación por producto/serie. Fecha e importe obligatorios y válidos. |

No cambia el esquema JSON. Fecha posterior bien formada es un dato válido de entrada;
fecha ausente o imposible sigue siendo error FR-003. Vigencia de acuerdo R01 y
disponibilidad temporal del patrimonio R04 son comprobaciones distintas.

## Salida de acceso

`Acceso` conserva serie, indicador actual, estado, regla, motivo y evidencia. La única
extensión es `evidencia.corte: string`, copiado de `Cartola.corte`. Permanecen
`ticket`, `minimo`, `agregado`, `patrimonioAl`, datos de acuerdo, APV y mandato.
Los importes del resultado continúan serializados como cadenas decimales.

No se mutan entradas, fechas ni montos para representar un descarte. No se añade una
bandera global de AGF ni un estado de acceso nuevo. La salida del análisis identifica
la semántica corregida mediante `versionReglas: 'nivel-1.1'`.

## Derivación por alternativa

| Primera condición aplicable | Estado / regla | Tratamiento del agregado |
| --- | --- | --- |
| Sin acuerdo vigente o sin habilitación | out_of_scope / 0 | No determina acceso. |
| Cerrada | blocked / 1 | No determina acceso. |
| Solo APV sin plan | blocked / 2 | No determina acceso. |
| Mandato requerido ausente | conditional / 3 | No sustituye estado; mínimos pendientes en tareas. |
| Ticket suficiente | eligible / 6 | No es necesario contrastar fecha del agregado. |
| Ticket insuficiente, fecha anterior/igual y agregado suficiente | conditional / 4 | Patrimonio aceptado para agregación, con confirmación escrita pendiente. |
| Ticket insuficiente y agregado posterior | blocked / 5 | Conservar dato; motivo temporal, aunque alcance el monto. |
| Ticket insuficiente y agregado de fecha aceptada pero insuficiente | blocked / 5 | Motivo de monto insuficiente. |

Con patrimonio posterior e insuficiente a la vez, indicar motivo temporal y, si se
menciona el monto, describirlo fielmente; nunca afirmar que la única causa es monetaria.

No hay transición persistida: cada análisis deriva estados de sus entradas.
Al formalizar un mandato, reevaluar desde regla 0; si aún depende de patrimonio futuro,
la serie pasa de regla 3 a regla 5. No convertirla automáticamente a elegible.

## Oportunidades y tareas

R05 conserva el mejor elegible y compara condicionales respecto de ese escenario.
Una alternativa bloqueada no produce oportunidad. Regla 3 puede conservar oportunidad
con tareas explícitas de mínimos pendientes, acreditación al corte y reevaluación.
El diagnóstico actual, peso, costo y TAC no cambian por la fecha del agregado.

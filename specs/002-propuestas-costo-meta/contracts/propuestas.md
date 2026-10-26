# Contrato de propuestas y presentación — Nivel 2

## Operaciones puras

| Operación prevista | Entrada | Salida |
| --- | --- | --- |
| `analizarCartola` existente | Cartola, catálogo, acuerdos | `Analisis` de nivel 1, sin cambio de firma |
| `proponerCostos` | `EntradaPropuestaCosto` | `ResultadoPropuestaCosto` |
| `proponerMeta` | `EntradaPropuestaMeta` | `ResultadoPropuestaMeta` |

No reciben archivos, fetch, fecha actual ni estado React. El validador semántico se ejecuta también al invocar directamente los casos de uso, aunque se haya validado con Zod. Las entradas no se mutan. Los contratos tipados son la autoridad compartida para motor, worker y presentación; probar también que la salida real serializada cumple campos, unidades y estados.

## Envoltorio

Todos los resultados de nivel 2 contienen `versionReglas`, `modalidad`, `estado`, `contexto`, `advertencias` y `restricciones`. Incluyen `busqueda` cuando corresponde y `fuentes` cuando hay datos de procedencia. Importes y tasas calculados son cadenas decimales; contadores son enteros. `null` significa no aplicable. No exponer instancias Decimal o referencias mutables de entradas al consumidor.

`estado` distingue `propuesta`, `propuesta_parcial`, `sin_mejora` y `sin_candidato`. Una meta no cubierta puede tener una propuesta íntegramente admisible: el déficit no equivale a error. Solo meta admite parcial y `capitalNoAsignableUf`; los escenarios no lo incorporan como caja ficticia. En costo exigir suma de asignaciones igual a base computable original, sin retirar capital para reducir costo o riesgo. Si no existe asignación, no fabricar retorno neto ni riesgo de una cartera vacía.

Meta con capital cero: `sin_candidato`, motivo `capital_cero`, sin búsqueda y con tres resúmenes de escenario de saldo/pagado/costo/cobertura cero, pendiente total, primera fecha de pago pendiente igual al primer pago y conclusión `no_alcanza`. Retorno/riesgo, VP de selección, brecha de VP, pesos y categorías efectivas son null; agotamiento en fecha de referencia. No son tres inversiones ficticias sino el resultado de no disponer de capital.

La búsqueda incluye presupuesto/nodos/estado y optimalidad. «No se encontró» no se traduce a «no existe» si no hay certificado. «Mejor encontrada» no se traduce a «óptima». El presupuesto predeterminado versionado de 50.000 nodos es idéntico en repeticiones.

## Contenido de costo

La salida incluye base computable y exclusiones, resumen actual/propuesto, asignaciones y cambios con fase R07, costo anual, ahorro anual, TAC, riesgo por método idéntico, crecimiento y concentraciones. Evidencia distingue retención de nueva inversión y conserva acceso de cada lote final. Condicionales/descartes se muestran separados.

Escenarios a cinco años desde corte; saldo inicial UF = base computable CLP / UF declarada, sin pagos ni aportes. Proyectar por instrumento con sus retornos y TAC. Mostrar costo acumulado supuesto, saldo final UF y tasas iniciales brutas/netas ponderadas. No usar comisión para orden, selección, desempates ni cálculo.

## Contenido de meta

Incluir capital UF/CLP, pagos ordenados y su índice, meses y tramos, categorías efectivas, tasas de VP, VP y pesos requeridos por tramo, pesos y reservas efectivas, tickets consolidados, perfil general/reducido y concentraciones.

Mostrar juntos y con etiquetas distintas:

- Déficit o excedente inicial de VP bruto supuesto.
- Capital no asignable por restricciones, si existe.
- UF pendientes por pago y total en escenario base neto.
- Conclusión «alcanza en el escenario base» o «no alcanza en el escenario base».

El pendiente UF convertido a CLP usa el valor de referencia. No se presenta como capital adicional exacto necesario hoy ni como pronóstico de la UF futura.

Cada escenario contiene pagado, pendiente y cobertura por monto, saldo final UF, fecha de agotamiento si existe, primera fecha de pago pendiente y detalle por pago. Si queda saldo en otra reserva, mostrar saldo y pago pendiente; no llamarlo agotamiento total. La cobertura global incluye pagos parcialmente financiados. El escenario favorable no sustituye la conclusión base.

## Presentación y estados

La presentación principal prioriza resultados, cambios y restricciones. Fuentes, criterios y fórmulas se consultan en detalles desplegables. No se muestran banners de demostración, contadores de nodos ni comentarios sobre la implementación. Las anotaciones _aviso/_nota no se reproducen automáticamente; permanecen los datos cargados, las fuentes, las etiquetas de supuesto, las condiciones de acceso y las advertencias concretas. Cuando se agota la búsqueda se indica la limitación en lenguaje de usuario.

En costo, los cambios propuestos y las tenencias conservadas se presentan en tablas distintas. Las tenencias fuera de acuerdo no se describen como nuevas contrataciones. En meta, la conclusión, el pendiente base y el primer pago afectado preceden al detalle de asignación; los tres escenarios aparecen antes de instrumentos y cálculos de VP. El VP bruto tiene una explicación junto a su cifra para distinguirlo de la cobertura neta de costos.

Las tablas principales usan nombres de categorías y operaciones en español. Las tasas por instrumento, tickets consolidados, concentraciones y cálculos por período se consultan desplegando el detalle. No se repiten bases o tickets cuando coinciden, ni se añade un máximo reducido idéntico al general. Las cifras declaradas de capital y desembolsos se distinguen de sus valores proyectados.

Inicio vacío, carga manual. Mantener navegación de diagnóstico y añadir sección/vista de propuesta con elección costo/meta. Las cantidades de archivos, acciones habilitadas y faltantes se derivan de la modalidad. Formato válido no implica todavía relaciones válidas ni propuesta disponible.

Las nuevas tablas muestran encabezados y regiones desplazables con foco y nombre accesible; resultados y errores permiten navegación por teclado, foco visible y textos españoles. La etiqueta «supuesto» debe estar visible en encabezados o etiquetas de las cifras que dependen de él, también al consultar tablas aisladas. Las anotaciones de demostración no se convierten en avisos del análisis; la procedencia recibida se conserva en fuentes.

Retorno bruto/neto, riesgo y VP no se calculan en React. Los totales, porcentajes y conclusiones llegan resueltos; presentación solo formatea conforme a la política decimal. Las fuentes ausentes se declaran no informadas.

## Adaptador de cálculo en navegador

La búsqueda acotada puede ejecutar suficientes nodos para bloquear eventos de interfaz. Usar un Web Worker local mediante un adaptador de infraestructura para estas dos operaciones; dominio y aplicación conservan ejecución síncrona pura. No usar un servicio remoto ni un worker para duplicar reglas.

Solicitud: `revision`, `modalidad`, entrada normalizada. Respuesta: misma `revision` y resultado, o error estructurado. Eliminar resultados dependientes al cambiar un archivo; terminar el worker viejo o ignorar su revisión. Solo aceptar la última revisión. El contador de nodos, no el tiempo transcurrido, determina la solución; un usuario puede cancelar sin generar resultado financiero.

La creación del worker y los estados React se prueban aparte del caso de uso. Si el worker falla, mostrar fallo recuperable y permitir recalcular, sin presentar un resultado anterior como vigente. No guardar entradas en disco ni registrar datos de cliente en consola.

## Contrato implementado y verificado el 2026-10-25

Los tipos reales de salida se llaman `PropuestaCosto` y `PropuestaMeta`. `admisible` y `motivosNoAdmisible` separan cumplimiento de cobertura o ahorro. `fuentes` conserva cliente, corte, distribuidor, versión/fuente/fecha del catálogo, metadatos de supuestos, referencia UF, monto y porcentaje sin identificar, exclusiones y nombres de emisores. Las ausencias se expresan como no informadas; las convenciones financieras se documentan en las vistas y en `research.md`, sin un campo serializado adicional.

`ResumenFinanciero.basePesosClp` declara la base de concentración/crecimiento, distinta de `capitalClp` invertido. TAC y retornos ponderados usan capital invertido. `actuales` conserva el origen de costo. Las asignaciones llevan `loteOrigen`, pesos, bruto/neto supuestos, volatilidad, y en meta `ticketFinalClp`. `evidencias` contiene evaluaciones de acceso, ticket, motivo y tareas condicionales. Cada evaluación indica su uso (`destino`, `tenencia` o `alternativa`), la serie asignada y el lote o los tramos correspondientes. Las alternativas son otras series del producto asignado al mismo ticket; no son una traza completa del buscador ni una certificación de admisibilidad de una cartera alternativa.

Cada pago de meta incluye `reservadoVpUf` y `noFinanciadoInicialUf` reconciliados cronológicamente contra reservas efectivamente invertidas. Cada escenario incluye `periodos` (fechas, saldos, bruto, TAC, costo), `rescates` (pago, fecha, liquidación, asignación, UF y transferencia) y `agotamientoTramos`, además de agotamiento total y primer pago pendiente. Los importes liquidados no siguen capitalizando.

El adaptador `ejecutarPropuesta` usa `proposal.worker.ts`. `cancelarPropuestas` termina operaciones; errores conservan ruta en el mensaje, revisión y detalle recuperable. El hook invalida respuestas antiguas incluso si se entregan después de cancelar.

Una reserva sin inversiones no declara categorías ni retorno efectivo y lleva VP `null`. Si falta algún soporte, VP total y su brecha son `null`; las inversiones parciales admisibles y los pendientes de escenarios se conservan. La meta también incluye la cartera actual computable de referencia, sin inferir ventas ni origen de su presupuesto.

## Compatibilidad y aceptación

Las pruebas vigentes de `Analisis` y de tres archivos deben seguir pasando. Las nuevas pruebas consumen los mismos tipos y resultados que la pantalla; fixtures derivados, sin modelos espejo. Probar éxito, déficit, parcial, falta de datos, búsqueda incompleta, errores y nuevas cargas. No se añade HTTP, historial, firma, PDF ni SHA-256.

# Revisión de avance y plan de simplificación

Fecha: 2026-10-22. Estado: entregas 1–4 aplicadas. Regresión técnica realizada; medición SC-005 con asesores pendiente.

## 1. Conclusión

El núcleo de nivel 1 está implementado: carga JSON, diagnóstico, acceso por primera coincidencia y comparación de series del mismo fondo y AGF. La interfaz conserva evidencia, pero exige interpretar demasiados términos y recorrer información repetida. La siguiente entrega debe mejorar comprensión y recuperación de errores antes de añadir capacidades de nivel 2 o 3.

Usuario principal: asesor distribuidor de fondos. Su tarea es explicar cuánto cuesta la cartola, qué reducción de costo permiten los acuerdos y qué requiere revisión. La aplicación prepara el análisis; una persona decide.

## 2. Evidencia y límites de esta revisión

- Leídos `SPEC.md`, la especificación detallada `specs/001-diagnostico-cambio-serie/spec.md`, `ARCHITECTURE.md`, `PRODUCT.md`, `DESIGN.md` y la auditoría existente.
- Revisadas las fuentes de presentación, importación, caso de uso, diagnóstico, acceso, validación y política numérica. Revisados los casos de prueba existentes como documentación del comportamiento previsto.
- Recorrido actual en navegador: inicio vacío, selección manual de los tres archivos y análisis del caso de referencia. Se observaron costo de $5.180.000, costo posterior de $3.530.000, ahorro elegible de $1.650.000 y adicional condicionado de $615.000.
- Capturas actuales de escritorio 1440 × 1000 y móvil 390 × 844 en `.impeccable/review/plan-desktop.png` y `plan-mobile.png`. En móvil no hubo desbordamiento de la página; la tabla sí requiere desplazamiento horizontal.
- El índice de codebase-memory no cubre `src/`; las conclusiones se basan en lectura directa de las fuentes.
- No se ejecutaron pruebas automatizadas ni compilación en esta revisión documental. La auditoría anterior registra 99 pruebas aprobadas en su momento; ese registro no acredita una nueva ejecución.
- No se midió SC-005 con asesores reales. No se acredita cumplimiento exhaustivo de todos los casos límite ni publicación pública.

## 3. Avance frente a la especificación

| Requisitos | Situación actual | Pendiente o límite |
| --- | --- | --- |
| FR-001 y FR-002: entradas reemplazables | Tres cargas manuales; reemplazo individual después de una carga válida. | FR-001 aún describe inicio con ejemplo. Debe recoger la instrucción posterior del usuario: inicio vacío y selección manual. |
| FR-003: validación comprensible | Lectura, sintaxis, estructura y tipo de archivo con mensajes por campo; se reúnen errores de varios archivos. | Las inconsistencias de negocio terminan en un aviso general y detalle técnico para soporte. Falta señalar claramente archivo, fila y corrección también en estos casos. |
| FR-004 a FR-007: diagnóstico | Montos, exclusiones, pesos, TAC, costo y advertencias de valorización presentes. | “Base computable”, “de base TAC” y el denominador necesitan mejor explicación. Las advertencias quedan al final del resumen. |
| FR-008 a FR-012: acceso | Reglas 0–6, serie actual, habilitación, vigencia, mínimos y evidencia disponibles. | Gamma muestra “Sin cambio elegible” en la tabla; el motivo concreto exige abrir otra sección. |
| FR-013 a FR-018: comparación | Menor TAC elegible, ahorro, empates y tareas condicionales implementados; comisiones fuera de selección. | El ahorro condicionado tiene poca visibilidad inicial. La lectura debe distinguirlo inmediatamente del ahorro elegible. |
| FR-019: contexto y explicaciones | Cliente, corte, fuente, universo y decisión humana visibles. | El requisito de mostrar “datos ficticios” contradice la instrucción posterior de retirarlo. La procedencia real declarada en los archivos debe conservarse. |
| FR-020: uso adaptable y teclado | Controles nativos, foco y tablas desplazables implementados; resumen revisado en dos tamaños. | En móvil, nombre, costo, cambio y ahorro no se ven juntos. Esta revisión no repitió todo el recorrido de teclado. |
| FR-021 y FR-022: repetición y variantes | Flujo sin resultados vigentes durante una nueva selección; motor con entradas explícitas y casos de variantes existentes. | Repetir regresión tras implementar la simplificación. No se ejecutaron esas variantes en esta revisión. |
| FR-023: documentación y pruebas | Documentos, pruebas del motor/importación y entrega preparada existen. | Alinear especificación, dirección de interfaz y auditoría con las decisiones posteriores. |
| FR-024 y SC-009: entrega pública | Aplicación estática, sin servidor de aplicación, base de datos ni cuentas. | Repositorio y sitio públicos siguen pendientes. No equivalen a la ejecución local. |

No asignar un porcentaje global de avance: el motor, la usabilidad y la publicación tienen evidencias y pendientes distintos.

### Documentación desactualizada

1. La especificación detallada aún figura como Draft y mezcla instrucciones de la fase de especificación con el producto construido.
2. FR-001 y los recorridos deben describir selección manual, conservando los archivos de referencia para comprobar resultados.
3. FR-019 debe recoger la retirada de etiquetas genéricas de datos ficticios. Mantener fecha y fuente recibidas en el catálogo.
4. `docs/frontend-direction.md` todavía menciona descargar el ejemplo, acción ya eliminada.
5. `docs/acceptance-audit.md` registra estados anteriores; necesita fecha de evidencia por revisión y los límites actuales. Especialmente FR-003, FR-019 y SC-005.

Estas correcciones documentan decisiones ya tomadas. No cambian fórmulas, reglas de acceso ni criterios financieros.

## 4. Fricciones observadas

- Hay dos entradas al mismo inicio de carga y el botón “Cargar cartola” lleva a un formulario que exige tres archivos.
- Vista general repite la tabla completa de Posiciones. El asesor recorre la misma información con dos nombres.
- El resumen da protagonismo inicial al patrimonio y a la base técnica; costo y ahorro aparecen después.
- “26,09 % de base TAC” no explica qué se divide. “bps”, “ticket” y “elegible” tampoco reciben explicación cercana.
- “Sin cambio elegible” reúne motivos diferentes: falta de acuerdo, ausencia de mejora y otras restricciones.
- Una flecha sola abre evidencia y cambia de pestaña. El destino no resulta evidente visualmente.
- La advertencia de una posición sin identificar aparece después de la tabla y los condicionales.
- El espacio de análisis muestra un chevrón sin acción, con aspecto de selector.

Estas son observaciones de interfaz e hipótesis de mejora. Falta contrastarlas con asesores reales.

## 5. Recorrido propuesto

### Cargar archivos

Inicio vacío con el formulario directamente disponible y una acción principal: “Analizar archivos”. Mostrar progreso “2 de 3 archivos seleccionados” y cuáles faltan. Conservar los tres destinos explícitos, sin adivinar el contenido por nombre.

Al seleccionar, indicar “Seleccionado · pendiente de validar”. Después del análisis, “Validado”. Un archivo seleccionado no debe parecer comprobado. Mostrar cada error junto a su archivo y un resumen con enlaces a todos los errores.

Después de un análisis válido, usar “Actualizar archivos” para volver al formulario. Mostrar qué archivo se reemplazará y cuáles se conservarán. Mantener la invalidación de resultados al seleccionar cambios.

### Entender el resultado

Primera sección: costo anual actual, ahorro elegible anual y costo anual con los cambios. Usar texto que exprese estimación según los datos y acuerdos cargados, sin prometer ejecución ni rentabilidad.

Mostrar también el ahorro adicional que requiere confirmación, separado y con esa condición escrita. Los montos sin identificar o excluidos deben tener un aviso cercano al resumen. Mantener patrimonio total y monto usado para TAC en un bloque secundario visible o desplegable.

### Revisar posiciones

Una única lista de posiciones con búsqueda. Cada posición muestra monto, costo actual, cambio elegible, ahorro anual y motivo de mantener cuando corresponda. No ocultar posiciones sin cambio ni sin identificar.

En escritorio, conservar una tabla compacta. En móvil, representar cada posición como una fila expandible con sus cifras etiquetadas; el asesor debe ver nombre, costo y ahorro sin desplazamiento lateral. La tabla completa de alternativas puede mantenerse como consulta avanzada accesible.

Cada posición tendrá una acción escrita “Ver series y motivos”. Abrir el detalle dentro del mismo recorrido mediante un panel o sección expandible, con regreso claro y foco conservado. Eliminar la pestaña independiente de acceso cuando el detalle por posición la sustituya por completo.

### Consultar evidencia

Primero, una explicación concreta: por qué cambia o por qué se mantiene. Después, todas las series y sus estados. Conservar número de regla, evidencia, empates y tareas mediante expansiones nativas. “Cómo se calcula” sigue accesible como ayuda secundaria.

No volver a implementar reglas financieras en React. Los motivos deben derivar de estados y evidencia del motor, preservando la primera coincidencia de R04.

## 6. Plan de ejecución

| Orden | Entrega | Criterio para darla por terminada |
| --- | --- | --- |
| 1 | Alinear documentos y vocabulario. Corregir carga/actualización, explicar TAC y puntos base; sustituir “de base TAC” por “del monto usado para calcular el TAC”, con denominador cercano. | Ningún texto promete autoload, descargas o capacidades inexistentes. El porcentaje conserva el denominador de FR-005. |
| 2 | Simplificar carga y errores. Inicio con formulario, progreso, estados honestos y errores junto a cada archivo; traducir inconsistencias de negocio sin perder detalle técnico. | Dos archivos erróneos muestran dos correcciones; un campo ausente identifica fila y dato; un catálogo inconsistente señala su referencia. No aparecen cifras antiguas como vigentes. |
| 3 | Reordenar resumen. Costo, ahorro y costo posterior primero; condicional y alertas cerca; contexto técnico secundario. | Con el caso de referencia se localizan $5.180.000, $1.650.000, $3.530.000 y $615.000 sin confundir escenarios. |
| 4 | Unificar posiciones y evidencia. Una lista, motivo de mantener y acción explícita; detalle contextual y vista móvil legible. | Se explica Gamma sin buscar entre pestañas. Todas las posiciones y alternativas siguen consultables. En 390 px se ve costo y ahorro sin desplazamiento lateral de la lista principal. |
| 5 | Comprobar comprensión y regresión. Revisar referencia, variantes, errores, teclado y móvil; después observar uso con asesores. | Cifras y reglas preservadas. SC-005: localizar costo, ahorro elegible, condicionado y motivo de Gamma en menos de tres minutos, sin asistencia. Registrar tiempo y errores reales. |

Primer bloque recomendado: entregas 1 y 2. Segundo bloque: 3 y 4. La entrega 5 cierra cada bloque con las comprobaciones correspondientes; la medición con asesores requiere participantes reales.

## 7. Límites y evolución a nivel 3

Conservar las cuatro capas, el caso de uso puro, la precisión decimal, el contexto de entrada y la evidencia. El trabajo propuesto se concentra en presentación y traducción de errores. No requiere añadir dependencias.

La estructura de resumen, posiciones y evidencia puede alojar controles posteriores. Esto prepara la navegación, pero no implementa controles, riesgo, documentos reproducibles, firma ni historia de nivel 3. Tampoco convertir el resultado actual en “propuesta aprobada” o “lista para ejecutar”.

## 8. Implementación posterior a la aprobación

Tras la aprobación del usuario se aplicaron las entregas 1–4: documentos alineados, formulario directo con progreso y errores por archivo, resumen de costos y ahorro, advertencias próximas y lista única con evidencia desplegable. Las cifras, reglas, capas y dependencias del motor se conservaron. La lista se adapta a móvil; las alternativas avanzadas mantienen una región de tabla desplazable por teclado.

Verificación posterior: 99 pruebas existentes aprobadas, tipos y compilación correctos, análisis estático de los componentes revisados sin errores. Recorrido en navegador con archivos intercambiados, campo TAC ausente, referencia de emisor inconsistente, recuperación, búsqueda, apertura por teclado, foco al consultar condiciones y menú móvil con Escape. La medición con asesores de SC-005 sigue pendiente. Los detalles están en `docs/construccion.md`.

La sección 2 documenta la revisión inicial, anterior a esta implementación. Sus límites de ejecución no sustituyen la evidencia posterior descrita aquí.

## Ajuste posterior — vista anterior del análisis

A petición del usuario se restauran Vista general, Posiciones y Acceso y series, las tarjetas de costo y ahorro y la tabla compacta. Se retiran los bloques explicativos añadidos. La carga manual, validación y errores por archivo se conservan.

Tipos y compilación correctos; revisión estática sin errores. Revisados escritorio, móvil de 390 px, búsqueda y apertura de evidencia con foco. No se ejecutaron pruebas automatizadas en este ajuste.

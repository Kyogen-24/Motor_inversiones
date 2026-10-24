# Auditoría de aceptación — Nivel 1

Fecha: 2026-10-22. La auditoría conserva evidencias históricas y actualiza el estado de entrega. No acredita un estudio de usabilidad con asesores reales.

## Cierre aceptado — 2026-10-24

El usuario da por cerrado el alcance de presentación revisado. Esta sección prevalece sobre las descripciones históricas de interfaz que siguen abajo.

- Ahorro elegible: 1.650.000 CLP; costo elegible: 3.530.000 CLP; TAC de cartera: 1,5348 %.
- Ahorro condicional adicional: 615.000 CLP (300.000 + 315.000), medido desde la serie elegible aplicada o la actual si se conserva. No se incorpora al escenario sin condiciones.
- Si se cumplen las condiciones y se reevalúa el acceso: ahorro total posible 2.265.000 CLP, costo 2.915.000 CLP y TAC de cartera 1,2674 %.
- Tablas separadas, sin columnas adicionales; serie y TAC sin costos en las celdas condicionales. Condiciones breves, sin «R04.4», con confirmación escrita de la AGF u obtención de mandato según corresponda.
- Bases de TAC visibles: cartera computable 230.000.000 CLP; posiciones con serie 210.000.000; oportunidades condicionales 105.000.000. Los pies aclaran «TAC de estas posiciones».
- Diagnóstico incluye todas las posiciones; Series incluye solo posiciones con series evaluables. El depósito de 20.000.000 CLP es computable con costo cero, pero no tiene series para cambiar. Los productos sin identificar permanecen en diagnóstico.
- Gamma conserva su costo y ahorro cero; el resumen explica la falta de acuerdo. Cambio de AGF fuera de Nivel 1.

Evidencia automatizada de esta revisión: suite completa de 121 pruebas aprobada durante la evaluación del motor; tras los últimos cambios, 9 pruebas de presentación aprobadas y `npm run build` correcto, incluyendo TypeScript. No se repitió la suite completa después de esos últimos cambios.

Límites y seguimiento: no se pudo revisar la interfaz actual en navegador, escritorio/móvil o teclado porque el navegador de la sesión no estaba disponible. Las capturas históricas no validan la versión actual. «Ver evidencia» abre la tabla general de Series sin enfocar una posición; esta tabla no expone toda la evidencia ni todas las tareas producidas por el motor. La revisión de esa navegación y de la evidencia queda como mejora posterior. FR-012/FR-013 tienen respaldo de motor, pero su presentación completa no queda acreditada por este cierre. La medición con asesores reales sigue pendiente.

## Requisitos funcionales

| Requisitos | Evidencia actual | Estado |
| --- | --- | --- |
| FR-001, FR-002 | DataPanel e input; cargas del ejemplo y variante realizadas en la compilación | Verificado localmente |
| FR-003 | Zod, validarNegocio y pruebas de sintaxis, tipos, fechas, relaciones y duplicados | Verificado |
| FR-004, FR-005 | Prueba de referencia completa y cifras en pantalla; pesos y costos por fila | Verificado |
| FR-006 | Pruebas de efectivo, depósitos, seguros, other, ETF y fondo de inversión | Verificado |
| FR-007 | Pruebas de discrepancia 0 / 0,5 / 1 / 1,01 CLP y cuotas faltantes | Verificado |
| FR-008, FR-009 | Lectura de Gamma sin propuesta; pruebas de vigencia estricta/inclusiva y habilitación cero | Verificado |
| FR-010 | Las 13 alternativas tienen prueba; cinco actuales marcadas; tabla de acceso conserva estado, regla y evidencia | Verificado |
| FR-011 | Pruebas de valores predeterminados; rechazo de TAC/mínimo ausentes | Verificado |
| FR-012 | Pruebas de tickets separados, igualdad del mínimo y agregación | Verificado |
| FR-013 | Condicionales separados, tareas escritas, reevaluación y ausencia de ejecución | Verificado |
| FR-014 a FR-017 | Cifras por posición y total, mismos fondos, Gamma, empates y ausencia de ahorro en cero | Verificado |
| FR-018 | Prueba modifica todas las comisiones y compara posiciones y totales completos | Verificado |
| FR-019 | Contexto, fuente, fechas y universo; etiquetas genéricas retiradas por instrucción posterior del usuario | Verificado localmente |
| FR-020 | Capturas 1440/390 px, foco visible, menú con Tab/Escape y regiones de tabla enfocables | Verificado en tamaños revisados |
| FR-021 | Inmutabilidad/determinismo; recorridos con dos cargas, rechazo y recuperación sin cifras obsoletas | Verificado |
| FR-022 | Pruebas modifican montos, mínimos, apertura, APV, mandato, vigencia, habilitación y comisiones | Verificado |
| FR-023 | README, SPEC, arquitectura y pruebas; ZIP autónomo con archivo de bloqueo | Verificado localmente |
| FR-024 | Aplicación estática sin backend ni cuentas; compilación para la ruta configurada de Pages | Despliegue inicial completado en Pages |

## Resultados medibles

| Criterio | Evidencia | Estado |
| --- | --- | --- |
| SC-001, SC-003 | Pruebas de cifras completas, TAC con redondeo y presentación del ejemplo | Verificado |
| SC-002 | 13 alternativas y cinco actuales en pruebas; interfaz de acceso consultable | Verificado localmente |
| SC-004 | Pruebas de invariancia comercial y cambios de acceso | Verificado |
| SC-005 | Vista general, tabla de Posiciones y evidencia en Acceso y series | Implementado; tiempo con asesor real no medido |
| SC-006 | Pie de contexto y clasificación/exclusiones por posición | Verificado localmente |
| SC-007 | Pruebas de datos inválidos y recorrido UI de error sin resultados anteriores | Verificado en casos cubiertos |
| SC-008 | Repetición del caso y diez variantes tres veces, más navegación móvil con teclado | Verificado en referencia y variantes cubiertas |
| SC-009 | Repositorio y sitio públicos con nombre propio | Pendiente: configurar repositorio público propio y GitHub Pages |

## Comandos y límites de evidencia

La verificación histórica registró 99 pruebas de dos archivos y compilación correcta. Se comprobó la misma instalación, pruebas y compilación desde el ZIP extraído a un directorio nuevo. MCP Playwright comprobó la compilación bajo una subruta de Pages, cargas sucesivas, cambio de montos, rechazo de sintaxis, cartola vacía y recuperación.

La revisión independiente corrigió dos fallos materiales de foco y oportunidades de cero. Su disposición `ship` cubre esas correcciones, no es una certificación financiera ni una aprobación del sitio público pendiente.

## Revisión de simplificación — 2026-10-22 (histórica)

Se reemplazaron las pestañas y la tabla repetida por un resumen y una única lista con evidencia desplegable. La carga inicia vacía y distingue selección pendiente de validación de archivo validado. Los errores se enlazan desde un resumen y se muestran junto a cada archivo. Las inconsistencias de negocio con ruta conocida se traducen conservando campo y fila.

En esta revisión se ejecutó `npm test`: 99 pruebas aprobadas. El detalle del recorrido actual y sus límites se registra en `docs/construccion.md`. SC-005 sigue sin medirse con asesores reales. La publicación estaba pendiente en esa revisión.

## Estado actual de entrega — 2026-10-22

La vista de análisis volvió a las pestañas por preferencia del usuario. Se mantienen carga vacía, errores por archivo y tabla accesible; «bps» se presenta como «puntos base».

El despliegue inicial del commit `76f7661` terminó correctamente, incluidos los trabajos build y deploy. El flujo actualiza acciones a Node 24 y fija Ubuntu 24.04; solo se ejecuta manualmente. La publicación en un repositorio público propio sigue pendiente.

`data/pruebas/` incorpora cuatro conjuntos completos y cuatro archivos inválidos con guía de resultados esperados. Esos escenarios manuales nuevos no se han comprobado en la interfaz; no amplían por sí solos la evidencia de las 99 pruebas existentes. SC-005 sigue pendiente.

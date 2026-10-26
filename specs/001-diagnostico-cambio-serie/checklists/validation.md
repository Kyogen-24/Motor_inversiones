# Verificación y límites — Nivel 1

Fecha: 2026-10-24. Revisión exclusivamente documental de SPEC.md y la carpeta 001-diagnostico-cambio-serie copiada de otro proyecto.

## Ejecuciones comprobadas en este repositorio

| Comprobación | Resultado |
| --- | --- |
| npm test -- src/application/analizarCartola.test.ts src/infrastructure/input.test.ts src/presentation/tables.test.tsx | 3 archivos y 121 pruebas aprobadas, sin fallos |
| npm run typecheck | Aprobado con la configuración actual |
| Runtime de esta revisión | Node v26.11.1 |
| Módulos, contratos y configuración | Inspección de fuentes actuales, no de las rutas ficticias de la copia |
| Cambios de implementación | Huellas de 73 archivos de código/datos/configuración idénticas al inicio; sin cambios de código |
| Build, benchmark, navegador, React Doctor y publicación | No ejecutados en esta revisión |

Typecheck recorre la configuración del proyecto, pero no constituye una auditoría funcional de las otras modalidades. Las 121 pruebas listadas corresponden al alcance de nivel 1; no se mezclan con el conteo de la suite completa.

## Cobertura de las suites reales

| Archivo | Comprobaciones |
| --- | --- |
| src/application/analizarCartola.test.ts | Totales, denominadores, ahorro, exclusiones, ETF, valorización, ceros, empates, R04, patrimonio al corte, variaciones, comisiones, no mutación y contexto |
| src/infrastructure/input.test.ts | Defaults, identidad exacta, campos adicionales, obligatoriedad, calendario, moneda, tipos, límite de posiciones, BOM, lectura, sintaxis y tamaño |
| src/presentation/tables.test.tsx | HTML de revisión de archivos y tablas de diagnóstico, ahorro, condicionales, series y evidencia de componentes aislados |

Las pruebas financieras reproducen las cifras de [quickstart.md](../quickstart.md) y también variaciones e invariantes. No se afirma que toda variante de esa guía se haya ejecutado mediante la interfaz en esta revisión.

## Casos temporales y coherencia

- Patrimonio con fecha anterior o igual al corte puede acreditar agregación cuando alcanza el mínimo.
- Patrimonio posterior no invalida todo el análisis: bloquea por regla 5 solo la alternativa que lo necesita.
- Ticket suficiente y reglas anteriores conservan su estado.
- La condición por mandato conserva tareas y se reevalúa al formalizarlo.
- Dos acuerdos del mismo emisor son un error, aunque no estén vigentes a la vez.
- El diagnóstico no usa fecha del dispositivo ni permite nuevas contrataciones solo por ser una tenencia actual.

Estas conclusiones se basan en eligibility.ts, validation.ts y las regresiones temporales de analizarCartola.test.ts.

## Estado por criterio de éxito

| Criterio | Evidencia y límite |
| --- | --- |
| SC-001 | Diagnóstico y conciliación comprobados por caso de uso y HTML |
| SC-002 | Primera coincidencia y acceso comprobados en el motor; la marca Actual oculta estado/regla en la tabla principal |
| SC-003 | Ahorro elegible, adicional condicional y posterior comprobados |
| SC-004 | Evidencia disponible en el resultado y componentes probados; su consulta completa desde el recorrido principal sigue parcial |
| SC-005 | Variaciones, comisiones y repetición comprobadas por las suites actuales |
| SC-006 | Errores de entrada y guardas de revisión inspeccionados; no se atribuyen pruebas DOM de carreras de carga inexistentes |
| SC-007 | HTML y controles inspeccionados; nueva revisión visual, teclado, zoom y contraste pendientes |

## Diferencias que no se corrigieron con código

1. TablaSeries representa la serie poseída como Actual, con regla en guion, aunque el motor conserva su estado.
2. Ver evidencia cambia a una tabla general sin enfocar la posición; el detalle completo y todas las tareas no quedan accesibles por ese enlace.
3. PositionDetail contiene evidencia detallada y tiene pruebas aisladas, pero no está conectado a ese recorrido.
4. AnalysisView calcula algunos subtotales y TAC de subconjuntos. No se acredita que toda magnitud derivada de presentación esté en dominio.
5. No hay lector sin pérdida ni detector específico de claves repetidas; no se atribuyen esas garantías al JSON actual.

Se registran como límites o pendientes en los contratos y tareas. No se reducen las pruebas financieras ni se presentan cambios de texto como una corrección del comportamiento.

## Evidencia importada descartada

No se utilizan como resultados de este checkout:

- Informes de 26/27 archivos de prueba o suites en tests/.
- Instalación de Node alternativo, pérdida de acceso npm o ausencia de Git.
- Benchmarks con hardware y jsdom no comprobados aquí.
- Puntuaciones React Doctor y recorridos de navegadores del proyecto de origen.
- Capturas bajo rutas temporales que no se verificaron.
- CI por PR, acciones fijadas a SHA o publicación que el workflow actual no configura.

El archivo .github/workflows/pages.yml usa inicio manual, referencias de versión y artefacto dist después de pruebas/build. La ejecución remota, subruta real, auditoría del historial y URL pública no se comprobaron aquí.

## Trazabilidad y cierre

SPEC.md enlaza FR-001–024 con los módulos y las tres suites existentes. Se mantienen los 64 identificadores de tareas, con 52 comprobaciones respaldadas y 12 pendientes. La revisión documental no acredita toda la entrega.

Las fuentes se localizaron con Codebase Memory y se contrastaron directamente cuando la cobertura informó cambios o ausencia de registro. El índice anterior no se trató como prueba de un archivo cambiado. No se modificaron fuentes, datos, configuración ni documentos de nivel 2.

La comprobación documental final revisó los 15 documentos modificados: enlaces locales existentes, ausencia de espacios finales, conservación de 24 FR y 7 SC, y los 64 identificadores de tareas sin duplicados. Spec.md no contiene los nombres, montos ni fechas de los casos ficticios. Git diff --check terminó sin errores.

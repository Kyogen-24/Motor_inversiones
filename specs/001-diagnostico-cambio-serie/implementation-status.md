# Estado de implementación y alineación — Nivel 1

Revisión del 2026-10-24, limitada a documentación. Se contrastaron SPEC.md y la carpeta 001-diagnostico-cambio-serie con el código, configuración y pruebas actuales. La aplicación ya existe; no se ejecutó una nueva implementación.

## Comprobaciones ejecutadas aquí

- Tres archivos de pruebas de nivel 1: 121 pruebas aprobadas.
- npm run typecheck: aprobado.
- Revisión de módulos y contratos: analizarCartola, model, numeric, diagnosis, eligibility, validation, input y presentación del recorrido de nivel 1.
- Revisión de package.json, tsconfig, Vite y workflow Pages.
- Se compararon al cierre las huellas de 73 archivos de código, datos y configuración: sin cambios. Ningún documento de nivel 2 fue modificado.

La prueba automatizada de HTML no monta un navegador. No se ejecutó un nuevo build, benchmark, auditoría visual, React Doctor ni despliegue durante esta revisión.

## Incompatibilidades de la documentación copiada

| Afirmación importada | Situación del proyecto |
| --- | --- |
| Motor_Propuestas_Inversión y Node 24 instalado para esta implementación | Identidad visible Motor_inversiones; revisión con Node v26.11.1; CI configurado con Node 24 |
| lossless-json y lexemas preservados | JSON.parse y Zod; sin garantía de preservar el token original ni detector específico de claves repetidas |
| Decimal de 64 dígitos y escala general máxima 8 | Decimal de 40 dígitos; límites por campo, incluidos hasta 16 dígitos significativos en las magnitudes comprobadas por dominio |
| Archivos hasta 10 MiB | Hasta 5 × 1024 × 1024 bytes |
| 10.000 elementos por toda colección y máximo global de series | 10.000 posiciones, 1.000 productos/emisores/acuerdos y 100 series por producto |
| ETF con costo_anual_pct | Campo real tac_pct en el producto |
| Cliente sin perfil obligatorio; TAC de serie ausente admisible | Perfil/fecha y TAC/mínimo de serie son obligatorios en el esquema |
| Patrimonio posterior rechaza todo el análisis al llegar a agregación | Bloquea esa alternativa por regla 5 y conserva diagnóstico y otras series |
| Varios históricos de la misma AGF permitidos | Un único registro por emisor en todo el archivo |
| Salida ok/error y tipos nominales profundamente readonly | Analisis nivel-1.1 o Error; entradas con números y resultado con cadenas decimales, sin esa congelación |
| Árbol tests, módulos schemas/consistency/useAnalysis | Pruebas junto a src y módulos input/validation/diagnosis/useAppWorkflow |
| 26/27 archivos, benchmarks, hardware y puntuación Doctor importados | Solo se acredita la ejecución propia detallada en validation.md |
| Validación automática por PR y acciones fijadas a SHA | Workflow manual con referencias de versión |
| No existe Git o bloqueo npm vigente | Son antecedentes de otro entorno; no describen esta revisión |

Se corrigieron esas afirmaciones en los documentos afectados, conservando los identificadores FR/SC y T001–T064. Los datos ficticios se mantienen en quickstart, fuera de spec.md.

## Pendientes reales observados

1. La tabla principal usa Actual en lugar del estado y regla de la serie poseída. El motor sí conserva ambos datos.
2. El enlace de evidencia lleva a la tabla general de Series, sin seleccionar la posición. La evidencia completa y todas las tareas del motor no se consultan desde ese recorrido.
3. Algunos subtotales y TAC de subconjuntos se derivan en AnalysisView; no se acredita extracción completa a dominio.
4. No hay evidencia propia del benchmark ni de pruebas de interacción montadas que figuraban en la copia.
5. La revisión visual, contraste, zoom, subruta y entrega pública requieren verificación del checkout actual.

Estos pendientes no se arreglaron mediante cambios de código ni se consideran cerrados por corregir los textos.

## Estado de aceptación

El diagnóstico y las regresiones automatizadas de nivel 1 pasan. No se declara cumplida toda la exposición de evidencia ni toda la entrega. Tasks.md distingue 52 comprobaciones respaldadas y 12 pendientes; la matriz de validación explica qué acredita cada una.

Los informes de instalación fallida, reintento npm, Node alternativo, ausencia de Git y las capturas del otro proyecto no se mantienen como historia de este repositorio. No se modificó ni evaluó el alcance del nivel 2 en esta revisión.

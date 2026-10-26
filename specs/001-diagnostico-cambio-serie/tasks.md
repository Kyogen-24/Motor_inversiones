# Seguimiento de tareas — Nivel 1

Revisión documental del 2026-10-24. Se conservan los identificadores T001–T064 para mantener trazabilidad, pero se corrigen las rutas y garantías que pertenecían al otro proyecto.

Una marca [x] indica capacidad o comprobación respaldada por las fuentes y pruebas actuales; no afirma que se haya escrito código en esta revisión ni acredita un ciclo RED/GREEN histórico. [ ] señala trabajo o evidencia pendiente. Las tareas se ajustaron al contrato vigente: no solicitan implantar las políticas incompatibles de la copia.

Esta lista no autoriza implementar los pendientes. La instrucción actual permite únicamente documentación.

## Base y contratos — T001–T015

- [x] T001 Comprobar package.json y lockfile del proyecto: TypeScript 7, React, Vite, Tailwind, Zod, decimal.js y Vitest; no atribuir dependencias ausentes.
- [x] T002 Comprobar tsconfig.json y vite.config.ts: strict, src y configuración incluidos, plugins React/Tailwind y base configurable.
- [x] T003 Identificar las suites reales dentro de src y el comando npm test; no exigir tests/setup.ts o vitest.config.ts inexistentes.
- [ ] T004 Verificar archivos rastreados e historial antes de una entrega pública; .gitignore no elimina originales ya versionados.
- [x] T005 Comprobar index.html, src/main.tsx y presentación como aplicación local existente; identidad visible Motor_inversiones.
- [x] T006 Identificar cartola.json, catalogo.json y acuerdos.json en data como entradas ficticias de validación, sin carga automática de la aplicación.
- [x] T007 Contrastar entradas y Analisis nivel-1.1 con src/domain/model.ts; no atribuir unidades nominales ni readonly profundo inexistentes.
- [x] T008 Comprobar redondeo y precisión con las regresiones de src/application/analizarCartola.test.ts.
- [x] T009 Comprobar fechas válidas, bisiestos y rango admitido en src/infrastructure/input.test.ts y domain/numeric.ts.
- [x] T010 Verificar decimal.js privado de 40 dígitos y ROUND_HALF_UP en src/domain/numeric.ts.
- [x] T011 Identificar esFecha y las comparaciones de corte de nivel 1 en los módulos reales, sin Date.now para decisiones.
- [x] T012 Contrastar unicidad, referencias y fechas de src/domain/validation.ts: un registro por emisor, incluidos históricos.
- [x] T013 Comprobar lectura, BOM, sintaxis, tipos y tamaño con src/infrastructure/input.test.ts; documentar límites de JSON.parse.
- [x] T014 Contrastar presentación CLP/TAC/pesos con src/presentation/format.ts y las pruebas HTML existentes.
- [x] T015 Verificar que la fecha posterior de patrimonio produce regla 5 por alternativa y no un error global de coherencia.

## Diagnóstico — T016–T027

- [x] T016 Comprobar diagnóstico, base, costos y valorización en src/application/analizarCartola.test.ts.
- [x] T017 Comprobar esquemas y defaults de src/infrastructure/input.ts sin inventar TAC o mínimo de una serie.
- [x] T018 Contrastar analizarCartola: recibe tres objetos, devuelve Analisis o lanza Error, sin unión ok/error.
- [ ] T019 Acreditar con una prueba de interacción montada el error de carga, recuperación y retirada de resultados anteriores; las suites HTML no lo sustituyen.
- [x] T020 Identificar el parser y los esquemas reales en input.ts: JSON.parse y Zod, con límites actuales y sin lossless-json.
- [x] T021 Verificar campos obligatorios del cliente y serie, nulos explícitos y tres banderas con valor predeterminado.
- [x] T022 Comprobar leerArchivo y leerArchivos, carga manual, error por archivo y ausencia de referencias financieras precargadas en el estado inicial.
- [x] T023 Verificar clasificaciones computable, unidentified y excluded en src/domain/diagnosis.ts.
- [x] T024 Verificar costo por posición y totales reconciliados, TAC sobre base computable y cantidades no calculables.
- [x] T025 Comprobar coordinación pura y contexto clonado en src/application/analizarCartola.ts.
- [x] T026 Identificar selección, invalidación y revisión de lecturas en src/presentation/useAppWorkflow.ts.
- [x] T027 Contrastar datos y totales visibles con src/presentation/tables.test.tsx.

## Acceso — T028–T035

- [x] T028 Verificar primera coincidencia R04 y ticket individual mediante las pruebas de analizarCartola.
- [x] T029 Verificar vigencia estricta de inicio, fin inclusivo y habilitación por clave, incluida comisión cero.
- [ ] T030 Mostrar en la tabla principal el estado/regla de la serie poseída además de Actual; hoy esos datos se sustituyen visualmente.
- [x] T031 Contrastar Acceso y su evidencia en src/domain/model.ts y eligibility.ts, con marca actual separada.
- [x] T032 Verificar R04 en src/domain/eligibility.ts y tareas de mandato/agregación, sin considerar comisión como preferencia.
- [x] T033 Comprobar mínimos exactos, fecha futura/igual, precedencia y reevaluación tras mandato con las regresiones existentes.
- [x] T034 Verificar que diagnosticarPosicion integra acceso y comparación de todas las series del mismo fondo.
- [ ] T035 Conectar la evidencia detallada y todas las tareas al recorrido principal; el enlace actual abre una tabla general y no enfoca una posición.

## Comparación — T036–T043

- [x] T036 Comprobar selección por TAC estrictamente menor, orden estable por código y empate con la serie actual.
- [x] T037 Comprobar ahorro elegible, costo posterior y adicional condicional con la regresión numérica de nivel 1.
- [x] T038 Comprobar mediante HTML las tablas elegible/condicional, sus bases y el escenario con condiciones cumplidas.
- [x] T039 Identificar compararAlternativas y la selección por posición en src/domain/diagnosis.ts.
- [x] T040 Verificar que el resultado agregado suma un ahorro elegible y un mejor adicional condicional por posición.
- [x] T041 Verificar conservación de capital, fondos, AGF y denominador en la propuesta posterior de series.
- [ ] T042 Revisar la extracción de subtotales y TAC de subconjuntos de AnalysisView al motor; hoy la presentación deriva esas magnitudes.
- [x] T043 Contrastar formatos y bases de las tablas con src/presentation/tables.test.tsx, sin atribuir pruebas DOM de interacción.

## Repetición y cargas — T044–T050

- [x] T044 Identificar cargarEjemplo y las variaciones construidas dentro de las suites reales; no inventar tests/fixtures/variantes.ts.
- [x] T045 Comprobar cambios de TAC, mínimos, APV, mandato, cierre y acuerdos con las regresiones del caso de uso.
- [x] T046 Comprobar entradas congeladas no mutadas, repetición determinista e independencia de comisiones.
- [ ] T047 Agregar o ejecutar evidencia propia de carreras de carga en el recorrido de nivel 1; no trasladar las pruebas DOM del otro proyecto.
- [x] T048 Inspeccionar el descarte de lecturas antiguas y la invalidación de resultados en useAppWorkflow.
- [x] T049 Contrastar los controles de reemplazo/limpieza y revisión por archivo en DataPanel e InputReview.
- [x] T050 Verificar reglas de repetición e independencia financiera con las pruebas actuales, sin cambiar código durante esta revisión.

## Productos y exclusiones — T051–T056

- [x] T051 Comprobar efectivo y depósitos a cero, seguros/otros excluidos y ETF con o sin tac_pct declarada.
- [x] T052 Verificar conciliación y casos de cartola vacía, monto cero o base no computable.
- [x] T053 Comprobar descripción original, productos adicionales y campos anidados en la previsualización HTML.
- [x] T054 Contrastar el campo real de costo ETF: tac_pct en Producto; costo_anual_pct no es un alias.
- [x] T055 Verificar que productos sin series no generan comparaciones R05 ni costos inventados.
- [x] T056 Contrastar el diagnóstico de líneas sin identificar y exclusiones con model.ts, diagnosis.ts y sus pruebas.

## Verificación y entrega — T057–T064

- [ ] T057 Acreditar medidas visuales reales del checkout actual; no dar por verificadas las dimensiones y contrastes importados.
- [ ] T058 Medir el benchmark propio de nivel 1 antes de declarar objetivo de rendimiento cumplido; no hay benchmark.test en las suites actuales.
- [x] T059 Inspeccionar .github/workflows/pages.yml: inicio manual, pruebas/build, base calculada y artefacto dist; sin trigger de PR ni SHA fijados.
- [x] T060 Alinear SPEC.md, contratos, rutas, límites y matrices de nivel 1 con las fuentes actuales, separando datos de prueba.
- [ ] T061 Repetir recorrido visual, teclado, zoom y contraste de nivel 1 y registrar navegadores y limitaciones.
- [ ] T062 Verificar build/preview bajo la subruta real de entrega y auditar contenido publicable; no se ejecutó en esta revisión documental.
- [ ] T063 Confirmar autorización, URL y comprobación pública sin sesión antes de marcar publicación completada.
- [ ] T064 Cerrar aceptación de entrega con tipos, suite, build y comprobaciones visuales/subruta requeridas; esta revisión solo ejecutó las suites de nivel 1 y typecheck.

## Dependencias y evidencia

Entrada y contratos preceden al cálculo. Acceso precede a comparación; la verificación de nuevas cargas depende de un recorrido completo. Los pendientes de presentación, medición y entrega se comprueban sobre el proyecto actual, sin usar puntuaciones, capturas ni resultados de otro checkout.

La matriz FR→módulos→pruebas está en [SPEC.md](../../SPEC.md). Los comandos y resultados están en [validation.md](checklists/validation.md); los datos concretos permanecen en [quickstart.md](quickstart.md).

Estado de esta revisión: 52 comprobaciones respaldadas y 12 pendientes. La suite financiera y de HTML de nivel 1 pasó; esto no equivale a cerrar toda la entrega.

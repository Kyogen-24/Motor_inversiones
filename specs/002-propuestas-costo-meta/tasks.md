---

description: "Tareas ejecutables para propuestas de costo y meta — Nivel 2"
---

# Tasks: Propuestas de costo y meta — Nivel 2

**Input**: Documentos de diseño en `specs/002-propuestas-costo-meta/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` y `.specify/memory/constitution.md`.

**Tests**: Obligatorios. La constitución exige pruebas de regresión, invariantes y contratos para cualquier cambio al motor financiero. Escribir cada prueba antes de su implementación y comprobar que falla por la razón esperada.

**Organization**: Las tareas están agrupadas por historia para que cada incremento sea entregable y verificable de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo, en archivos distintos y sin depender de una tarea pendiente.
- **[Story]**: Historia de usuario a la que pertenece la tarea.
- Cada tarea nombra los archivos exactos que modifica o verifica.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Incorporar los insumos de referencia y la base de pruebas sin alterar la carga manual de nivel 1.

- [X] T001 [P] Incorporar los archivos de referencia de supuestos y meta en `data/supuestos.json` y `data/meta.json`, preservando sus fechas, UF y desembolsos.
- [ ] T002 [P] Crear fixtures reutilizables para cartola, catálogo, acuerdos, supuestos y meta de nivel 2 en `src/test/fixtures/nivel2.ts`.
- [X] T003 Documentar los comandos de validación de nivel 2 y que la carga sigue siendo manual en `specs/002-propuestas-costo-meta/quickstart.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fijar contratos, validación y cálculos comunes puros que bloquean ambas modalidades.

**⚠️ CRITICAL**: No comenzar trabajo de historias hasta completar esta fase.

- [X] T004 Definir los tipos discriminados `Supuestos`, `Meta`, `Desembolso`, `Tramo`, `PropuestaCosto`, `PropuestaMeta`, `Escenario` y estados de búsqueda de `contratos/propuestas.md` en `src/domain/proposalModel.ts`.
- [X] T005 [P] Crear validaciones Zod por modalidad para `supuestos.json` y `meta.json`, incluyendo retornos con signo, fechas ISO, categorías originales y límites de tamaño, en `src/infrastructure/input.ts`.
- [ ] T006 [P] Escribir pruebas de contrato de los cinco tipos de entrada, retornos negativos válidos y rechazos con ruta legible en `src/infrastructure/input.test.ts`.
- [X] T007 Implementar la unión `EntradasNivel2`, `TipoEntrada` de cinco archivos y mensajes de importación por archivo en `src/infrastructure/input.ts`.
- [X] T008 [P] Implementar helpers puros con `Decimal` de 40 dígitos para ACT/365,25, meses calendario `[desde, hasta)`, UF/CLP y redondeo solo de presentación en `src/domain/numeric.ts`.
- [ ] T009 [P] Escribir oráculos de fechas, VP, precisión decimal y conversión UF/CLP en `src/domain/numeric.test.ts`.
- [ ] T010 Implementar el verificador común de categorías conocidas, acuerdos vigentes, liquidez, concentración 40 % por fondo/60 % por AGF, perfil y retención sin nuevo aporte en `src/domain/proposalValidation.ts`.
- [X] T011 [P] Ampliar el ticket de `evaluarAcceso` a `number | string` sin cambiar la primera coincidencia de R04 en `src/domain/eligibility.ts` y cubrir compatibilidad en `src/domain/eligibility.test.ts`.
- [ ] T012 Escribir pruebas de invariantes del verificador: capital completo o declarado no asignable, fondos/AGF consolidados, retención Gamma sin aporte y acceso por ticket final en `src/domain/proposalValidation.test.ts`.
- [X] T013 Implementar riesgo de volatilidad ponderada simple, peso de crecimiento y tope reducido `perfil × min(1, mesesPrimerPago / 24)` en `src/domain/risk.ts`.
- [ ] T014 [P] Escribir pruebas de riesgo comparable actual/propuesta, crecimiento por categoría y reducción 0/12/24 meses en `src/domain/risk.test.ts`.

**Checkpoint**: Contratos y restricciones comunes listos; US1 y US2 pueden iniciarse en paralelo.

---

## Phase 3: User Story 1 - Proponer menor costo sin elevar riesgo (Priority: P1) 🎯 MVP

**Goal**: Generar, explicar y revisar una propuesta que primero cambia series, luego equivalentes acordados, y solo repara perfil o concentración cuando es necesario, sin elevar la volatilidad ponderada.

**Independent Test**: Cargar cartola, catálogo, acuerdos y supuestos de ejemplo; obtener la propuesta costo con capital íntegramente asignado/retendido, volatilidad no mayor, TAC anual de 1.097826 % y ahorro anual de $2.655.000, sin requerir `meta.json`.

### Tests for User Story 1

- [X] T015 [US1] Registrar la regresión determinista R07 en `src/domain/proposals.test.ts`: costo, ahorro, riesgo, capital y escenarios del conjunto de referencia.
- [X] T016 [US1] Cubrir invariantes R07 en `src/domain/costProposal.test.ts`: reparaciones, conservación de capital, riesgo no mayor, concentración, lotes y comisiones fuera de la decisión.
- [X] T017 [US1] Cubrir búsqueda determinista en `src/domain/costProposal.test.ts`: presupuesto global de 50.000 nodos, estado `limite_alcanzado` y prohibición de declarar óptimo global.
- [X] T018 [US1] Implementar la enumeración determinista acotada, orden de sustitución y verificación final decimal de R07 en `src/domain/costProposal.ts`.
- [X] T019 [US1] Implementar el caso de uso puro que arma la propuesta, comparativos, exclusiones y advertencias de universo de acuerdos en `src/application/proponerCostos.ts`.
- [ ] T020 [P] [US1] Escribir pruebas del caso de uso que rechazan entradas incompletas, preservan el diagnóstico de nivel 1 y devuelven la propuesta de costo sin meta en `src/application/proponerCostos.test.ts`.
- [X] T021 [US1] Extender carga, revisión y estado de ejecución de cuatro archivos para modalidad costo sin cálculo financiero en `src/presentation/App.tsx`, `src/presentation/DataPanel.tsx` y `src/presentation/InputReview.tsx`.
- [X] T022 [US1] Crear la vista de cartera actual/propuesta, cambios, riesgo, costo, concentración, restricciones y tareas condicionales en `src/presentation/ProposalView.tsx`.
- [X] T023 [US1] Añadir formato de UF/CLP/porcentajes, etiquetas «supuesto» y estilos `ts-` de tablas desplazables y foco visible para costo en `src/presentation/format.ts` y `src/presentation/styles.css`.
- [X] T024 [US1] Cubrir presentación de costo en `src/presentation/proposalsView.test.tsx`: cambios, etiquetas «supuesto», universo de acuerdos, evidencia y tablas.

**Checkpoint**: US1 funciona sin una meta y demuestra una mejora de costo sin subir riesgo.

---

## Phase 4: User Story 2 - Calzar inversiones con pagos de una meta (Priority: P1)

**Goal**: Ordenar pagos, reservar capital cronológicamente y asignar cada tramo a inversiones admisibles sin cerrar una brecha con más riesgo.

**Independent Test**: Con los cinco JSON de ejemplo, obtener ocho pagos ordenados, tramos y VP; mostrar VP total aproximado de 1.663,4795 UF frente a 1.750 UF, excedente aproximado de 86,5205 UF al tramo más largo, o el déficit y pago parcial si los límites lo imponen.

### Tests for User Story 2

- [X] T025 [US2] Cubrir asignación cronológica, VP por soporte efectivo y meses calendario en `src/domain/goalProposal.test.ts` y `src/domain/projection.test.ts`.
- [ ] T026 [US2] Escribir el oráculo de la meta de ejemplo: VP por tramo 203.332736…, 732.208014…, 727.938778…, excedente 86.52047… y categorías/series elegibles en `src/domain/goalProposal.test.ts`.
- [ ] T027 [US2] Escribir pruebas de déficit cronológico: primer pago parcial, pendientes posteriores, capital cero `sin_candidato`, categoría desconocida y capital no asignable en `src/domain/goalProposal.test.ts`.
- [ ] T028 [US2] Escribir pruebas de ticket consolidado entre tramos, primera coincidencia R04, liquidez, límite fondo/AGF y tope de crecimiento sin sumar posiciones existentes en `src/domain/goalProposal.test.ts`.
- [X] T029 [US2] Implementar selección de soportes, búsqueda de punto fijo VP/retorno bruto promedio, tramos, reservas cronológicas y excedente al tramo más largo en `src/domain/goalProposal.ts`.
- [X] T030 [US2] Implementar el caso de uso puro de meta que combina entradas, perfil, restricciones, VP, déficit/excedente y trazabilidad de alternativas no elegidas en `src/application/proponerMeta.ts`.
- [ ] T031 [P] [US2] Escribir pruebas del caso de uso de meta para entradas faltantes, pagos ordenados, meta no cubrible y estabilidad con las mismas entradas en `src/application/proponerMeta.test.ts`.
- [X] T032 [US2] Incorporar carga/revisión del quinto archivo y selección explícita de modalidad meta sin carga automática en `src/presentation/App.tsx`, `src/presentation/DataPanel.tsx` y `src/presentation/InputReview.tsx`.
- [X] T033 [US2] Crear la vista de pagos, tramos, VP, capital, déficit/excedente, restricciones y pendientes por pago en `src/presentation/GoalView.tsx`.
- [X] T034 [US2] Añadir tablas de tramos/pagos con encabezados, región desplazable enfocables, UF/CLP y explicaciones de categoría/liquidez en `src/presentation/GoalView.tsx` y `src/presentation/styles.css`.
- [ ] T035 [US2] Escribir pruebas de presentación de meta para orden de pagos, VP separado de pendiente neto, pago parcial y accesibilidad de tablas en `src/presentation/GoalView.test.tsx`.

**Checkpoint**: US2 produce una propuesta de meta con calce por plazo, aun cuando declare déficit, sin depender de que US1 se ejecute en pantalla.

---

## Phase 5: User Story 3 - Entender supuestos y escenarios (Priority: P2)

**Goal**: Proyectar las propuestas ya seleccionadas con retornos explícitamente supuestos, TAC descontada una sola vez y tres escenarios comparables.

**Independent Test**: Para ambas modalidades, mostrar exactamente adverso −1,5 pp, base 0 y favorable +1,5 pp; cambiar un retorno supuesto altera la proyección pero no la selección cuando los riesgos no cambian; la meta declara «alcanza» solo si el escenario base paga todos los desembolsos.

### Tests for User Story 3

- [ ] T036 [US3] Escribir el oráculo de un intervalo: 1.000 UF, 3 % bruto, 1 % TAC, saldo 1.005/1.020/1.035 UF y costo 10,025/10,1/10,175 UF en `src/domain/projection.test.ts`.
- [X] T037 [US3] Cubrir retiros cronológicos, saldo final, fecha de agotamiento y cobertura por UF —incluido un pago parcial— en `src/domain/projection.test.ts`.
- [X] T038 [US3] Cubrir R03 en `src/domain/projection.test.ts` y `src/domain/proposals.test.ts`: costo por saldo medio sin segundo débito, retorno neto y los tres escenarios.
- [ ] T039 [US3] Escribir pruebas que distinguen excedente/déficit por VP de pagos pendientes netos y que prohíben «alcanza en el escenario base» con cobertura menor a 100 % en `src/domain/projection.test.ts`.
- [X] T040 [US3] Implementar proyección por instrumento e intervalo, saldo medio, TAC única, pagos y escenarios para costo a cinco años y meta hasta último pago/agotar en `src/domain/projection.ts`.
- [X] T041 [US3] Integrar proyecciones y conclusión base de meta en `src/application/proponerCostos.ts` y `src/application/proponerMeta.ts`.
- [X] T042 [US3] Implementar el adaptador de worker local que delega casos de uso sin contener reglas financieras, propaga resultados/errores y conserva el presupuesto determinista en `src/infrastructure/proposalWorker.ts`.
- [X] T043 [US3] Conectar ejecución no bloqueante, estado de búsqueda y navegación de ambas modalidades en `src/presentation/App.tsx` y `src/presentation/Navigation.tsx`.
- [X] T044 [US3] Mostrar fuente/fecha de supuestos, método de riesgo, limitación sin correlaciones, costo/retorno/VP/proyecciones rotulados «supuesto» y los tres escenarios en `src/presentation/ProposalView.tsx` y `src/presentation/GoalView.tsx`.
- [X] T045 [US3] Cubrir presentación de escenarios, etiquetas «supuesto», conclusión base y cobertura en `src/presentation/proposalsView.test.tsx`.
- [ ] T046 [US3] Escribir una prueba de integración de carga manual y worker que verifica que cambios de retorno alteran escenarios pero no la selección de riesgo intacto en `src/presentation/App.test.tsx`.

**Checkpoint**: Todas las proyecciones explican que son supuestos, comparan tres escenarios y no prometen retornos ni cobertura.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar el producto completo, rendimiento y documentación sin cambiar reglas ya verificadas.

- [X] T047 [P] Ejecutar y ajustar las regresiones de nivel 1 y 2, incluyendo `npm test` y `npm run typecheck`, en `src/application/analizarCartola.test.ts`, `src/infrastructure/input.test.ts` y las pruebas nuevas de nivel 2.
- [X] T048 [P] Medir el ejemplo contra el presupuesto de 50.000 nodos y el objetivo de menos de 2 s, registrando el resultado real y límites de medición en `specs/002-propuestas-costo-meta/quickstart.md`.
- [X] T049 Validar manualmente carga, foco de teclado, tablas anchas, escritorio y móvil estrecho según `specs/002-propuestas-costo-meta/quickstart.md`, y registrar evidencia o pendientes en `specs/002-propuestas-costo-meta/quickstart.md`.
- [X] T050 Actualizar documentación solo con comportamiento implementado y verificado, incluyendo comandos, alcance, supuestos y archivos de ejemplo en `README.md`, `ARCHITECTURE.md`, `DESIGN.md` y `AGENTS.md`.
- [X] T051 Ejecutar `npm run build` y verificar que la publicación prevista contiene únicamente `dist/`, documentando el resultado en `specs/002-propuestas-costo-meta/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no depende de fases anteriores.
- **Foundational (Phase 2)**: depende de Setup y bloquea las historias.
- **US1 y US2 (Phases 3–4)**: pueden comenzar en paralelo tras Phase 2; comparten contratos, pero no requieren la interfaz de la otra historia.
- **US3 (Phase 5)**: depende de los resultados de propuesta de US1 y US2 para proyectar ambas modalidades.
- **Polish (Phase 6)**: depende de las historias que se decida entregar; T049–T051 requieren US3 para validar el alcance completo.

### User Story Dependencies

- **US1 (P1)**: comienza después de T001–T014; no depende de US2.
- **US2 (P1)**: comienza después de T001–T014; no depende de US1.
- **US3 (P2)**: comienza después de US1 y US2, porque proyecta sus composiciones ya elegidas.

### Within Each User Story

- Las pruebas de cada historia se escriben y fallan antes de la implementación que las satisface.
- El motor de dominio precede al caso de uso; el caso de uso precede al worker y a la vista.
- La vista solo presenta datos: no replica cálculos ni reglas financieras.

### Parallel Opportunities

- T001 y T002 pueden ejecutarse a la vez; T005/T006 y T008/T009 también, en archivos distintos.
- Tras Phase 2, un equipo puede implementar US1 y US2 en paralelo.
- En cada historia, las tareas que usan archivos distintos —por ejemplo T020 y T022 en US1, o T031 y T033 en US2— pueden dividirse antes de editar el módulo de implementación.
- T047 y T048 son independientes después de completar las historias; T049–T051 se ejecutan en secuencia de validación final.

## Parallel Example: User Story 1

```text
Task: "T020 — Caso de uso de costo en src/application/proponerCostos.test.ts"
Task: "T022 — Vista de costo en src/presentation/ProposalView.tsx"
```

Una vez que las pruebas están asentadas, otra persona puede preparar `src/presentation/ProposalView.tsx` (T022) mientras se implementa el motor T018, siempre que la vista consuma solo el contrato de T004.

## Parallel Example: User Story 2

```text
Task: "T031 — Caso de uso de meta en src/application/proponerMeta.test.ts"
Task: "T033 — Vista de meta en src/presentation/GoalView.tsx"
```

## Implementation Strategy

### MVP First (US1)

1. Completar Setup y Foundational.
2. Completar T015–T024.
3. Ejecutar la prueba independiente de US1 con cuatro JSON y validar que la propuesta baja el costo sin elevar riesgo.
4. Demostrar US1 sin requerir carga de `meta.json`.

### Incremental Delivery

1. Foundation lista → contratos y restricciones verificadas.
2. US1 → propuesta de costo verificable.
3. US2 → calce y brecha de meta verificables.
4. US3 → proyecciones y escenarios transparentes.
5. Polish → regresión, accesibilidad, rendimiento, build y documentación basada en evidencia.

## Notes

- Las alternativas se limitan a acuerdos vigentes; la salida debe declarar que pueden existir opciones fuera de ese universo y que una persona revisa y decide antes de ejecutar.
- La búsqueda comunica resultados encontrados y el consumo de nodos; no declara optimalidad ni inviabilidad global si alcanza el límite.
- Ninguna tarea autoriza red, servidor, base de datos, publicación ni ejecución de operaciones financieras.

## Phase 7: Convergence

**Purpose**: Cerrar las brechas encontradas entre la implementación actual y los contratos de nivel 2. Estas tareas no sustituyen ni modifican las fases previas.

- [X] T052 CRÍTICA: Implementar `src/domain/proposalValidation.ts` y conectarlo a ambas propuestas para verificar con Decimal capital completo/no asignable, concentración consolidada por fondo y AGF, perfil, liquidez, categorías y acceso final; eliminar el límite fijo de 700 UF. (FR-003/FR-004/FR-012a/FR-013/Constitución III — contradicts)
- [X] T053 CRÍTICA: Reemplazar en `src/domain/goalProposal.ts` la selección codificada de T4 por una búsqueda determinista de soportes y tickets consolidados que calcule VP con las categorías realmente financiadas, reservas cronológicas, excedente al tramo largo y déficit/pagos parciales sin elevar riesgo. (FR-010–FR-015a/US2 — contradicts)
- [X] T054 Completar `src/domain/projection.ts` para proyectar reservas e instrumentos por intervalo, liquidar pagos en fecha con liquidez, transferir solo excedentes liberados, informar primer pago pendiente/agotamiento real y conservar composición entre los tres escenarios. (FR-006/FR-016/FR-017 — partial)
- [X] T055 Completar validación estructural y semántica de cinco archivos en `src/infrastructure/input.ts` y dominio: tramos continuos, categorías/perfil/escenarios exactos, fechas y UF cruzadas, retornos negativos y rutas legibles de error. (FR-001/FR-002/FR-009 — partial)
- [X] T056 Implementar un Web Worker local real en `src/infrastructure/proposalWorker.ts` y conectarlo en `src/presentation/App.tsx` con revisiones, cancelación, última respuesta válida, errores recuperables y estado de búsqueda no bloqueante. (plan paso 6/FR-021 — partial)
- [X] T057 Completar `ProposalView.tsx` y `GoalView.tsx` con concentraciones, acceso por lote/ticket, restricciones, tareas condicionales, capital no asignable, pagos pendientes por fila, fuente/fecha y etiqueta «supuesto» en cada cifra dependiente. (FR-008/FR-018/SC-005 — partial)
- [ ] T058 Crear y aprobar la matriz de pruebas de contratos, oráculos numéricos, invariantes, déficit/cobertura, búsqueda límite, worker y accesibilidad indicada en T006, T009, T012, T014–T017, T020, T024–T028, T031, T035–T039 y T045–T046. (Constitución II/tareas de pruebas — missing)
- [X] T059 Medir rendimiento contra 50.000 nodos, realizar revisión manual en escritorio/móvil/teclado y completar documentación únicamente con resultados comprobados en quickstart, README, ARCHITECTURE, DESIGN y AGENTS. (SC-008/plan paso 7/T048–T051 — missing)

## Phase 8: Convergence — reglas operativas del test Varenne

**Purpose**: Convertir R03, R06 y R07 del test técnico original en criterios ejecutables, sin adelantar controles ni documentos propios de Nivel 3.

- [X] T060 CRÍTICA: Hacer que `costProposal.ts` enumere y verifique candidatos por el orden R07 —volatilidad no mayor, menor TAC, concentración— preservando categoría salvo reparación justificada; registrar por cada cambio si fue serie, equivalente o reparación, acceso R04 y motivo de descarte. (test Varenne R07/FR-003–FR-005 — contradicts)
- [X] T061 CRÍTICA: Hacer que `goalProposal.ts` asigne cada desembolso por fecha a un tramo `[desde_meses, hasta_meses)`, pruebe categorías en el orden declarado, serie elegible de menor TAC y liquidez compatible; calcular VP con el soporte efectivo, aplicar excedente al tramo más largo y declarar déficit/pago parcial cronológico. (test Varenne R06/FR-009–FR-015 — contradicts)
- [X] T062 CRÍTICA: Validar antes de emitir una propuesta de meta los máximos declarados por fondo y AGF, el peso de crecimiento y el tope reducido por primer pago; si una restricción impide financiar un pago, mantenerla y exponer importe pendiente/restricción en vez de crear una asignación ficticia. (test Varenne R06/FR-012a–FR-015/Constitución III — contradicts)
- [X] T063 Completar `projection.ts` y sus contratos para que `saldo_medio`, costo acumulado y retorno neto se calculen por intervalo sin doble descuento de TAC; etiquetar cada salida derivada como «supuesto» con fuente y fecha, sin presentarla como historia o promesa. (test Varenne R03/FR-006–FR-008 — partial)
- [X] T064 Fijar como invariante que adverso, base y favorable usan exactamente la misma composición, elegibilidad, límites y política de retiros, y que solo cambian −1,5/0/+1,5 pp del retorno bruto; cubrir cobertura por UF, fecha de agotamiento y saldo final. (test Varenne R06/FR-016–FR-017 — partial)
- [ ] T065 Añadir pruebas de aceptación con los resultados de ejemplo de Varenne: costo/riesgo/concentración R07, ocho pagos y VP R06, y tres escenarios R03; probar además que no se implementan controles de documento, hash, PDF o bloqueos R08–R12 en Nivel 2. (test Varenne Nivel 2/plan alcance — missing)

## Correcciones de la revisión del 2026-10-25

- [X] T066 Incluir efectivo y depósitos como destinos de reparación de costo; probar cada tipo sin series ni acuerdos, con capital conservado, menor costo y riesgo no mayor.
- [X] T067 Reemplazar la evidencia de acceso con ticket cero por decisiones identificadas por lote o tramos; comprobar otras series al mismo ticket, consolidación de meta y retención fuera de acuerdos.
- [X] T068 Restaurar la declaración completa de universo y el monto/porcentaje sin identificar; conservar el detalle de exclusiones sin repetirlo como advertencias libres.
- [X] T069 Separar cambios de tenencias conservadas y priorizar conclusión, pendiente y escenarios de meta; conservar VP, concentración y trazabilidad consultables, con etiquetas españolas y sin campos idénticos repetidos.
- [X] T070 Ejecutar regresiones, tipos, compilación, React Doctor y revisión de escritorio, móvil y teclado; actualizar spec, contratos, modelo y decisiones con el comportamiento comprobado.

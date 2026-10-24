---

description: "Tareas para completar R04: patrimonio agregado válido al corte"
---

# Tasks: Nivel 1 — patrimonio agregado al corte

**Input**: Documentos de diseño en `specs/001-diagnostico-cambio-serie/`.
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`.

**Alcance**: Completar FR-012, FR-013 y SC-010 sin rehacer el Nivel 1 ya construido. Se conservan los tres JSON, las cuatro capas, los datos ficticios y las fórmulas actuales. Las pruebas son obligatorias por la constitución y la especificación.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo tras completar sus dependencias.
- **[US#]**: Historia de usuario trazable en `spec.md`.
- Cada tarea indica el archivo exacto que modifica o valida.

## Phase 1: Setup (línea base compartida)

**Purpose**: Asegurar una línea base reproducible sin introducir infraestructura ni dependencias nuevas.

- [X] T001 Confirmar que `package.json` y `package-lock.json` no requieren dependencias nuevas y ejecutar la línea base indicada en `specs/001-diagnostico-cambio-serie/quickstart.md`.

---

## Phase 2: Foundational (contrato compartido)

**Purpose**: Exponer el corte en la evidencia y versionar la semántica antes de cambiar R04.

**⚠️ CRITICAL**: Completar esta fase antes de modificar acceso, resultados o presentación.

- [X] T002 Extender `Acceso.evidencia` con `corte: string` y admitir `versionReglas: 'nivel-1.1'` en `src/domain/model.ts`, sin modificar el contrato de entrada JSON.
- [X] T003 Actualizar el resultado emitido por `analizarCartola` a `versionReglas: 'nivel-1.1'` en `src/application/analizarCartola.ts`.

**Checkpoint**: El motor puede portar el corte explícito sin depender del reloj, de red ni de datos nuevos.

---

## Phase 3: User Story 1 — Entender el costo de la cartola (Priority: P1)

**Goal**: Probar que la corrección temporal no altera diagnóstico, montos, TAC ni costo de la cartola.

**Independent Test**: Con los acuerdos Alfa fechados después del corte, el diagnóstico conserva 230.000.000 CLP computables, 5.180.000 CLP de costo y TAC 2,2522 %.

### Tests for User Story 1

- [X] T004 [US1] Añadir una regresión que cambie sólo `patrimonio_al` a una fecha posterior y preserve diagnóstico, costo, TAC y posiciones en `src/application/analizarCartola.test.ts`.

**Checkpoint**: US1 sigue siendo verificable con el ejemplo y no depende de la elegibilidad.

---

## Phase 4: User Story 2 — Explicar qué series puede usar cada posición (Priority: P2) 🎯 MVP

**Goal**: Aplicar la fecha del patrimonio sólo al llegar a agregación, respetar la primera coincidencia de R04 y explicar la decisión con evidencia completa.

**Independent Test**: Con corte `2026-09-30`, ticket de 60 M y patrimonio Alfa 180 M al `2026-10-01`, B queda elegible por regla 6 y F bloqueada por regla 5 con motivo temporal, monto, fecha y corte visibles.

### Tests for User Story 2

- [X] T005 [P] [US2] Añadir en `src/infrastructure/input.test.ts` casos donde una fecha futura bien formada se acepta y una fecha ausente o imposible se rechaza por el campo de entrada correspondiente.
- [X] T006 [P] [US2] Añadir en `src/application/analizarCartola.test.ts` la matriz R04: fecha anterior/igual, posterior, ticket igual o mayor al mínimo, monto insuficiente, agregado igual al mínimo y el caso mixto Alfa B/F.
- [X] T007 [P] [US2] Añadir en `src/presentation/tables.test.tsx` expectativas para corte, patrimonio declarado, motivo temporal de regla 5 y la persistencia de regla 3 en el detalle de acceso.

### Implementation for User Story 2

- [X] T008 [US2] Implementar en `src/domain/eligibility.ts` la secuencia R04: conservar reglas 0–3; si el ticket alcanza el mínimo, regla 6; si no, usar regla 4 sólo con `patrimonio_al <= corte` y agregado suficiente; en los demás casos usar regla 5 con motivo temporal o monetario fiel.
- [X] T009 [US2] Completar en `src/domain/eligibility.ts` la evidencia con el corte de la cartola y actualizar `tareasCondicionales` para que regla 3 pida mandato, patrimonio suficiente al corte o ticket suficiente, confirmación escrita y reevaluación, sin cambiar el estado 3.
- [X] T010 [US2] Mostrar el corte junto al patrimonio, fecha, regla y motivo emitidos por el motor en `src/presentation/PositionDetail.tsx`, sin comparar fechas ni decidir acceso en React.
- [X] T011 [US2] Corregir la explicación de R04 en `src/presentation/App.tsx` para indicar que la agregación exige patrimonio suficiente con fecha anterior o igual al corte.

**Checkpoint**: Todas las alternativas de acceso se clasifican independientemente; un patrimonio futuro no invalida el archivo, el acuerdo ni las series que no lo requieren.

---

## Phase 5: User Story 3 — Comparar ahorro elegible y ahorro condicionado (Priority: P3)

**Goal**: Evitar que una serie bloqueada por fecha futura se convierta en ahorro, manteniendo las condicionales por mandato que sigan vigentes.

**Independent Test**: Con Alfa futuro, F no aparece como elegible ni condicional; M de Deuda UF conserva regla 3 y el ahorro condicional total es 270.000 CLP, mientras el elegible sigue en 1.650.000 CLP.

### Tests for User Story 3

- [X] T012 [US3] Añadir en `src/application/analizarCartola.test.ts` la regresión de R05 para excluir F bloqueada de oportunidades, conservar M por mandato y preservar el ahorro elegible, comisiones y determinismo.

### Implementation for User Story 3

- [X] T013 [US3] Revisar y, sólo si lo exige la regresión, ajustar el filtrado de estados en `src/domain/diagnosis.ts` para que R05 use exclusivamente alternativas `eligible` o `conditional` emitidas por R04, sin cálculos temporales duplicados.

**Checkpoint**: El ahorro condicional permanece separado y ninguna serie bloqueada se presenta como destino u oportunidad.

---

## Phase 6: User Story 4 — Repetir y revisar el análisis con datos distintos (Priority: P3)

**Goal**: Garantizar que cargas válidas con patrimonio futuro se recalculan desde cero y que el resultado corregido es auditable en pantalla.

**Independent Test**: Alternar acuerdos originales y una copia con Alfa al `2026-10-01`; cada análisis muestra sólo sus estados y cifras, conserva el contrato de importación y expone `nivel-1.1`.

### Tests for User Story 4

- [X] T014 [US4] Añadir en `src/application/analizarCartola.test.ts` una prueba de cargas consecutivas original/futura/original que compruebe estados, `versionReglas: 'nivel-1.1'` y ausencia de resultados mezclados.

### Implementation for User Story 4

- [X] T015 [US4] Confirmar en `src/infrastructure/input.ts` que no se introduce una restricción global `patrimonio_al > corte`; conservar la validación estructural de fechas y documentar cualquier cambio mínimo requerido con pruebas en `src/infrastructure/input.test.ts`.

**Checkpoint**: La importación acepta fechas futuras válidas, rechaza fechas inválidas y una nueva carga sustituye por completo el análisis visible.

---

## Phase 7: Polish & cross-cutting verification

**Purpose**: Sincronizar la evidencia documental y validar el cambio completo en tipos, compilación y navegador.

- [X] T016 [P] Actualizar la versión de reglas, R04 temporal, límites y comandos de verificación en `SPEC.md`, `README.md` y `docs/revision-tablas-nivel-1.md`.
- [X] T017 Ejecutar `npm test`, `npm run typecheck` y `npm run build` desde `package.json`; registrar resultados reales y cualquier limitación en `docs/revision-tablas-nivel-1.md`.
- [X] T018 Validar el flujo de `specs/001-diagnostico-cambio-serie/quickstart.md` en escritorio y a 390 px, comprobando motivo, evidencia, foco y desplazamiento de tablas; añadir capturas y resultado en `docs/revision-tablas-nivel-1.md`.

---

## Dependencies & Execution Order

```text
T001 → T002 → T003
T002 → T005, T006, T007
T003 + T005 + T006 + T007 → T008 → T009 → T010 + T011
T008 + T009 → T012 → T013
T003 + T008 → T014 → T015
T010 + T011 + T013 + T015 → T016 → T017 → T018
```

### User Story Dependencies

- **US1 (P1)** puede verificarse desde la línea base; sólo comprueba que R04 no alteró R02.
- **US2 (P2)** depende del contrato compartido de la fase 2 y es el MVP funcional.
- **US3 (P3)** depende de los estados R04 producidos por US2.
- **US4 (P3)** depende de la versión y de la evaluación temporal de US2; puede validar importación y recarga en paralelo con US3 después de T008.

## Parallel Opportunities

- Tras T002, T005, T006 y T007 modifican archivos de prueba distintos y pueden ejecutarse en paralelo.
- Tras T008, T010 y T011 modifican archivos de presentación distintos; T012 prepara la regresión R05 mientras se integran los cambios de acceso.
- T014/T015 (recarga e importación) no comparten archivos con T010/T011/T013.
- T016 puede preparar la documentación mientras se completa la validación manual, pero debe reflejar resultados reales después de T017/T018.

## Implementation Strategy

1. Completar T001–T003 y fijar el contrato mínimo de salida.
2. Escribir T005–T007 y ejecutar T006 contra la implementación actual para demostrar el fallo temporal.
3. Implementar T008–T011 y completar US2; éste es el MVP y debe pasar la matriz SC-010 antes de continuar.
4. Añadir T012–T015 para demostrar que R05 y las cargas sucesivas consumen el estado correcto, sin reimplementar R04 fuera del dominio.
5. Cerrar con documentación, suite, tipos, compilación y revisión visual. SC-005 (medición con asesores) y SC-009 (entrega pública) permanecen fuera de estas tareas locales.

## Notes

- No modificar `data/cartola.json`, `data/catalogo.json`, `data/acuerdos.json` ni `test-motor-de-propuestas.html`; usar copias locales para variantes.
- La comparación fecha a fecha usa sólo fechas civiles AAAA-MM-DD ya validadas, con límite inclusivo: `patrimonio_al <= corte`.
- R04 conserva primera coincidencia. No añadir bandera global por AGF, estado nuevo ni dependencia de red.

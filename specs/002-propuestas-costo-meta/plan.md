# Plan de implementación: propuestas de costo y meta — Nivel 2

**Rama de corrección**: `fix/nivel-2-auditoria` | **Actualizado**: 2026-10-25 | **Especificación**: [spec.md](spec.md)

**Input**: `specs/002-propuestas-costo-meta/spec.md`, incluidas las cinco aclaraciones aprobadas.
**Identificador**: `002-propuestas-costo-meta`.
**Estado**: Implementado y corregido. La verificación local vigente se registra en [Corrección y aceptación de nivel 2](../../docs/correccion-nivel-2.md). Las secciones «Fase 0», «Fase 1» y «Verificación durante el plan» son antecedentes de diseño; no describen tareas pendientes ni el estado actual de la entrega. La publicación sigue siendo un paso aparte.

## Summary

Ampliar la aplicación existente con propuestas de costo entre fondos equivalentes (R07), metas por plazo (R06) y proyecciones/costos acumulados rotulados como supuestos (R03). Reutilizar R01/R02/R04/R05 y conservar el diagnóstico. Aplicar las cinco decisiones aprobadas: preservar categorías salvo necesidad de perfil/concentración; financiar pagos cronológicamente; cobertura por monto UF; conclusión de meta por base neta; ticket final de meta consolidado por fondo/serie entre tramos.

Dos casos de uso puros coordinan selección, riesgo y proyección. Una búsqueda determinista acotada genera candidatos; un verificador decimal independiente acepta solo carteras admisibles. No afirmar mínimo global ni inviabilidad sin evidencia suficiente. La interfaz consume resultados compartidos y usa un worker local para mantener la interacción disponible durante la búsqueda.

## Technical Context

**Language/Version**: TypeScript 7.0.2 estricto, destino ES2022; versiones instaladas de package-lock.json.
**Primary Dependencies**: React 19.3.1, Vite 8.3.5, Zod 4.6.7, decimal.js 10.6.0; Tailwind y Lucide existentes. Sin nuevas dependencias; solver externo evaluado y descartado en investigación R4.
**Storage**: JSON locales y memoria; sin servidor, base de datos ni persistencia.
**Testing**: Vitest 5.0.5 para motor/importación/contratos/HTML; navegador para carga, worker, escritorio/móvil/teclado.
**Target Platform**: Navegador moderno, build estático y worker local; publicar exclusivamente dist cuando se autorice esa entrega.
**Project Type**: Aplicación web de dominio, aplicación, infraestructura y presentación.
**Performance Goals**: Objetivo de ingeniería: menos de 2 s en un escritorio de referencia. Las mediciones realizadas y sus límites se conservan en el registro de aceptación. Mantener UI disponible con worker. Presupuesto fijo de 50.000 nodos por modalidad; informar si se agota, sin usar timeout de reloj para decidir resultados.
**Constraints**: Funciones puras, decimal privado de 40 dígitos, sin red/reloj/azar implícitos. Comisión fuera de objetivos, riesgo no mayor en costo y brecha sin sobrepasar perfil en meta. ACT/365,25 y meses calendario. No PDF, firma, huella, historia ni controles completos de nivel 3.
**Scale/Scope**: Conservar 5 MB/archivo, 10.000 posiciones, 1.000 productos/emisores/acuerdos y 100 series/producto. Nuevos límites: 1.000 pagos, 100 tramos, nueve categorías originales, 100 perfiles y 9 categorías/tramo. Una cartera/meta por ejecución; presupuesto global de 50.000 nodos incluyendo soportes, sin reiniciarlo; conjuntos grandes pueden alcanzarlo sin que eso pruebe inviabilidad.

## Constitution Check

| Principio | Base antes de fase 0 | Diseño previsto tras fase 1 |
| --- | --- | --- |
| I. Reglas y alcance | PASS: R03/R06/R07 y decisiones aprobadas; base automatizada nivel 1 vigente. | PASS: contratos y aceptación trazados. |
| II. Pureza y determinismo | PASS: reutilizar precisión/acceso; desconocidos sin riesgo inventado. | PASS: tickets decimales, fechas explícitas, búsqueda sin reloj y TAC descontada una vez. |
| III. Elegibilidad y cliente | PASS: destinos elegibles, comisión independiente. | PASS: ticket final, agregados fondo/AGF, riesgo comparable, perfil y déficit. |
| IV. Evidencia y honestidad | PASS: supuestos sin historia ni promesa. | PASS: VP separado de pendiente neto, fuentes no informadas explícitas y límites de búsqueda visibles. |
| V. Simplicidad local | PASS: mismo stack y capas; archivos de referencia locales. | PASS: sin dependencias ni servidor nuevos; worker como adaptador. |

Sin excepción constitucional. El TODO de ratificación de la constitución sigue siendo un asunto previo de gobernanza, no resuelto aquí. La aceptación de usabilidad con asesores y entrega pública del nivel 1 no se acreditan con pruebas locales. El diseño de nivel 2 no anuncia esas aceptaciones ni reemplaza su verificación.

## Project Structure

### Documentation (this feature)

```text
specs/002-propuestas-costo-meta/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── entradas.md
│   └── propuestas.md
└── checklists/requirements.md
```

El seguimiento de tareas se conserva en [tasks.md](tasks.md). Los requisitos del producto están en `spec.md`; las entradas y cifras concretas de validación están en `quickstart.md` y los archivos de prueba.

### Source Code (repository root)

```text
src/domain/
  model.ts, diagnosis.ts, numeric.ts, eligibility.ts, validation.ts
  proposalModel.ts       # Nuevo contrato nivel 2
  proposalValidation.ts  # Relaciones e invariantes nuevas
  proposalSearch.ts      # Presupuesto de búsqueda y utilidades compartidas
  risk.ts                # Riesgo, crecimiento y concentración
  costProposal.ts        # R07 y búsqueda
  goalProposal.ts        # R06, soportes, VP y reservas
  projection.ts          # R03, flujos y escenarios
src/application/
  analizarCartola.ts      # Contrato conservado
  proponerCostos.ts       # Nuevo caso de uso
  proponerMeta.ts         # Nuevo caso de uso
src/infrastructure/
  input.ts               # Ampliación a cinco clases de archivo
  proposalWorker.ts      # Adaptador local sin reglas financieras
  proposal.worker.ts     # Ejecución local de casos de uso
src/presentation/
  App.tsx, DataPanel.tsx, InputReview.tsx, Navigation.tsx, format.ts
  ProposalView.tsx       # Resumen/cambios sin cálculos financieros
  GoalView.tsx           # Tramos/pagos/escenarios
  useAppWorkflow.ts     # Revisiones, cancelación y estados de pantalla
data/
  cartola.json, catalogo.json, acuerdos.json
  supuestos.json         # Entrada de prueba para nivel 2
  meta.json              # Entrada de prueba para metas
```

**Estructura**: Los módulos indicados forman parte de la implementación local. Las pruebas se mantienen junto a los módulos afectados. Se conservan las cuatro capas y la separación entre cálculos financieros, adaptación al navegador y presentación. El acceso admite tickets decimales sin convertirlos a números de precisión inferior.

## Phase 0 — Investigación resuelta

[research.md](research.md), R1–R12, resuelve compatibilidad, riesgo, búsqueda, ticket final, fechas, dependencia VP/selección, trayectoria neta, retiros, brechas y validación. Codebase Memory orientó estructura y cobertura; fuentes cambiadas se leyeron directamente. Tres agentes revisaron costo, proyección y contratos por separado. Karpathy orientó cambios mínimos y aceptación por invariantes; ECC contract-first fijó la autoridad de tipos compartidos. No se ejecutan pipelines de implementación durante Plan.

## Phase 1 — Diseño y secuencia prevista

1. Fijar [entradas](contracts/entradas.md), [resultados](contracts/propuestas.md) y [modelo](data-model.md). Incorporar los dos JSON originales al implementar; metadatos nuevos opcionales. Validar por modalidad.
2. Añadir riesgo/crecimiento/concentración y verificador final decimal. Reutilizar R04 con ticket final y distinguir retención de nueva inversión.
3. Implementar costo: series, equivalentes, repartos y reparación necesaria de perfil/concentración. Registrar búsqueda y sus límites; no usar retorno ni comisión para seleccionar.
4. Implementar meta: meses/tramos, categorías efectivas y VP coherente, reservas cronológicas, excedente al tramo ocupado más largo y ticket consolidado. Declarar capital no asignable sin crear destinos fuera de reglas.
5. Implementar proyección por instrumento/intervalo, TAC única, pagos y excedentes liberados. Tres escenarios con mismas decisiones iniciales; distinguir VP, pendiente base, primer pago pendiente y agotamiento real.
6. Conectar carga, worker y vistas con revisión de operación, errores por archivo, foco y tablas accesibles; tokens DESIGN.md y prefijo ts-.
7. Ejecutar [quickstart.md](quickstart.md): regresión, contratos, oráculos, invariantes y navegador. Sincronizar README/SPEC/AGENTS con lo implementado y verificado. La publicación es un paso aparte.

## Trazabilidad y aceptación

| Requisito | Diseño/verificación |
| --- | --- |
| FR-001/002 | Compatibilidad nivel 1; cuatro/cinco archivos; acceso final y referencias |
| FR-003–005 | Costo de ejemplo, misma volatilidad/base, categoría preservada, reparación y búsqueda incompleta |
| FR-006–008 | Oráculo de intervalo, TAC única, fuentes/etiquetas y tasas con signo |
| FR-009–012a | Fronteras calendario, soporte/VP coherentes, cronología y ticket final consolidado |
| FR-013–015a | Agregados fondo/AGF, tope reducido, no asignable, VP suficiente y pendiente base |
| FR-016/017 | Tres escenarios, cobertura parcial UF, plan inicial y política iguales |
| FR-018–021 | Contrato serializable, exclusiones, determinismo, nuevas cargas y accesibilidad |

Las cifras de quickstart son referencias de validación, no respuestas codificadas. El motor calcula la cobertura base neta y la muestra por separado del VP. Una mejora verificada no acredita por sí sola un óptimo global.

## Evidencia de planificación y verificación vigente

- Como base del plan: 121 pruebas en tres archivos y `npm run typecheck` aprobados para nivel 1.
- Como verificación vigente: 181 pruebas en 14 archivos, `npm run build`, revisión de escritorio, móvil y teclado y React Doctor sin hallazgos. El detalle, los límites de tiempo y las condiciones de la revisión están en [Corrección y aceptación de nivel 2](../../docs/correccion-nivel-2.md).
- La revisión de secciones, enlaces locales y convenciones se mantiene como evidencia documental del diseño.
- No existe `.specify/extensions.yml`; no hay hooks previos ni posteriores que ejecutar.

## Complexity Tracking

Sin violaciones que justificar. El worker mantiene la interacción disponible; las funciones financieras siguen puras y compartidas. Sin optimizador externo ni generación de contratos. Las limitaciones algorítmicas de R4 forman parte de la salida observable.

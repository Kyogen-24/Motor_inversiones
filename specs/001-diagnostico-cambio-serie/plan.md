# Implementation Plan: Nivel 1 — patrimonio agregado al corte

**Branch**: `main` | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-diagnostico-cambio-serie/spec.md`.
**Feature ID**: `001-diagnostico-cambio-serie` (identificador devuelto por setup; rama Git real: `main`).
**Estado**: Diseño terminado; implementación temporal pendiente.

## Summary

Mantener el Nivel 1 existente y completar FR-012/FR-013 y SC-010. La comprobación
`patrimonio_al <= corte` pertenece a R04, después de las reglas 0 a 3 y solo cuando el
ticket individual no alcanza el mínimo. Patrimonio futuro no acredita agregación:
corresponde regla 5 con motivo temporal, sin rechazar globalmente archivos ni acuerdos.

Reutilizar motor puro y tablas actuales. Añadir corte a la evidencia de acceso, ajustar
tareas de mandato y representar motivo/fechas sin cálculos de acceso en React.
El ejemplo original conserva sus cifras; las variantes se verifican por comportamiento.

## Technical Context

**Language/Version**: TypeScript 7, modo estricto, destino ES2022.
**Primary Dependencies**: Stack instalado: React 19, Vite 8, Zod 4, decimal.js 10,
Tailwind 4 y Lucide React. Sin dependencias nuevas; versiones en `package-lock.json`.
**Storage**: JSON seleccionados manualmente y estado en memoria; sin persistencia.
**Testing**: Vitest 5 para motor/importación y HTML con react-dom/server;
navegador para carga, evidencias y accesibilidad.
**Target Platform**: Navegador moderno, escritorio y móvil; sitio estático en Pages.
**Project Type**: Aplicación web con dominio, aplicación, infraestructura y presentación.
**Performance Goals**: Comprobación temporal constante por alternativa que necesite
agregación; sin consultas de red ni recorridos globales adicionales. No se introduce
un objetivo de latencia que la especificación no establece.
**Constraints**: Fechas civiles válidas AAAA-MM-DD, 1900–2200; corte explícito inclusivo,
sin reloj del equipo. Mantener precisión decimal, primera coincidencia, independencia
de comisiones y textos españoles. Sin antigüedad máxima nueva para el patrimonio.
**Scale/Scope**: Límites actuales: 5 MB por archivo, 10.000 posiciones, 1.000
productos/emisores/acuerdos y 100 series por producto. Ajuste de acceso, evidencia y pruebas.

## Constitution Check

| Principio | Antes de investigación | Después del diseño |
| --- | --- | --- |
| I. Reglas explícitas | PASS: FR-012/013 y SC-010 autorizan la aclaración. | PASS: contrato y escenarios trazados; sin nuevos niveles. |
| II. Motor puro y determinista | PASS: corte y montos explícitos. | PASS: fechas civiles, pruebas de repetición y referencia; evidencia versionada. |
| III. Elegibilidad y cliente | PASS: preservar orden R04. | PASS: descarte por alternativa; comisiones independientes. |
| IV. Evidencia y honestidad | PASS: no acreditar el patrimonio futuro. | PASS: conservar dato declarado y mostrar corte/motivo; tareas pendientes explícitas. |
| V. Simplicidad y ejecución local | PASS: reutilizar la aplicación. | PASS: sin red, backend, credenciales, nuevas dependencias ni campos de entrada. |

Las instrucciones posteriores del usuario sobre etiquetas, interfaz y repositorio privado
siguen registradas en la especificación; este ajuste no cambia esas decisiones. SC-005
sigue pendiente de medición real y SC-009 de entrega pública: no se acreditan con pruebas locales.

## Project Structure

### Documentation (this feature)

```text
specs/001-diagnostico-cambio-serie/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/entrada-y-acceso.md
└── checklists/requirements.md
```

`tasks.md` será generado por `$speckit-tasks` después de este diseño.

### Source Code (repository root)

```text
src/domain/model.ts                         # Corte en evidencia y versión de reglas
src/domain/eligibility.ts                   # R04 y tareas condicionales
src/domain/diagnosis.ts                     # Consumidor existente; preservar selección R05
src/domain/validation.ts                    # Preservar validación de datos y relaciones
src/application/analizarCartola.ts          # Mantener totales; actualizar versión de reglas
src/application/analizarCartola.test.ts     # Matriz temporal y regresión financiera
src/infrastructure/input.ts                # JSON existente, sin restricción temporal global
src/infrastructure/input.test.ts            # Fecha futura válida; imposible rechazada
src/presentation/PositionDetail.tsx         # Corte junto a patrimonio, fecha y motivo
src/presentation/App.tsx                    # Texto de reglas coherente con R04
src/presentation/tables.test.tsx            # Evidencia renderizada y condicionales
data/                                      # Originales ficticios sin modificaciones
```

**Structure Decision**: Mantener las cuatro capas. Dominio decide acceso y tareas;
aplicación coordina; infraestructura valida formato; presentación consume resultados.
Los consumidores e invariantes enumerados se verifican sin exigir modificarlos.
README, SPEC y documentación de validación se sincronizan al implementar. No se cambia
el prototipo original ni el despliegue.

## Diseño y secuencia de implementación

1. Reproducir US2/AC6–AC10 y US3/AC6 con variantes de los datos actuales. Conservar
   las pruebas del ejemplo, mínimos, prioridad, comisiones y determinismo.
2. Mantener reglas 0–3. Si el ticket alcanza el mínimo, aplicar 6. Si no, comprobar
   fecha y monto: regla 4 solo si ambos sirven; en otro caso 5. Distinguir fecha
   posterior de monto insuficiente sin describir falsamente el importe.
3. Añadir `Acceso.evidencia.corte`. Conservar firmas de `evaluarAcceso` y
   `tareasCondicionales`. Esta última usa el corte de la evidencia para pedir acreditación
   al corte o ticket suficiente, sin reemplazar estado 3 al preparar tareas.
4. Actualizar `versionReglas` a `nivel-1.1` en tipo y resultado para distinguir la nueva
   semántica; sin historial ni migraciones. R05 sigue filtrando por estado: F bloqueada
   no puede ser oportunidad; M de regla 3 puede subsistir como condicional.
5. Mostrar corte en el detalle y ajustar R04 en «Cómo se calcula». Probar HTML,
   carga manual, móvil/teclado y documentar evidencia.

## Cobertura y aceptación

| Obligación | Comprobación prevista |
| --- | --- |
| FR-001–003, FR-011, FR-021 | Carga/normalización preservadas; fecha futura aceptada, imposible rechazada; recuperación. |
| FR-004–007, FR-015, FR-017 | Diagnóstico, exclusiones, denominador, Gamma y cifras originales intactos. |
| FR-008–010, FR-012/013, SC-010 | Prioridad, fecha anterior/igual/posterior, mínimos, aislamiento B/F y tareas de mandato. |
| FR-014–018, US3/AC6 | Excluir bloqueadas de ahorro; preservar regla 3, comisiones y empates. |
| FR-019/020, SC-006/008 | Dato/corte/motivo en español, escritorio/móvil/teclado, sin cálculo de acceso en UI. |
| FR-022–024, SC-001–004/007 | Suite completa, tipos, compilación estática y documentación. |
| SC-005, SC-009 | Pendientes externos; no publicar ni coordinar asesores como parte de este ajuste. |

Original: 5.180.000 de costo, 1.650.000 elegibles, 3.530.000 posteriores y 615.000
condicionales. Si solo Alfa pasa a patrimonio futuro, se conservan costos y ahorro
elegible; el condicional total pasa a 270.000 por M de Deuda UF (regla 3), no a cero
ni a 615.000. Las F de ambas posiciones Alfa quedan bloqueadas. Ver [quickstart.md](quickstart.md).

## Complexity Tracking

Sin excepciones nuevas ni complejidad adicional que justificar. Investigación resuelta en
[research.md](research.md); modelos en [data-model.md](data-model.md), contrato en
[contracts/entrada-y-acceso.md](contracts/entrada-y-acceso.md). Revisión constitucional
posterior al diseño aprobada; lista la generación de tareas.

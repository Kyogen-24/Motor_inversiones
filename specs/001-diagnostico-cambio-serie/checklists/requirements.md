# Specification Quality Checklist: Diagnóstico y cambio de serie — Nivel 1

**Purpose**: Validar integridad y calidad de requisitos antes de planificación.
**Created**: 2026-10-22
**Updated**: 2026-10-24 — aclaración de patrimonio agregado al corte en R04.
**Feature**: [spec.md](../spec.md)
**Review Ownership**: Revisión de calidad de requisitos realizada durante `$speckit-specify`.
**Marker Semantics**: `[x]` indica calidad revisada, no implementación terminada.

## Content Quality

- [x] No se prescribe lenguaje, framework, arquitectura ni API de implementación.
- [x] El contenido se centra en el valor del diagnóstico, acceso y ahorro para el asesor.
- [x] Los escenarios están redactados para personas de negocio y explican términos y unidades.
- [x] Todas las secciones obligatorias de la plantilla activa están completas y en orden.

## Requirement Completeness

- [x] No quedan marcadores de aclaración pendientes.
- [x] Los requisitos son comprobables y tienen estados, fórmulas, límites y motivos concretos.
- [x] Los criterios de éxito contienen cifras o condiciones observables.
- [x] Los resultados de éxito no dependen de un stack ni diseño de implementación.
- [x] Los cuatro recorridos tienen escenarios de aceptación con condición, acción y resultado.
- [x] Se identifican límites de vigencia, mínimos, empates, exclusiones y errores de entrada.
- [x] El alcance se limita a nivel 1 y declara capacidades posteriores excluidas.
- [x] Se documentan dependencias y supuestos sobre formatos, precisión, fechas y datos.

## Feature Readiness

- [x] Los 24 requisitos funcionales tienen criterios de aceptación en escenarios, referencias,
  casos límite o resultados medibles.
- [x] Los recorridos cubren carga/diagnóstico, acceso, comparación y repetición con nuevos datos.
- [x] Los resultados definidos permiten verificar cifras, independencia de comisiones,
  coherencia de cargas, accesibilidad y entrega pública.
- [x] No se filtran decisiones de implementación en el alcance funcional.

## Notes

Revisión final: 16/16 criterios satisfechos; sin aclaraciones bloqueantes.

- Historias 1 a 4 y SC-001 a SC-010 cubren el flujo principal y resultados de negocio.
- FR-001 a FR-007: historia 1, casos límite y tabla de diagnóstico.
- FR-008 a FR-013: historia 2 y tabla ordenada de R04, incluida evidencia por alternativa.
- FR-014 a FR-018: historia 3 y tabla de ahorro; prueba de variación de comisiones.
- FR-019 a FR-022: historia 4, SC-004 a SC-008 y casos límite de cargas sucesivas.
- FR-023 y FR-024: SC-009 y condiciones de entrega.
- JSON, identificadores de datos, navegador y GitHub Pages son restricciones del enunciado
  o la constitución, no elecciones de lenguaje, librerías ni arquitectura de la solución.
- El anexo [context.md](../context.md) conserva nueve secciones de contexto, traza R01–R13
  y contiene los cinco conjuntos JSON completos. Coinciden entre HTML y Markdown.
- Se concretaron como supuestos revisables: JSON sin CSV, inicio estricto de acuerdo,
  tolerancia de valorización de 1 CLP, montos declarados como base y política de empates.
- Actualización de R04: FR-012, FR-013, US2/AC6–AC10, US3/AC6 y SC-010 especifican
  fecha anterior/igual/posterior al corte, ticket suficiente, preservación de reglas 0 a 3,
  aislamiento por serie y exclusión de oportunidades de ahorro de series bloqueadas.
- El caso mixto con ticket 60 M, mínimos B 5 M / F 100 M y patrimonio 180 M posterior
  tiene resultados inequívocos: B regla 6 y F regla 5 con motivo temporal. No cambia
  las cifras del ejemplo original, cuyo patrimonio está fechado en el corte.
- Se distingue validez temporal de validación estructural: el dato futuro no invalida
  globalmente el archivo; los campos ausentes o fechas imposibles siguen bajo FR-003.
- No se introduce antigüedad máxima ni nueva acreditación histórica en el contrato.
  La regla 3 se conserva y sus tareas exigen acreditar el mínimo y reevaluar.
- Los 16 criterios de calidad se revisaron para este ajuste; no quedan aclaraciones.
  El ajuste temporal queda listo para planificación y pendiente de implementación.
- No se ejecutaron pruebas de aplicación: esta revisión valida documentación.
- No hay `.specify/extensions.yml`; no existen hooks previos ni posteriores que despachar.
- La constitución conserva un TODO de ratificación ajeno a los requisitos de esta funcionalidad.

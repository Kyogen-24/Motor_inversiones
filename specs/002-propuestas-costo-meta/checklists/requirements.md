# Revisión de la especificación: propuestas de costo y meta — Nivel 2

**Propósito**: Revisar la claridad y suficiencia de la especificación.
**Fecha**: 2026-10-25
**Especificación**: [spec.md](../spec.md)
**Marcas**: `[x]` indica calidad documental revisada, no implementación terminada.

## Calidad del contenido

- [x] No contiene detalles de implementación tales como lenguajes, frameworks, APIs o estructura de código.
- [x] Se centra en valor para asesor y cliente: menor costo admisible, calce de plazos y comunicación honesta de brechas.
- [x] Está redactada para interesados no técnicos y explica las fórmulas y los supuestos relevantes.
- [x] Se conservan propósito, decisiones acordadas, recorridos, requisitos, casos límite y criterios de éxito.
- [x] Los requisitos están separados de los nombres, importes, fechas y resultados de los datos de prueba.

## Cobertura de requisitos

- [x] No quedan marcadores `[NEEDS CLARIFICATION]`.
- [x] Los requisitos son comprobables y definen orden, fórmulas, límites, etiquetas y resultados.
- [x] Los criterios de éxito son medibles.
- [x] Los criterios de éxito no dependen de tecnologías de implementación.
- [x] Todos los escenarios de aceptación están definidos.
- [x] Se identifican casos límite de datos, elegibilidad, límites, plazos, déficit y agotamiento.
- [x] El alcance queda limitado a R03, R06 y R07 del nivel 2, con exclusiones explícitas.
- [x] Se identifican dependencias y supuestos, incluidos datos, método de riesgo, horizonte y redondeo.

## Criterios para la entrega

- [x] Todos los requisitos funcionales tienen criterios de aceptación en historias, casos límite, criterios de éxito o fórmulas verificables.
- [x] Las historias cubren los flujos prioritarios de mejora de costos, meta y escenarios.
- [x] Ambas modalidades tienen resultados medibles que pueden comprobarse con entradas distintas.
- [x] No se filtran decisiones de implementación al alcance funcional.

## Notas

Revisión documental actualizada el 2026-10-25: se conservaron los identificadores de requisitos y criterios de éxito. Los ejemplos concretos permanecen en la guía de validación; la especificación no incorpora datos de referencia.

- Se adoptó y declaró una volatilidad ponderada simple para comparar cartera actual y propuesta, tal como permite R07.
- Se definió el tope de crecimiento cerca del primer pago: máximo de perfil multiplicado por `min(1, meses / 24)`; conserva el máximo desde 24 meses y lo reduce a cero al vencimiento.
- Ante la ausencia de fecha final en modalidad costo, se fijó un horizonte de escenario de cinco años como supuesto explícito y revisable.
- R03 queda trazado por FR-006 a FR-008; R06 por FR-009 a FR-017; R07 por FR-003 a FR-005 y FR-013 a FR-015.
- La implementación y su verificación local se documentan en el registro de corrección; las marcas de esta lista describen calidad documental, no acreditan pruebas por sí solas.
- No hay `.specify/extensions.yml`; no existen hooks previos ni posteriores que despachar.

# Revisión documental de requisitos — Nivel 1

Fecha: 2026-10-24. Fuente: [spec.md](../spec.md).

Las marcas de esta lista acreditan revisión documental, no implementación completa ni publicación. Los resultados ejecutados están en [validation.md](validation.md).

## Alcance y claridad

- [x] El alcance se limita al diagnóstico y cambio de series del mismo fondo y AGF.
- [x] Se mantienen R01, R02, R04 y R05 e independencia de comisiones.
- [x] Los cinco recorridos distinguen carga, diagnóstico, acceso, ahorro, repetición y exclusiones.
- [x] Nombres, importes y fechas ficticias permanecen en quickstart, fuera de spec.md.
- [x] Se conservaron FR-001–FR-024 y SC-001–SC-007 de la carpeta importada.
- [x] Se diferencia el objetivo de consulta completa de evidencia de la exposición que hoy permite la interfaz.

## Reglas contrastadas

- [x] Patrimonio posterior produce bloqueo temporal por regla 5 de la alternativa, sin rechazo global ni alteración de reglas previas.
- [x] El archivo admite un registro por emisor; no permite acumular históricos de la misma AGF.
- [x] Ticket individual, orden de acceso y marca de tenencia están separados.
- [x] Diagnóstico y exclusiones concilian sin confundir identificado con computable.
- [x] Ahorro condicional adicional y escenario con condiciones cumplidas se distinguen del elegible.
- [x] Empates y ausencia de reducción estricta tienen una política estable, sin comisión.

## Contratos y trazabilidad

- [x] Se corrigieron parser, precisión, límites, campo ETF y campos obligatorios.
- [x] El resultado corresponde a Analisis o Error, sin unión ok/error inventada.
- [x] Los módulos y pruebas enlazados existen en src.
- [x] No se atribuye congelación profunda ni preservación arbitraria de lexemas a la importación.
- [x] Las tareas conservan T001–T064 y separan comprobaciones respaldadas de pendientes.
- [x] Se retiraron las mediciones y antecedentes de instalación del otro proyecto como evidencia de este checkout.

## Aceptación pendiente

- [ ] Consulta de toda la evidencia y tareas del motor desde el recorrido principal.
- [ ] Estado/regla de la serie actual visibles además de la marca de tenencia.
- [ ] Pruebas de interacción y revisión visual propia del checkout.
- [ ] Benchmark y comprobaciones de subruta/publicación acreditados.

La revisión de documentos no permite marcar estos pendientes como resueltos ni autoriza cambios de código.

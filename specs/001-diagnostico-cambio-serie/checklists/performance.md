# Rendimiento — Nivel 1

Revisión documental: 2026-10-24.

## Estado de la evidencia

No se ejecutó un benchmark propio en esta revisión. Las suites actuales de nivel 1 no contienen benchmark.test.ts ni benchmark.test.tsx. Los tiempos, hardware y perfiles Node/jsdom de la copia no acreditan el rendimiento de este proyecto y se retiraron como resultados vigentes.

La duración de una suite de 121 pruebas no equivale al tiempo del análisis puro, parseo, pintura o interacción de una cartera grande.

## Medición por realizar

- [ ] Definir una muestra reproducible dentro de los límites del contrato actual.
- [ ] Registrar número de posiciones, productos, series y evaluaciones relevantes.
- [ ] Medir por separado lectura/parseo, caso de uso y actualización visible de la interfaz.
- [ ] Registrar runtime, hardware, método, repeticiones y resultados sin mezclar entornos.
- [ ] Verificar las cifras financieras con un cálculo independiente de los tiempos.
- [ ] Documentar el comportamiento de navegación y respuesta durante cargas grandes.

El objetivo técnico heredado de análisis puro por debajo de dos segundos puede conservarse como meta de medición, no como resultado aprobado. No constituye una regla financiera ni una garantía para todos los máximos admitidos.

Una medición Node no acredita renderizado real. HTML estático no mide pintura ni teclado. No se atribuye a esta revisión una optimización de código o un ciclo RED/GREEN de un benchmark inexistente.

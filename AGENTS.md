# Repository Guidelines

## Project Structure

La aplicación mantenible está en `src/`, separada en dominio, aplicación, infraestructura y presentación. Las entradas de referencia y sus variantes viven en `data/`; la especificación de nivel 1 está en `specs/001-diagnostico-cambio-serie/` y la de nivel 2 en `specs/002-propuestas-costo-meta/`. `test-motor-de-propuestas.html` conserva el prototipo original como referencia local y no es la superficie de implementación de la aplicación.

## Run and Verify Locally

Instalar con `npm ci`. Usar `npm run dev` para desarrollo, `npm run typecheck` para tipos, `npm test` para regresiones, `npm run build` para la compilación y `npm run preview` para revisar la compilación estática. Antes de entregar cambios de interfaz, revisar escritorio, móvil estrecho, foco, tablas desplazables y consola del navegador.

## Coding Style and Naming

TypeScript usa modo estricto, dos espacios y textos visibles en español. Aplicar los tokens de `DESIGN.md` y el prefijo CSS `ts-`; preferir controles nativos accesibles. Dominio y aplicación no importan React, Zod ni lectores de archivos. Los cálculos financieros pertenecen al motor y la presentación solo formatea resultados ya resueltos.

## Testing Guidance

Vitest cubre motor, importación, Worker y presentación. Ejecutar `npm test` y las comprobaciones proporcionales al cambio; las pruebas nuevas se colocan junto al módulo que verifican. Los datos de referencia no se cargan automáticamente en la interfaz ni se sustituyen por datos reales de clientes.

## Commits and Pull Requests

This directory has no accessible Git history, so no repository-specific convention can be inferred. Use short imperative commit subjects, for example `Refine proposal rule navigation`. Pull requests should state the user-visible change, list verification performed, link the relevant issue when available, and include screenshots for visual changes. Flag changes to financial examples, rules, or calculations for careful review.

## Aplicación extraída (2026-10-22)

Nivel 2 corregido el 2026-10-25: `specs/002-propuestas-costo-meta/` es autoridad para R03/R06/R07. `npm test` incluye regresiones del motor, evidencia React y adaptador de Worker. Las propuestas se calculan en `proposal.worker.ts`; el hook debe invalidar y cancelar revisiones anteriores. Mantener `admisible` separado de cobertura y ahorro. No certificar optimalidad de una búsqueda de candidatos limitada a 50.000 nodos. Ver `docs/correccion-nivel-2.md` para aceptación y límites.

La aplicación mantenible está en `src/`: dominio, aplicación, infraestructura, presentación. Los archivos de referencia están en `data/`; la aplicación inicia vacía y requiere carga manual. Conservar el HTML/MD original como referencia local. La aplicación sigue `ARCHITECTURE.md` y las especificaciones de nivel 1 y 2. TypeScript utiliza modo estricto; mantener dos espacios y textos en español. Aplicación y dominio no deben importar React, Zod ni lectores de archivos. Los cálculos financieros pertenecen al motor.

Instalación: `npm ci`. Desarrollo: `npm run dev`. Tipos: `npm run typecheck`. Compilación: `npm run build`. Vista de compilación: `npm run preview`. No existe un comando de lint independiente. Pruebas del motor e importación: `npm test`. Modo de desarrollo de pruebas: `npm run test:watch`. Las pruebas están junto a los módulos de dominio, aplicación, infraestructura y presentación. No afirmar que pasaron pruebas que no se ejecutaron.

Utilizar los tokens de DESIGN.md y el prefijo CSS `ts-`. Preferir controles nativos accesibles. Las tablas anchas deben estar dentro de regiones desplazables accesibles por teclado. Revisar escritorio, móvil estrecho y foco cuando haya navegador disponible; declarar cualquier revisión visual pendiente. Publicar solo `dist/`; no publicar el enunciado original ni los anexos internos.

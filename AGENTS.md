# Repository Guidelines

## Project Structure

This repository currently contains one self-contained Spanish-language HTML prototype: `test-motor-de-propuestas.html`. It embeds the document markup, design tokens, component CSS, sample JSON payloads, SVG artwork, and small browser-side interactions. There are no separate source, asset, dependency, or test directories yet. Keep related changes in this file unless the project is deliberately split into a maintainable application structure.

## Run and Verify Locally

No build step or package manager is configured. Open the prototype directly in a modern browser:

```bash
xdg-open test-motor-de-propuestas.html
```

Before submitting a change, manually check the page at desktop and narrow mobile widths. Confirm navigation links, expandable rule and data sections, copy-JSON buttons, hash links, and keyboard focus indicators work. Use the browser console to catch JavaScript errors. If tooling is introduced, document its install, build, lint, and test commands in `README.md` and update this guide.

## Coding Style and Naming

Use two-space indentation for new HTML, CSS, and JavaScript; preserve the compact formatting of nearby generated-style rules unless reformatting a whole coherent block. Keep user-facing copy in Spanish and retain UTF-8 encoding.

Follow the established CSS vocabulary: lowercase kebab-case classes such as `.ts-rule-body`, component modifiers such as `.band--tonal`, and custom properties such as `--c-primary` and `--brand-accent`. Prefer existing design tokens over literal colors, dimensions, or font declarations. Scope page-specific styles with the existing `ts-` prefix. Keep JavaScript dependency-free, wrapped in the existing IIFE, and use descriptive `var` names consistent with the surrounding code.

## Testing Guidance

There is no automated test framework or coverage target. Treat the manual checks above as the required regression pass. When changing embedded sample data, verify displayed totals and labels remain consistent with the JSON. Add automated tests alongside any future extracted application code and name them after the behavior they cover.

## Commits and Pull Requests

This directory has no accessible Git history, so no repository-specific convention can be inferred. Use short imperative commit subjects, for example `Refine proposal rule navigation`. Pull requests should state the user-visible change, list verification performed, link the relevant issue when available, and include screenshots for visual changes. Flag changes to financial examples, rules, or calculations for careful review.

## Aplicación extraída (2026-10-22)

La aplicación mantenible está en `src/`: dominio, aplicación, infraestructura, presentación. Los archivos de entrada ficticios están en `data/`; la aplicación inicia vacía y requiere carga manual. Conservar el HTML/MD original como referencia local. La aplicación sigue ARCHITECTURE.md y la especificación de nivel 1. TypeScript utiliza modo estricto; mantener dos espacios y textos en español. Aplicación y dominio no deben importar React, Zod ni lectores de archivos. Los cálculos financieros pertenecen al motor.

Instalación: `npm ci`. Desarrollo: `npm run dev`. Tipos: `npm run typecheck`. Compilación: `npm run build`. Vista de compilación: `npm run preview`. No existe un comando de lint independiente. Pruebas del motor e importación: `npm test`. Modo de desarrollo de pruebas: `npm run test:watch`. Las pruebas están en `src/application/analizarCartola.test.ts` y `src/infrastructure/input.test.ts`. No afirmar que pasaron pruebas que no se ejecutaron.

Utilizar los tokens de DESIGN.md y el prefijo CSS `ts-`. Preferir controles nativos accesibles. Las tablas anchas deben estar dentro de regiones desplazables accesibles por teclado. Revisar escritorio, móvil estrecho y foco cuando haya navegador disponible; declarar cualquier revisión visual pendiente. Publicar solo `dist/`; no publicar el enunciado original ni los anexos internos.

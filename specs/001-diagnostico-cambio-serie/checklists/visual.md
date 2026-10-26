# Verificación visual y de interacción — Nivel 1

Revisión documental: 2026-10-24. Referencia funcional: [ui.md](../contracts/ui.md).

## Evidencia disponible

Las pruebas de tables.test.tsx generan HTML estático para comprobar datos, formato y tablas. No prueban foco real, teclado, contraste, zoom ni comportamiento adaptable.

Esta revisión no abrió un nuevo navegador ni generó capturas. Las dimensiones, contrastes, hardware y pruebas Firefox/Chrome descritos en la copia pertenecían a otro entorno y no se mantienen como aprobación del checkout actual.

Los antecedentes propios del repositorio pueden consultarse en docs/construccion.md y docs/acceptance-audit.md, sin convertirlos en una revisión nueva de esta carpeta importada.

## Inspección de fuentes

- La identidad visible actual es Motor_inversiones; no se cambió por documentación.
- Inter se sirve localmente con Fontsource.
- La revisión de entradas tiene tablas y campos adicionales; el análisis usa Vista general, Posiciones y Series.
- Existen regiones desplazables con foco y encabezados, pero su presencia en HTML no acredita por sí sola el recorrido accesible.
- La tabla Series sustituye por Actual el estado de contratación de la tenencia.
- El enlace Ver evidencia lleva a la tabla general y no selecciona una posición.

## Comprobaciones pendientes

- [ ] Cargar los tres archivos y completar diagnóstico, series y comparación en escritorio.
- [ ] Repetir en pantalla estrecha, sin desbordamiento global y con tablas desplazables.
- [ ] Recorrer carga, errores, navegación y resultados con teclado y foco visible.
- [ ] Verificar el estado de la serie actual sin ocultarlo por su marca de tenencia.
- [ ] Comprobar consulta de evidencia completa y tareas desde el recorrido principal.
- [ ] Revisar zoom, contraste, etiquetas, avisos de carga/error y tamaño de controles.
- [ ] Registrar navegadores, dimensiones, capturas y limitaciones reales.

El alcance actual permite solo documentos. Ninguno de estos pendientes se considera implementado o corregido por esta lista.

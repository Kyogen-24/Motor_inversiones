# Estado de construcción — 2026-10-22

## Construido

Aplicación local de nivel 1 con React, TypeScript y cuatro capas. Carga simultánea de cartola, catálogo y acuerdos; validación de estructura y relaciones; diagnóstico, elegibilidad, comparación elegible y condicional; evidencia y tareas previas. Datos originales ficticios extraídos del anexo, sin respuestas financieras codificadas.

El diseño utiliza la referencia de DESIGN.md y conserva su identidad visual. Inter se sirve localmente. Los controles son nativos y los iconos pertenecen a Lucide. Se añadieron README.md, SPEC.md, PRODUCT.md y flujo de Pages; el prototipo original permanece sin modificaciones.

## Comprobado

- Instalación de dependencias finalizada; npm informó cero vulnerabilidades en esa instalación.
- `npm run build` finalizado, incluida comprobación estricta de tipos.
- Aplicación abierta mediante MCP Playwright tanto desde desarrollo como desde la compilación con preview; consola de la carga final sin errores.
- Las cifras visibles del ejemplo coinciden con la referencia: 235 M totales, 230 M computables, costo 5,18 M, TAC 2,2522 %, ahorro elegible 1,65 M, costo posterior 3,53 M, TAC 1,5348 % y condicional adicional 615.000 CLP.
- Capturas de escritorio de 1440 px y móvil de 390 px inspeccionadas. Se corrigió el desbordamiento causado por elementos accesibles posicionados fuera de su tabla. El ancho del documento móvil coincide con 390 px.
- Navegación móvil revisada con Tab y Escape: foco dentro del menú, fondo inerte y retorno al disparador al cerrar.
- Revisión independiente: se resolvieron foco móvil y oportunidades monetarias de cero; disposición `ship` al alcance de esas correcciones. No equivale a aprobación completa del motor.
- Detector de Impeccable ejecutado: único aviso `overused-font` por Inter. Se conserva porque DESIGN.md exige esa familia; no es una desviación accidental.

También se inspeccionó 320 px sin desbordamiento global. La región de tabla enfocada se desplaza con ArrowRight (40 px observados).

Capturas locales: `.impeccable/review/desktop.png`, `mobile.png`, `mobile-data.png`, `mobile-series.png` y `mobile-menu.png`. Las capturas de datos y series preceden al último ajuste de foco y la indicación de desplazamiento; las de vista general y menú reflejan las correcciones.

## Verificación completada en la continuación

La continuación solicitó verificar la entrega completa, incluidas pruebas y criterios de aceptación. Se incorporó Vitest y se ejecutaron **99 pruebas: todas pasan**. Las pruebas están en `src/application/analizarCartola.test.ts` y `src/infrastructure/input.test.ts`. `npm run build` vuelve a pasar, incluida comprobación estricta de tipos de las pruebas.

La compilación inicial se comprobó en una subruta de GitHub Pages y se abrió mediante preview. Cargó sin errores de consola. Mediante MCP Playwright se comprobaron cargas sucesivas con un cliente diferente y cambio de monto: costo 4.550.000 CLP, ahorro 1.455.000 CLP y regreso a la cartola original. Se verificó rechazo de sintaxis inválida, ausencia del resultado anterior tras una entrada inválida, cartola vacía, pantalla de series vacía y recuperación con el ejemplo. Se esperan estados visibles después de la lectura asíncrona; una primera comprobación sin esa espera fue descartada como evidencia.

Tailwind limita el escaneo a presentación para producir el mismo CSS al compilar la entrega aislada, sin depender de archivos internos del espacio de trabajo. El flujo de Pages ejecuta `npm test` antes de compilar. README.md y AGENTS.md incluyen los comandos.

## Estado de publicación

La publicación en un repositorio público propio y en GitHub Pages sigue pendiente. El despliegue inicial `76f7661` terminó correctamente en GitHub Actions. Solo se publica `dist/`, mediante ejecución manual.

## Herramientas con límites

Refero MCP devuelve `NO_SUBSCRIPTION`; se utilizó la referencia suministrada, sin atribuir investigación a pantallas inaccesibles. El cargador inicial de Impeccable falló por permisos y el contexto se leyó directamente. El detector pudo ejecutarse mediante el intérprete de su lanzador. El navegador integrado CUA no estaba disponible; MCP Playwright permitió inspección visual y de accesibilidad.

## Carga manual de entradas

La aplicación inicia vacía. Los JSON están en `data/`, una carpeta de archivos de entrada. El primer análisis exige cartola, catálogo y acuerdos seleccionados manualmente; después se pueden reemplazar individualmente. Limpiar datos vacía la sesión. No se requiere servidor de aplicación ni base de datos.

Comprobado en navegador: inicio vacío, botón deshabilitado con entradas incompletas, carga de los tres JSON con ahorro de 1.650.000 CLP y recarga vacía. Tipos y compilación correctos. No se volvió a ejecutar la suite automatizada para este ajuste.

## Corrección de diagnósticos de App

Se separaron `AnalysisView` y `Navigation`. La lectura conjunta de archivos está en `leerArchivos`, dentro de infraestructura; conserva errores simultáneos sin introducir `any`. La navegación móvil utiliza `dialog.showModal()`, cierre con Escape y retorno de foco. La marca es un botón; el selector de secciones es un fieldset; las props son de solo lectura. Se conservaron resultados y pestaña al cambiar de vista.

`npm run build` y tipos correctos. Revisión temporal externa al proyecto mediante ESLint, reglas SonarJS S3776 (umbral 15), S3358, S6759 y reglas recomendadas de jsx-a11y: cero avisos. No se añadieron dependencias al proyecto ni se ejecutó la extensión SonarLint de VS Code. La única excepción puntual es S6845/no-noninteractive-tabindex: el foco de la región desplazable se conserva para su uso con teclado y se documenta en esa línea.

Revisión en navegador: dos archivos intercambiados producen dos errores; corrección y cálculo de 1.650.000 CLP; siete filas, detalle de series, navegación de ida y vuelta con pestaña conservada, tabla desplazada con flecha derecha, móvil sin desborde, diálogo nativo con Escape y retorno de foco. Capturas de escritorio y móvil inspeccionadas. La suite automatizada no se ejecutó en este ajuste. Los errores TypeScript indicados por el editor no se reproducían en disco antes del cambio; ambas rutas de proyecto resuelven al mismo directorio.

## Diagnósticos de estado, formato, detalle y CSS

DataPanel usa `output` para el estado. PositionDetail tiene props de solo lectura y región `section` con excepción puntual de foco para desplazar por teclado. El agrupamiento de cifras usa fragmentos de tres caracteres, sin la expresión regular con retroceso. El selector universal de CSS se consolidó y las transiciones usan duraciones que pasan a cero con movimiento reducido, sin `!important`.

El archivo de estilos utiliza sintaxis de Tailwind 4: la configuración de VS Code lo asocia al lenguaje `tailwindcss` y recomienda `bradlc.vscode-tailwindcss`. No se desactivó la validación CSS; hace falta disponer de esa extensión en el editor.

Tipos y compilación correctos. Revisión estática externa de los componentes afectados: cero avisos en las reglas configuradas. Navegador: estados anunciados por output, agrupación de cantidades grandes/negativas/cero/nulas, desplazamiento de tabla de series con flecha derecha y transiciones de 0 segundos con movimiento reducido. No se ejecutó la suite automatizada en este ajuste.

## Refactor del diagnóstico por posición

Se extrajeron la tasa computable, clasificación de costos, comprobación de valorización y comparación estable de alternativas en funciones privadas del mismo archivo. Se preservaron la firma pública, fórmulas y desempate lexicográfico. Las reglas SonarJS S3776 con umbral 15 y S3358 no reportan avisos en `diagnosis.ts`. Tipos y compilación correctos; la carga manual conserva siete posiciones, costo actual 5.180.000, costo posterior 3.530.000, ahorro elegible 1.650.000 y condicional adicional 615.000 CLP. No se ejecutó la suite automatizada en este ajuste.


## Simplificación del recorrido — 2026-10-22 (histórica)

Se aplicó `docs/plan-simplificacion.md` tras aprobación. Inicio directamente en carga vacía, tres destinos con progreso y distinción entre pendiente de validar y validado. El resumen de errores enlaza al archivo y el mensaje completo aparece junto al control. Las inconsistencias de negocio con ruta conocida se traducen en infraestructura; dominio y cálculos no cambiaron.

El resultado comienza con costo actual, ahorro elegible y costo posterior, seguidos del adicional condicionado y advertencias. Una única lista reemplaza pestañas y tabla duplicada. Las posiciones muestran el motivo de mantener y abren reglas, evidencia, pesos y tareas mediante detalles nativos. El detalle pesado solo se monta al abrir la posición. La lista usa cifras etiquetadas en móvil; la tabla avanzada conserva desplazamiento por teclado. Fuentes y limitaciones siguen accesibles. Se alinearon README, SPEC, especificación detallada, PRODUCT y dirección de interfaz.

Comprobaciones de esta entrega:

- `npm test`: 99 pruebas existentes aprobadas; dos archivos. No se añadieron pruebas.
- `npm run build`: tipos y compilación correctos. Análisis estático temporal con complejidad máxima 15, ternarios anidados, props de solo lectura y reglas de accesibilidad: cero errores en los archivos incluidos. No equivale a ejecutar la extensión SonarLint completa.
- Navegador: inicio vacío, selección manual, recuperación de carga y siete posiciones del caso de referencia. Costo $5.180.000, ahorro $1.650.000, costo posterior $3.530.000 y adicional condicionado $615.000.
- Dos archivos intercambiados producen dos errores. Corregir uno conserva el otro. No se muestran cifras anteriores como vigentes. TAC ausente identifica Producto 1, Serie 1 y Costo anual. Emisor inconsistente identifica Producto 1 y Emisor en el catálogo.
- Búsqueda de Gamma devuelve una posición y el motivo de ausencia de acuerdo está en su fila. Abrir las condiciones enfoca la posición correspondiente. Enter y Espacio abren/cierran el detalle; ArrowRight desplaza la tabla avanzada (40 px observados). Menú móvil modal, Escape y devolución del foco comprobados.
- Revisadas capturas de escritorio 1440 × 1000 y móvil 390 × 844. No hubo desbordamiento horizontal de página. Capturas `simple-desktop.png`, `simple-mobile.png` y `simple-input.png` en `.impeccable/review/`.

SC-005 no se midió con asesores reales. La publicación estaba pendiente en esa revisión. El ZIP de entrega se actualiza con las fuentes y documentos públicos, conservando la exclusión del enunciado y anexos internos.

## Ajuste posterior — vista anterior del análisis

A petición del usuario se restauran Vista general, Posiciones y Acceso y series, las tarjetas de costo y ahorro y la tabla compacta. Se retiran los bloques explicativos añadidos. La carga manual, validación y errores por archivo se conservan.

Tipos y compilación correctos; revisión estática sin errores. Revisados escritorio, móvil de 390 px, búsqueda y apertura de evidencia con foco. No se ejecutaron pruebas automatizadas en este ajuste.

### Legibilidad de posiciones

Tabla con cifras y nombres a 13 px, datos secundarios y encabezados a 11 px, más separación entre filas y TAC elegible debajo de la serie. «bps» pasa a «puntos base»; se retira «Sin ahorro calculado» junto a los ceros. Tipos y compilación correctos; revisión visual en 1440 y 390 px, con desplazamiento de tabla accesible. No se ejecutaron pruebas automatizadas.

## Repositorio y datos adicionales — 2026-10-22

Git inicializado y sincronizado con `main`; mensajes de commit en español desde la instrucción del usuario. Se excluyen credenciales, dependencias, compilación, capturas y artefactos. El repositorio privado conserva documentación y originales de referencia.

Se añadieron cuatro conjuntos JSON completos en `data/pruebas/` y cuatro variantes inválidas, con resultados esperados en su README. Los originales se conservan. No se han ejecutado esos nuevos casos manuales en la aplicación. El flujo de Pages utiliza Node 24, acciones actualizadas y Ubuntu 24.04; despliegue manual.

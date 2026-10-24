# Revisión de tablas de Nivel 1 — 2026-10-24

## Referencia y alcance

Se revisaron las tablas de `test-motor-de-propuestas.html`, sección 07: catálogo de series (línea 1619), diagnóstico (1670), estados por posición (1681) y ahorro (1703). La extracción mediante MCP Firecrawl no estuvo disponible: el servicio rechazó el acceso anónimo y solicitó una clave. La revisión se hizo leyendo el HTML local; no se atribuye extracción a Firecrawl.

Se contrastaron R01, R02, R04 y R05 y FR-001 a FR-024 de la especificación existente de Spec Kit. El ajuste temporal de R04 preserva fórmulas y datos de referencia: comprueba patrimonio al corte únicamente si una serie necesita agregación, conserva las reglas 0 a 3 y excluye de R05 una serie bloqueada por fecha posterior. La evidencia ahora muestra también el corte; no cambia el alcance del motor.

## Información presentada

| Vista | Contenido |
| --- | --- |
| Previsualización de cartola | Cliente, corte, moneda, perfil/APV, posición numerada, producto/ID, descripción original, serie, cuotas, valor cuota y monto con decimales. |
| Previsualización de catálogo | Versión, fuente, fecha, todos los emisores y productos, emisor/ID, tipo, categoría, liquidez, costo declarado, series y restricciones normalizadas. |
| Previsualización de acuerdos | Distribuidor, estado declarado, vigencias, mandato, patrimonio y fecha, todas las habilitaciones y comisiones, productos sin serie. |
| Campos adicionales | Datos recibidos a cualquier nivel, incluidas listas y objetos de seguros; nombres de campo/ruta y valor, conservando cero, falso, nulo y estructuras vacías. No se interpretan como cálculos de R11. |
| Diagnóstico | Monto, peso computable, TAC, costo anual, clasificación y advertencias; total computable con TAC ponderada y costo. |
| Comparación | Serie actual y TAC, escenario elegible y TAC, puntos base, ahorro anual, condicional adicional por posición y totales separados. Motivo visible de ausencia de cambio en Gamma. |
| Acceso | Serie actual, TAC, mínimo, estado, regla y motivo separados; evidencia desplegable y tareas de la oportunidad condicional. |

Los totales provienen del motor. La comparación incluye las siete posiciones y rotula el total como cartola (235 M), mientras las TAC usan 230 M computables. El diagnóstico conserva el costo de Gamma y no atribuye costo cero a lo desconocido. Filtrar posiciones oculta los pies globales. No se muestran comisiones en el análisis.

## Verificación ejecutada

- R04 temporal: con patrimonio Alfa al 2026-10-01, B conserva regla 6, ambas F aplican regla 5 con motivo temporal y M conserva regla 3. El ahorro elegible se mantiene en 1.650.000 CLP y el condicional pasa a 270.000 CLP. Fechas anterior/igual conservan regla 4; fecha futura válida se importa y fecha imposible se rechaza.
- `npm test`: 120 pruebas aprobadas en tres archivos. `npm run typecheck` y `npm run build` aprobaron; el resultado se identifica como `nivel-1.1`.
- Navegador local con carga manual de los tres JSON: escritorio de 1440 px y móvil de 390 px muestran el análisis de referencia sin desbordamiento global. En «Acceso y series», la región de tabla recibe foco y ArrowRight la desplaza 27 px. La evidencia temporal y el motivo de regla 5 se comprueban también en la renderización HTML de Vitest. Capturas: `/tmp/r04-analysis-desktop.png` y `/tmp/r04-analysis-mobile.png`.

- `npm run build`: tipos estrictos y compilación correctos. `git diff --check` sin errores.
- Navegador local: carga manual de los tres originales; previsualización de los 12 productos, seguros y acuerdos; diagnóstico y comparación con 5.180.000 CLP de costo, 1.650.000 de ahorro elegible, 3.530.000 de costo posterior y 615.000 adicionales condicionales.
- Conjuntos `01` a `04`: costos/ahorros coincidentes con `data/pruebas/README.md`. Los cuatro archivos de `05-errores` muestran campo/fila, deshabilitan análisis y retiran resultados; corregirlos permite recuperar el análisis.
- Cartola temporal de 51 posiciones: 50 filas en primera página, fila 51 accesible en segunda y mediante búsqueda; se conservan cuotas de 12 decimales y montos con centavos.
- Escritorio de 1440 px y móvil de 390 px inspeccionados visualmente. Documento sin desbordamiento global a 390 y 320 px. Regiones de tabla enfocables, foco visible y desplazamiento con ArrowRight (40 px observados).
- Búsqueda Gamma, acceso a las cinco series de Alfa, condiciones y tareas de confirmación comprobados. Consola: solo 404 de `favicon.ico`; sin errores de ejecución de la aplicación.

Capturas locales: `/tmp/motor-tablas-final-desktop.png`, `/tmp/motor-tablas-analysis-desktop.png`, `/tmp/motor-tablas-preview-desktop.png`, `/tmp/motor-tablas-access-mobile.png` y `/tmp/motor-tablas-preview-mobile.png`.

No se midió SC-005 con asesores reales ni se cambió la publicación de SC-009. La verificación de navegador se realizó sobre desarrollo local, no sobre un despliegue público.

# Dirección de interfaz — Motor_inversiones

## Objetivo

Interfaz web de trabajo para que un asesor pueda revisar costos, acceso y ahorro de una cartola ficticia. El flujo es cargar datos, comprender costo y ahorro, consultar posiciones y su evidencia en Acceso y series antes de decidir. El alcance visible es nivel 1.

## Fuente y decisiones

La fuente visual aprobada es `DESIGN.md`, referencia Attio. Se conservan el blanco, Inter a peso 500, tinta oscura, bordes finos, radios de 10–12 px, acciones principales oscuras y cobalto reservado para navegación, foco y enlaces. En la contradicción del ejemplo de botón de radio 9999 px prevalece la regla explícita de radio 10 px.

| Decisión | Fuente | Aplicación |
| --- | --- | --- |
| Espacio de trabajo compacto | DESIGN.md: Sidebar Navigation y Tab Bar | Navegación lateral, contexto superior y pestañas Vista general, Posiciones y Acceso y series |
| Blanco y líneas finas | DESIGN.md: Surfaces y Colors | Separaciones discretas, sin decoración fotográfica |
| Evidencia al lado del dato | Especificación FR-010 y FR-019 | Detalle de posición con todas las alternativas y motivos |
| Comparación antes/después | Especificación FR-015 y FR-016 | Costos anuales y TAC con denominador explícito; ahorro condicional aparte |
| Datos reemplazables | FR-001 y FR-002 | Inicio vacío con selección manual de cartola, catálogo y acuerdos; progreso y errores junto a cada archivo |
| Control de errores | FR-003 y FR-021 | Una carga inválida retira resultados previos; errores por campo |

Refero MCP se consultó para estilos Attio y tablas con detalle lateral. Ambas llamadas devolvieron `NO_SUBSCRIPTION`; no se atribuyen hallazgos a pantallas no accesibles. Se utiliza la referencia completa suministrada en DESIGN.md y las reglas de oficio de Impeccable. La interfaz de trabajo adapta la densidad del diseño, sin copiar su estructura de marketing.

La interfaz usa un nombre descriptivo y no incorpora logotipo. No se publica el enunciado. Iconos de Lucide acompañan etiquetas. Los elementos nativos cubren botones, formularios, tablas y expansiones; no se incorpora shadcn/ui mientras no exista una interacción que lo necesite. La memoria visual del producto es la comparación de costos con dos trazos paralelos y el detalle trazable de cada serie.

## Vista de análisis — 2026-10-22

Por preferencia del usuario se recupera la distribución anterior: Vista general, Posiciones y Acceso y series, con comparación de costos y panel de ahorro. Se retiran las explicaciones añadidas y las filas expandibles. Se conservan la carga manual vacía y los errores por archivo.

## Revisión previa de archivos — 2026-10-22

En Archivos de entrada, debajo de las tarjetas de carga, se muestran Cartola,
Catálogo y Acuerdos. La cartola se abre inicialmente. Se presentan contexto,
registros y condiciones con nombres legibles e identificadores de respaldo;
catálogo y acuerdos usan desplegables nativos. Las tablas incluyen búsqueda
cuando superan diez registros y páginas de cincuenta filas.

La selección dispara lectura y validación sin calcular propuestas ni navegar.
Cada archivo con estructura válida puede consultarse aunque otro tenga errores.
Las referencias entre archivos se comprueban al disponer de los tres formatos
válidos. Analizar cartola se habilita al superar las validaciones. Seleccionar un
reemplazo invalida resultados anteriores; limpiar elimina también la revisión.
La validación no certifica que los archivos correspondan al cliente pretendido:
el asesor revisa su contenido antes de iniciar el análisis.

Comprobación: tipos y compilación correctos. Recorrido en navegador con el
escenario 01: revisión previa, series y comisiones visibles, ahorro de $400.000
al analizar y bloqueo al reemplazar acuerdos por una serie inexistente. En
390 px, sin desbordamiento de página y tabla desplazable con foco de teclado.
No se ejecutó la suite automatizada en este cambio.

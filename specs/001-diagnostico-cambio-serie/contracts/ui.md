# Contrato de interacción — Nivel 1

## Ubicación dentro de la aplicación

El recorrido utiliza Archivos de entrada y Análisis de cartola. También existe Cómo se calcula. La navegación actual contiene otra modalidad, pero no pertenece al alcance de este contrato y no debe ocultarse en la documentación como si no existiera.

La aplicación inicia vacía. Se seleccionan cartola, catálogo y acuerdos en JSON o CSV; supuestos y meta no son necesarios para el diagnóstico. Hay controles para reemplazar archivos y limpiar datos, sin editor financiero, persistencia ni ejecución de operaciones.

## Carga y revisión

DataPanel muestra estado, nombre y error de cada archivo. InputReview permite consultar los datos recibidos, incluidos descripciones originales, emisores, series, vigencias, comisiones y campos adicionales anidados. Las tablas de revisión usan páginas de 50 filas y búsqueda en los conjuntos que lo requieren.

La validación de referencias entre los tres archivos precede al botón Analizar cartola. Seleccionar un reemplazo retira los resultados anteriores como vigentes. La revisión de lecturas descarta operaciones antiguas y conserva las demás cargas.

Los errores de estructura o coherencia indican el archivo y un campo o fila cuando puede identificarse. Acuerdos duplicados por emisor requieren corregir el archivo. Patrimonio posterior bien formado no genera ese error global: se refleja como motivo temporal de la alternativa que necesita agregación.

## Consulta de resultados

| Pestaña | Información |
| --- | --- |
| Vista general | Costo actual, elegible y con condiciones cumplidas; ahorro y contexto; universo y advertencias |
| Posiciones | Diagnóstico, monto/peso/TAC/costo, comparación de series y adicional condicional; búsqueda por posición |
| Series | Una tabla con posición, serie, TAC, estado, regla y motivo |

Los totales globales usan la base computable. Los pies de tablas de subconjuntos indican su propia base y no deben confundirse con el patrimonio completo. Al filtrar posiciones se evita atribuir al subconjunto un total global.

El adicional condicional se muestra separado del elegible. El escenario con condiciones cumplidas no equivale a ejecución ni garantía de acceso. Las comisiones se pueden consultar como entrada de Acuerdos; no intervienen en el análisis financiero ni se suman a TAC.

## Diferencias pendientes de presentación

La información del motor y la que muestra el recorrido principal no son idénticas:

1. TablaSeries reemplaza el estado y la regla de la serie poseída por «Actual» y un guion. El objetivo es conservar la marca de tenencia sin ocultar su estado de contratación; esa separación no está completa en la tabla actual.
2. El enlace Ver evidencia abre la pestaña general de Series. No enfoca ni filtra la posición solicitada.
3. El motor devuelve evidencia de ticket, mínimo, patrimonio/fecha y tareas. PositionDetail sabe representarla, pero no está conectado a ese recorrido principal. No se atribuye consulta integral solo porque exista el componente.
4. AnalysisView deriva algunos subtotales y TAC de subconjuntos en la presentación. La regla de acceso y la selección por posición siguen en el motor; la extracción de esos derivados no se realizó en esta revisión.

Estos puntos son pendientes de implementación o verificación, no cambios autorizados por este ajuste documental.

## Formato y accesibilidad

Actualización de presentación: las vistas priorizan cifras, cambios y restricciones del análisis. Las fuentes y el universo se consultan en detalles desplegables. Las anotaciones reservadas _aviso y _nota no se convierten en comentarios automáticos de pantalla; los datos financieros y las fuentes declaradas se conservan. La interfaz utiliza nombres de tareas financieras, sin explicar niveles de entrega ni detalles de desarrollo. Las etiquetas de supuesto permanecen junto a las proyecciones.

Format.ts usa la política decimal compartida para CLP, porcentajes y fechas en español. La previsualización conserva los números interpretados sin aplicar el formato de costo anual. El contenido cargado se presenta como texto.

La identidad visible actual es Motor_inversiones. Las fuentes Inter se sirven localmente mediante Fontsource. DESIGN.md y styles.css son las referencias existentes; no se atribuyen a este proyecto las medidas, contrastes ni capturas del documento importado.

El recorrido debe comprobarse en escritorio, pantalla estrecha, teclado y zoom. Las tablas desplazables necesitan nombre, encabezados y foco visible. Las pruebas de HTML comprueban contenido, pero no sustituyen contraste, interacción ni una revisión real de navegador.

La lista de comprobaciones realizadas y pendientes está en [validation.md](../checklists/validation.md) y [visual.md](../checklists/visual.md).

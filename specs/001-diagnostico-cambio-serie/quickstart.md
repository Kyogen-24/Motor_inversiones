# Guía de validación — Nivel 1

Las reglas están en [spec.md](spec.md). Esta guía conserva los datos ficticios, resultados esperados y variaciones para comprobar el proyecto. No son respuestas codificadas ni reglas dependientes de un cliente particular. Las ejecuciones acreditadas se registran en [validation.md](checklists/validation.md).

## Preparación y comandos reales

Usar Node compatible con el lockfile. La revisión documental se ejecutó con Node v26.11.1; el workflow usa Node 24. El repositorio ya contiene package.json y package-lock.json.

Desde la raíz:

    npm ci
    npm run dev

La aplicación inicia vacía en Archivos de entrada. Seleccionar manualmente data/cartola.json, data/catalogo.json y data/acuerdos.json. Supuestos y meta no se necesitan para este recorrido. Las tarjetas de esas otras modalidades pueden permanecer vacías.

Validación acotada a nivel 1:

    npm test -- src/application/analizarCartola.test.ts src/infrastructure/input.test.ts src/presentation/tables.test.tsx
    npm run typecheck

La primera orden ejecuta 121 pruebas en tres archivos. npm test sin filtro incluye también otros niveles; no se confunden ambos conteos.

Comprobación de la compilación, cuando corresponda realizarla:

    npm run build
    npm run preview

Build ejecuta typecheck antes de Vite. No hay lint independiente. Para verificar una subruta se configura VITE_BASE_PATH al compilar, con el nombre real del repositorio; no se adopta el slug de otro proyecto.

## Recorrido manual de nivel 1

1. Seleccionar los tres archivos y revisar sus tablas y campos adicionales. El análisis se habilita cuando formato y relaciones son válidos.
2. Pulsar Analizar cartola y consultar Vista general, Posiciones y Series.
3. Comprobar costos, base computable, importes sin identificar y adicional condicional con las tablas siguientes.
4. Cambiar un archivo: las otras cargas válidas se conservan, pero el resultado anterior deja de estar vigente hasta analizar de nuevo.
5. Introducir una entrada inválida y comprobar archivo/ruta y recuperación. Las lecturas anteriores no deben reemplazar una revisión más reciente.
6. Limpiar datos y recargar la página para comprobar el inicio vacío.

La tabla principal de Series no muestra hoy toda la evidencia del motor y sustituye el estado de la serie poseída por Actual. El enlace Ver evidencia abre esa tabla general. Son limitaciones documentadas en [ui.md](contracts/ui.md), no verificaciones aprobadas por esta guía.

## Datos concretos de referencia

Estas cifras corresponden únicamente a las entradas ficticias sin modificar de la sección 07,
cliente ACC-4471, corte 2026-09-30. Son criterios de regresión, no constantes del análisis.

| Posición | Monto CLP | Peso | TAC actual | Costo anual CLP |
| --- | --- | --- | --- | --- |
| Alfa Deuda UF CLASI | 60.000.000 | 26,09 % | 2,10 % | 1.260.000 |
| Alfa RV Global CLASI | 45.000.000 | 19,57 % | 3,20 % | 1.440.000 |
| Beta Balanceado CLASI | 50.000.000 | 21,74 % | 2,80 % | 1.400.000 |
| Beta Corto CLP CLASI | 30.000.000 | 13,04 % | 1,10 % | 330.000 |
| Gamma RV Chile CLASI | 25.000.000 | 10,87 % | 3,00 % | 750.000 |
| Depósito UF 90 días | 20.000.000 | 8,70 % | 0,00 % | 0 |
| Base computable | 230.000.000 | 100,00 % | 2,2522 % | 5.180.000 |

La posición sin identificar conserva su descripción original y sus 5.000.000 CLP;
representa 2,13 % del total de 235.000.000 CLP y no integra los pesos anteriores.

| Fondo | Serie alternativa | Estado | Orden R04 |
| --- | --- | --- | --- |
| Alfa Deuda UF | B | eligible | 6 |
| Alfa Deuda UF | F | conditional: agregación | 4 |
| Alfa Deuda UF | M | conditional: mandato | 3 |
| Alfa Deuda UF | APV | blocked: sin plan APV | 2 |
| Alfa RV Global | A | blocked: cerrada | 1 |
| Alfa RV Global | B | eligible | 6 |
| Alfa RV Global | F | conditional: agregación | 4 |
| Alfa RV Global | APV | blocked: sin plan APV | 2 |
| Beta Balanceado | B | eligible | 6 |
| Beta Balanceado | M | eligible | 6 |
| Beta Balanceado | APV | blocked: sin plan APV | 2 |
| Beta Corto CLP | B | eligible | 6 |
| Gamma RV Chile | B | out_of_scope: sin acuerdo | 0 |

Las series CLASI conservan la etiqueta de tenencia actual. Su contratación se evalúa
por separado: las de Alfa y Beta resultan elegibles en este ejemplo; Gamma queda fuera.

| Posición | Mejor elegible | Ahorro bps | Ahorro anual CLP | Mejor condicional adicional CLP |
| --- | --- | --- | --- | --- |
| Alfa Deuda UF | B, TAC 1,45 % | 65 | 390.000 | F: 300.000 |
| Alfa RV Global | B, TAC 2,30 % | 90 | 405.000 | F: 315.000 |
| Beta Balanceado | M, TAC 1,30 % | 150 | 750.000 | 0 |
| Beta Corto CLP | B, TAC 0,75 % | 35 | 105.000 | 0 |
| Gamma RV Chile | Ninguna | 0 | 0 | 0 |
| Total | Sin cambio de fondo ni AGF | — | 1.650.000 | 615.000 |

El subtotal de fondos de esta comparación es 210.000.000 CLP; no reemplaza los
230.000.000 CLP de la base computable, que incluye el depósito. El costo posterior
es 3.530.000 CLP y la TAC posterior es 1,5348 %.

## Variaciones financieras

| Cambio sobre una copia de los datos | Resultado esperado |
| --- | --- |
| Alfa Deuda UF B baja a 1,40 % | Ahorro de esa posición 420.000 CLP y 70 puntos base; total elegible 1.680.000 CLP |
| Cambiar solo comisiones, conservando las claves de habilitación | Mismos estados, elecciones, costos y ahorros |
| Añadir efectivo reconocido por 10.000.000 CLP | Base 240.000.000 CLP; costo 5.180.000 CLP; TAC 2,1583 % |
| Añadir seguro reconocido por 10.000.000 CLP al original | Total 245.000.000 CLP; base 230.000.000; sin identificar 5.000.000; excluido 10.000.000 |
| Subir un mínimo por encima del ticket y del agregado válido | La serie deja de ser elegible y su ahorro se retira |
| Repetir el mismo fondo en dos posiciones | Se conservan ambas; no se suman sus tickets para el acceso |

Estas variaciones son resultados a comprobar. La tabla no atribuye a esta revisión una ejecución de cada variante en navegador.

## Patrimonio agregado al corte

Cambiar solo patrimonio_al de Alfa desde 2026-09-30 a 2026-10-01 conserva un archivo válido. Las series que necesitan ese patrimonio para acreditar el mínimo quedan bloqueadas por regla 5, con motivo temporal. B sigue elegible si su ticket alcanza el mínimo; M conserva la condición por mandato y exige reevaluación.

El costo diagnosticado y el ahorro elegible no cambian. Las F dejan de aportar el adicional por agregación; M de Deuda UF puede mantener 270.000 CLP de adicional respecto de B, sujeto a sus propias condiciones. Volver a fecha igual o anterior al corte permite evaluar de nuevo la agregación.

No se rechaza globalmente el análisis ni se altera una regla previa por una fecha posterior bien formada.

## Bordes de precisión y errores

- Ticket 4.999.999,60 frente a mínimo 5.000.000: se compara como inferior aunque ambos se muestren al mismo peso.
- Diferencia de valorización exactamente 1 CLP: sin advertencia; superior: con advertencia y monto declarado conservado.
- Redondeo: 100,50 → 101; 100,49 → 100. Los costos se suman antes de redondear sus rótulos.
- TAC agregada 2,25225 % → 2,2523 %; peso 26,085 % → 26,09 %.
- Total cero: porcentaje sin identificar nulo. Base cero: TAC y pesos nulos, sin división por cero.
- Un número JSON no se sustituye por un string numérico. Se comprueban los límites del contrato actual, no una escala uniforme de ocho decimales.
- Un producto o serie desconocidos conservan línea y monto; un ETF sin tac_pct es una exclusión conocida.
- Un acuerdo repetido por emisor invalida el archivo, aunque uno de los registros sea histórico.
- Claves JSON repetidas no tienen un detector específico en el lector actual; no se registra su rechazo como criterio ya cumplido.
- Entrada congelada para una prueba del caso de uso no significa que el lector congele los archivos normalizados.

## Revisión visual, rendimiento y entrega

Las pruebas HTML no sustituyen el recorrido real en escritorio, móvil, teclado, zoom y contraste. Las listas de [visual](checklists/visual.md) y [rendimiento](checklists/performance.md) distinguen comprobaciones pendientes de resultados medidos.

El workflow Pages es manual y publica solo dist después de pruebas/build. No tiene validación automática por PR ni acciones fijadas a SHA. Verificar la base real, el artefacto, el historial publicable y la URL sin sesión corresponde a entrega; no se ejecuta al actualizar esta documentación.

No utilizar las capturas, hardware, tiempos, puntuaciones ni conteos de suites del proyecto de origen como evidencia de este checkout.

# Motor_inversiones

Diagnóstico de costos y propuestas de inversión con evidencia. **Niveles 1 y 2**: R01–R07. Interfaz en español y archivos locales de referencia para validación. El cálculo ocurre en el navegador, sin cuentas, backend, base de datos ni API.

## Ejecutar

Requiere Node.js 22.12+ compatible con Vite 8 y npm. Implementado con Node.js 26.11.1; las versiones exactas se conservan en `package-lock.json`.

```bash
npm ci
npm run dev
```

Abrir la dirección local mostrada por Vite. La aplicación inicia vacía. Abre Archivos de entrada y selecciona los tres JSON de `data/` para analizar.

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`build` comprueba tipos y genera `dist/`. `preview` sirve esa compilación; no sustituye un backend ni es necesario después del despliegue estático. No se ha configurado un analizador de estilo independiente.

## Uso

1. La aplicación empieza vacía, en Archivos de entrada. Selecciona `data/cartola.json`, `data/catalogo.json` y `data/acuerdos.json`. Se leen y validan al seleccionar. Revisa su contenido en las pestañas Cartola, Catálogo y Acuerdos; después pulsa Analizar cartola. El botón se habilita cuando los tres archivos y sus referencias son válidos.
2. En Vista general, revisa patrimonio, costos antes y después, ahorro elegible y oportunidades condicionadas.
3. En Posiciones, busca un fondo. La flecha de cada fila abre Acceso y series, con alternativas, reglas y evidencia.
4. Usa Actualizar archivos para reemplazar uno o varios JSON. Los demás se conservan; seleccionar un reemplazo retira los resultados anteriores. Los errores aparecen junto al archivo afectado y se enlazan desde el resumen.
5. Limpiar datos elimina archivos y resultados. Recargar la página también vuelve al inicio vacío. No se guarda una base de datos.
6. Para costo, carga además `data/supuestos.json`, analiza y pulsa **Generar mejora de costo**. Para meta, agrega `data/meta.json` y pulsa **Armar propuesta para la meta**. La generación usa un Worker local; puedes navegar durante el cálculo. Cambiar un archivo o limpiar cancela el cálculo anterior.

En nivel 2 se mantienen o reducen volatilidad y costo sin usar retornos ni comisiones para seleccionar. Se respetan categoría, elegibilidad, perfil y concentración. Se conserva una tenencia barata aunque no admita compras nuevas. La búsqueda determinista explora hasta 50.000 nodos: informa la mejor propuesta encontrada, sin certificar un óptimo global ni la inexistencia de otras soluciones. Las exclusiones y tareas condicionales permanecen visibles.

En meta, el VP usa el promedio simple de categorías efectivas, días reales / 365,25 y reservas cronológicas. Los pesos usan el capital asignado; el no asignable se informa aparte y no financia escenarios. El ticket de nueva inversión suma fondo/serie entre tramos; en costo los lotes originales se evalúan separados. Los pagos simultáneos conservan su identidad sin duplicar liquidez futura.

Los tres escenarios son **supuestos**: adverso −1,5 pp, base 0 y favorable +1,5 pp al retorno bruto. Se capitaliza a retorno neto de TAC hasta liquidación; el costo mensual por saldo medio es informativo y no se cobra dos veces. Solo se declara «alcanza» si todos los pagos se cubren en base neta. El pendiente futuro no es el capital adicional necesario hoy. Consulta [la aceptación de nivel 2](specs/002-propuestas-costo-meta/quickstart.md).

Comprueba primero las cifras de referencia. Después usa los conjuntos de [data/pruebas](data/pruebas/README.md) o modifica los JSON y vuelve a cargarlos. Los cuatro escenarios de APV, mandato, acuerdos vencidos y ausencia de ahorro, y los cuatro archivos inválidos, se comprobaron en la interfaz local el 2026-10-24.

La previsualización conserva descripciones originales, decimales y campos adicionales de los tres archivos. Abre cada producto o acuerdo para revisar sus series y datos; las tablas muestran hasta 50 registros por página, con búsqueda para conjuntos grandes. Los campos adicionales anidados se muestran con su ruta. Las banderas omitidas de serie se presentan con los valores normalizados documentados. En el análisis, Posiciones separa el diagnóstico de costos y la comparación de series; Acceso y series conserva reglas, motivos, evidencia y tareas condicionales.

Una selección nueva retira los resultados anteriores hasta analizar. Los errores indican la ruta afectada y permiten corregir los archivos. No se conservan cargas entre recargas del navegador ni se envían archivos a un servidor.

## Organización

```text
src/
  domain/          modelos, validación semántica, costos y acceso
  application/     analizarCartola: caso de uso puro
  infrastructure/  lectura JSON y Zod
  presentation/    React, formato y estilos
data/              archivos JSON de referencia y variantes de validación
```

`data/` contiene archivos de entrada; no es una base de datos. La aplicación no requiere servidor de aplicación ni base de datos: el alojamiento estático o Vite solo entrega archivos.

Presentación conecta infraestructura con aplicación. Aplicación depende del dominio; ninguna de estas dos capas importa React, Zod o lectores de archivos. El resultado conserva copias de las entradas y evidencia serializable. El prototipo original permanece como referencia local y no se incluye en `dist`.

## Decisiones del stack

- TypeScript estricto reduce inconsistencias entre contratos y estados.
- React gestiona cargas, errores y consulta de resultados. Vite produce archivos estáticos.
- Tailwind aporta base y tokens; CSS de componentes mantiene la dirección de `DESIGN.md`.
- Zod valida la estructura antes del análisis; el dominio comprueba relaciones e invariantes.
- decimal.js conserva precisión decimal. Las tasas son porcentajes, no fracciones.
- Lucide aporta iconos coherentes con etiquetas accesibles. Inter se sirve desde el propio sitio mediante Fontsource.

Referencias oficiales: [Vite](https://vite.dev/guide/), [integración Tailwind](https://tailwindcss.com/docs/installation/using-vite), [Zod](https://zod.dev/api), [decimal.js](https://mikemcl.github.io/decimal.js/).

## Reglas y precisión

La fecha de corte determina la vigencia del acuerdo: inicio estrictamente anterior y fin inclusivo. La elegibilidad se detiene en la primera coincidencia de R04. En diagnóstico y costo el ticket conserva cada lote original; en meta se consolida la nueva inversión por fondo/serie entre tramos, sin sumar tenencias existentes para fabricar mínimos.

Cuando el ticket no alcanza el mínimo, R04 acepta patrimonio agregado sólo si su fecha es anterior o igual al corte de la cartola. Un patrimonio posterior permanece visible como evidencia, pero aplica regla 5 con motivo temporal; no invalida la carga ni afecta otras series de la misma AGF. Si falta mandato, prevalece regla 3 y las tareas exigen acreditar el mínimo al corte o alcanzarlo con el ticket antes de reevaluar. Los resultados actuales usan `nivel-1.1`.

El costo anual es monto × TAC / 100. La TAC ponderada utiliza únicamente montos computables; depósitos y efectivo entran con costo cero. Las líneas desconocidas, seguros y otros productos quedan declarados aparte. ETF requiere `tac_pct` explícita en el producto. Una serie desconocida de un fondo deja la posición sin identificar.

Se emplea una configuración privada de decimal.js con **40 dígitos significativos** y ROUND_HALF_UP. Las cifras del resultado se serializan como cadenas decimales. No se redondea para presentación durante los cálculos. CLP al peso, TAC agregada a cuatro decimales y pesos a dos. Se conserva monto declarado; diferencia de valorización mayor que 1 CLP genera advertencia.

Límites explícitos: 5 MB por archivo, 10.000 posiciones, 1.000 productos/emisores/acuerdos, 100 series por producto, importes no negativos hasta 10^15, mínimo positivo 10^-8 y hasta 16 dígitos significativos en los números JSON interpretados. Tasas de 0 a 100 %. Fechas de 1900 a 2200. JSON usa números: no escribir cifras con más precisión esperando recuperar dígitos que JSON.parse ya haya redondeado.

El ahorro condicional es adicional respecto del escenario elegible. Se muestra la alternativa condicional de menor TAC por posición y sus tareas; todas las alternativas siguen disponibles en Acceso y series. La falta de mandato prevalece por regla 3, pero formalizarlo no elimina otros mínimos: se exige actualizar los datos y reevaluar.

Las comisiones se conservan en el contexto del análisis y se ocultan en la vista del cliente. Nunca participan en decisiones ni se suman como costo. No hay un selector de comisiones porque esta entrega no incluye una vista comercial.

## Cifras de referencia

Cartola: 235.000.000 CLP. Computable: 230.000.000. Sin identificar: 5.000.000 (2,13 %). Costo actual: 5.180.000/año; TAC 2,2522 %. Ahorro elegible: 1.650.000/año. Costo posterior: 3.530.000; TAC 1,5348 %. Condicional adicional: 615.000/año.

Estas cifras son criterios de aceptación; no están codificadas en el motor.

## Pruebas

`npm test` ejecuta las pruebas de Vitest del motor, casos de uso, importación, Worker y presentación. `npm run test:watch` mantiene las pruebas en observación. Cubren cifras de aceptación, acceso, concentración, mínimos, perfil, VP, escenarios, pagos, precisión, determinismo, cancelación y errores de entrada.

Las pruebas de motor e importación usan los JSON de referencia y sus variaciones. Las de presentación renderizan React de forma estática y no necesitan un servidor. Las revisiones visuales e interactivas se documentan en `docs/construccion.md`. Pages ejecuta las pruebas y la compilación antes de subir el sitio.

`src/presentation/tables.test.tsx` verifica además el HTML generado por las tablas: contenido completo y precisión de la previsualización, datos adicionales de seguros, diagnóstico, totales, exclusiones y ahorro condicional. No requiere un navegador para ejecutarse.

## Publicación en GitHub Pages

Se incluye un flujo de GitHub Actions para publicar exclusivamente `dist/` al habilitar Pages con origen GitHub Actions. La ruta base se obtiene del nombre del repositorio y funciona también con repositorios `usuario.github.io`. Para una ruta distinta:

```bash
VITE_BASE_PATH=/nombre-repositorio/ npm run build
```

La publicación en un repositorio público propio y en GitHub Pages sigue pendiente. Las direcciones se añadirán cuando se configure esa entrega.

El despliegue es manual: **Actions → Publicar sitio en Pages → Run workflow → main**. Subir a `main` no publica automáticamente. El flujo instala dependencias, ejecuta pruebas, comprueba tipos, compila y publica solo `dist/`. Utiliza Node 24, acciones con runtime Node 24 y Ubuntu 24.04.

El repositorio privado conserva los originales HTML/MD y anexos internos como referencia; no se incluyen en el sitio. Antes de hacer público el repositorio se debe preparar una copia sin esos documentos. Las credenciales, compilación, dependencias instaladas, capturas y archivos generados están excluidos por `.gitignore`. En `data/` se versionan únicamente los ejemplos originales y `data/pruebas/`; no añadir archivos reales de clientes.

## Límites funcionales

No incluye controles del nivel 3, documento formal, SHA-256, historia ni CSV. El perfil limita crecimiento, pero no se valida su caducidad ni se infiere idoneidad real. El ahorro compara costos del catálogo cargado; las proyecciones son supuestos y no prometen rentabilidad ni representan todo el mercado. La persona revisa y decide.

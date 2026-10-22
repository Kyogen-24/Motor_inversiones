# Varenne

Diagnóstico de costos y comparación de series de inversión con evidencia. **Nivel 1**: R01, R02, R04 y R05. Interfaz en español y datos ficticios. El cálculo ocurre en el navegador, sin cuentas, backend, base de datos ni API.

## Ejecutar

Requiere Node.js 22.12+ compatible con Vite 8 y npm. Implementado con Node.js 26.11.1; las versiones exactas se conservan en `package-lock.json`.

```bash
npm ci
npm run dev
```

Abrir la dirección local mostrada por Vite. La aplicación inicia vacía. Abre Datos de entrada y selecciona los tres JSON de `data/` para analizar.

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`build` comprueba tipos y genera `dist/`. `preview` sirve esa compilación; no sustituye un backend ni es necesario después del despliegue estático. No se ha configurado un analizador de estilo independiente.

## Uso

1. La aplicación empieza vacía, en Archivos de entrada. Selecciona `data/cartola.json`, `data/catalogo.json` y `data/acuerdos.json`; pulsa Analizar archivos. La selección queda pendiente de validar hasta analizar.
2. En Vista general, revisa patrimonio, costos antes y después, ahorro elegible y oportunidades condicionadas.
3. En Posiciones, busca un fondo. La flecha de cada fila abre Acceso y series, con alternativas, reglas y evidencia.
4. Usa Actualizar archivos para reemplazar uno o varios JSON. Los demás se conservan; seleccionar un reemplazo retira los resultados anteriores. Los errores aparecen junto al archivo afectado y se enlazan desde el resumen.
5. Limpiar datos elimina archivos y resultados. Recargar la página también vuelve al inicio vacío. No se guarda una base de datos.

Comprueba primero las cifras de referencia. Después modifica los JSON y vuelve a cargarlos para demostrar que los resultados dependen de las entradas.

Una selección nueva retira los resultados anteriores hasta analizar. Los errores indican la ruta afectada y permiten corregir los archivos. No se conservan cargas entre recargas del navegador ni se envían archivos a un servidor.

## Organización

```text
src/
  domain/          modelos, validación semántica, costos y acceso
  application/     analizarCartola: caso de uso puro
  infrastructure/  lectura JSON y Zod
  presentation/    React, formato y estilos
data/              archivos JSON de entrada ficticios
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
- Los controles nativos resuelven las interacciones actuales; shadcn/ui queda disponible para una necesidad concreta. CSV y Papa Parse se posponen.

Referencias oficiales: [Vite](https://vite.dev/guide/), [integración Tailwind](https://tailwindcss.com/docs/installation/using-vite), [Zod](https://zod.dev/api), [decimal.js](https://mikemcl.github.io/decimal.js/).

## Reglas y precisión

La fecha de corte determina la vigencia del acuerdo: inicio estrictamente anterior y fin inclusivo. La elegibilidad se detiene en la primera coincidencia de R04. El ticket es individual; no se suman posiciones para alcanzar mínimos.

El costo anual es monto × TAC / 100. La TAC ponderada utiliza únicamente montos computables; depósitos y efectivo entran con costo cero. Las líneas desconocidas, seguros y otros productos quedan declarados aparte. ETF requiere `tac_pct` explícita en el producto. Una serie desconocida de un fondo deja la posición sin identificar.

Se emplea una configuración privada de decimal.js con **40 dígitos significativos** y ROUND_HALF_UP. Las cifras del resultado se serializan como cadenas decimales. No se redondea para presentación durante los cálculos. CLP al peso, TAC agregada a cuatro decimales y pesos a dos. Se conserva monto declarado; diferencia de valorización mayor que 1 CLP genera advertencia.

Límites explícitos: 5 MB por archivo, 10.000 posiciones, 1.000 productos/emisores/acuerdos, 100 series por producto, importes no negativos hasta 10^15, mínimo positivo 10^-8 y hasta 16 dígitos significativos en los números JSON interpretados. Tasas de 0 a 100 %. Fechas de 1900 a 2200. JSON usa números: no escribir cifras con más precisión esperando recuperar dígitos que JSON.parse ya haya redondeado.

El ahorro condicional es adicional respecto del escenario elegible. Se muestra la alternativa condicional de menor TAC por posición y sus tareas; todas las alternativas siguen disponibles en Acceso y series. La falta de mandato prevalece por regla 3, pero formalizarlo no elimina otros mínimos: se exige actualizar los datos y reevaluar.

Las comisiones se conservan en el contexto del análisis y se ocultan en la vista del cliente. Nunca participan en decisiones ni se suman como costo. No hay un selector de comisiones porque esta entrega no incluye una vista comercial.

## Cifras de referencia

Cartola: 235.000.000 CLP. Computable: 230.000.000. Sin identificar: 5.000.000 (2,13 %). Costo actual: 5.180.000/año; TAC 2,2522 %. Ahorro elegible: 1.650.000/año. Costo posterior: 3.530.000; TAC 1,5348 %. Condicional adicional: 615.000/año.

Estas cifras son criterios de aceptación; no están codificadas en el motor.

## Pruebas

`npm test` ejecuta las pruebas de Vitest del caso de uso puro y la importación. `npm run test:watch` mantiene las pruebas en observación. Cubren las cifras de aceptación, 13 alternativas, primera coincidencia, límites de vigencia/mínimos, APV, mandato, cambios de datos, independencia de comisiones, empates, ceros, exclusiones, valorización, precisión, inmutabilidad, determinismo y errores de entrada.

Las pruebas utilizan los JSON ficticios y sus variaciones; no montan React ni necesitan un servidor. Las revisiones visuales e interactivas se documentan en `docs/construccion.md`. Pages ejecuta las pruebas y la compilación antes de subir el sitio.

## Publicación en GitHub Pages

Se incluye un flujo de GitHub Actions para publicar exclusivamente `dist/` al habilitar Pages con origen GitHub Actions. La ruta base se obtiene del nombre del repositorio y funciona también con repositorios `usuario.github.io`. Para una ruta distinta:

```bash
VITE_BASE_PATH=/nombre-repositorio/ npm run build
```

No se ha creado un repositorio remoto ni publicado el sitio. El directorio de trabajo contiene el enunciado local: **no subir el directorio completo a un repositorio público**. La solución pública debe contener `src`, configuración, archivo de bloqueo y documentación propia; excluir el enunciado HTML/MD y anexos internos. `dist/` contiene únicamente la aplicación y sus datos ficticios.

## Límites funcionales

No incluye proyecciones, metas, reasignación entre fondos, optimización de riesgo, nueve controles completos, documento formal, SHA-256, historia ni CSV. El perfil es contexto declarado y no se valida su vigencia. El ahorro compara costos del catálogo ficticio; no promete rentabilidad ni representa todo el mercado. La persona revisa y decide.

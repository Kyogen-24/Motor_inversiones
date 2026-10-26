# Plan y organización del nivel 1

Proyecto: Motor_inversiones. Revisión: 2026-10-24.

La [especificación](spec.md) define R01, R02, R04 y R05. Este documento describe la organización implementada y la verificación que corresponde a este repositorio. Sustituye las rutas, dependencias y afirmaciones de implementación copiadas de otro proyecto; no autoriza cambios de código.

## Resultado esperado

El asesor carga los tres archivos, revisa el diagnóstico, comprende las alternativas de acceso y compara series del mismo fondo y AGF. Las cifras responden a los datos cargados, con exclusiones explícitas, ahorro condicional separado e independencia de comisiones.

La aplicación contiene funcionalidades de otros niveles, pero el diagnóstico sigue siendo independiente de ellas. Esta revisión no implementa ni evalúa esos alcances.

## Contexto técnico comprobado

| Área | Estado real |
| --- | --- |
| Lenguaje | TypeScript estricto, línea 7 según package.json; destino ES2022 |
| Interfaz | React 19, Lucide, Fontsource Inter y estilos con Tailwind 4 |
| Desarrollo | Vite 8 con plugins React y Tailwind |
| Importación | JSON.parse o adaptadores CSV, seguidos por Zod 4 en infraestructura |
| Cálculo | decimal.js 10, constructor privado de 40 dígitos |
| Pruebas | Vitest 5; tres archivos de regresión de nivel 1 dentro de src |
| Entorno verificado | Node v26.11.1 durante esta revisión; workflow configurado con Node 24 |
| Persistencia | Solo memoria del navegador; sin backend, cuentas o base de datos |
| Configuración | package.json, package-lock.json, tsconfig.json y vite.config.ts |

No están incorporados lossless-json, Testing Library ni jsdom. No existen la carpeta tests, vitest.config.ts ni los módulos propuestos por la copia como decimal.ts, consistency.ts, schemas.ts o useAnalysis.ts. La configuración y las suites reales no necesitan esos archivos para existir.

Las versiones reproducibles son las del lockfile; este documento no cambia las declaraciones de dependencias ni atribuye una instalación nueva.

## Estructura de nivel 1

    src/
      main.tsx
      domain/
        model.ts
        numeric.ts
        validation.ts
        diagnosis.ts
        eligibility.ts
      application/
        analizarCartola.ts
        analizarCartola.test.ts
      infrastructure/
        input.ts
        input.test.ts
      presentation/
        App.tsx
        useAppWorkflow.ts
        Navigation.tsx
        DataPanel.tsx
        InputReview.tsx
        AnalysisView.tsx
        PositionDetail.tsx
        tables.test.tsx
        format.ts
        styles.css
    data/
      cartola.json
      catalogo.json
      acuerdos.json

Otros archivos presentes en esas carpetas pertenecen a otros alcances y no se eliminan por esta lista.

## Dependencias y flujo

Presentación solicita lectura/validación a infraestructura e invoca analizarCartola con los tres objetos. Aplicación utiliza dominio; los módulos financieros no importan React ni Zod.

Flujo: seleccionar archivo → leer texto → interpretar JSON o CSV → validar estructura → verificar relaciones → analizar posiciones → calcular totales → presentar resultado.

AnalizarCartola es síncrona y devuelve Analisis o lanza Error. No hay resultado ok/error ni confirmaciones persistidas. La importación no genera objetos profundamente congelados; el caso de uso no los modifica y clona el contexto de salida.

La interfaz conserva revisiones de lectura para descartar operaciones anteriores. Los detalles de navegación y sus pendientes están en [contracts/ui.md](contracts/ui.md). Algunos subtotales de subconjuntos siguen en AnalysisView; no se acredita su extracción al dominio mediante esta revisión documental.

## Decisiones de negocio y precisión

- Acuerdo activo con inicio anterior al corte y fin inclusivo. Un solo registro por emisor, también al considerar históricos.
- Primera coincidencia de R04; un patrimonio posterior bloquea por regla 5 solo la alternativa que lo necesita y no rechaza todo el análisis.
- Monto declarado como base, con advertencia de valorización por diferencia absoluta mayor de 1 CLP.
- Misma base computable antes y después de R05. Efectivo/depósitos a costo cero; seguros, otros y líneas desconocidas separados.
- Ticket individual, menor TAC elegible y desempate por código. El adicional condicional se calcula desde la elegible aplicada o actual.
- Precisión de 40 dígitos después de interpretar números JSON. No hay garantía de preservar tokens arbitrarios antes de JSON.parse.
- 5 × 1024 × 1024 bytes por archivo; 10.000 posiciones; 1.000 productos/emisores/acuerdos y 100 series por producto. Rangos por campo en [input-json.md](contracts/input-json.md).

## Verificación y trazabilidad

| Grupo | Fuente real | Evidencia |
| --- | --- | --- |
| Entrada y referencias | infrastructure/input.ts; domain/validation.ts | input.test.ts y analizarCartola.test.ts |
| R01/R04 | domain/eligibility.ts | Casos temporales, precedencia y límites de acceso en analizarCartola.test.ts |
| R02 | domain/diagnosis.ts; application/analizarCartola.ts | Costos, exclusiones, valorización y base cero |
| R05 | domain/diagnosis.ts | Selección, empates, ahorro y adicional condicional |
| Comisiones y determinismo | Caso de uso y dominio | Variaciones de comisiones, entradas congeladas y repeticiones |
| Presentación de datos | InputReview y AnalysisView | tables.test.tsx, con HTML estático |
| Recorrido, visual y rendimiento | Navegador y mediciones específicas | Pendientes o antecedentes separados de la suite financiera |

La matriz por FR está en [SPEC.md](../../SPEC.md). Las tareas adaptadas mantienen sus identificadores en [tasks.md](tasks.md). No se trasladan como aprobadas las tareas de otro proyecto solo por tener el mismo objetivo.

## Publicación

El workflow .github/workflows/pages.yml responde a workflow_dispatch, instala con npm ci, ejecuta npm test y npm run build y sube únicamente dist. El build ya ejecuta typecheck. Vite usa VITE_BASE_PATH o una base relativa por defecto.

Ese archivo no configura validación automática por pull request, parámetros publish ni acciones fijadas a SHA. La base se calcula a partir del nombre del repositorio en el workflow. No se ejecutó CI, auditoría del historial ni publicación durante esta revisión.

Los comandos reales y las comprobaciones de subruta y entrega están en [quickstart.md](quickstart.md). Verificar un build local no acredita la URL pública ni autoriza publicar el enunciado.

## Estado

La revisión ejecutó 121 pruebas de nivel 1 y typecheck, sin fallos. No modificó código ni realizó un nuevo build, benchmark, recorrido visual o despliegue. Los pendientes de presentación y evidencia se conservan en [implementation-status.md](implementation-status.md).

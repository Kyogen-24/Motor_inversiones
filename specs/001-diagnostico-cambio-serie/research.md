# Decisiones técnicas contrastadas — Nivel 1

Revisión documental del 2026-10-24. Fuentes: código, configuración y pruebas del repositorio actual, junto con la especificación. Esta revisión no es una nueva investigación de versiones externas ni una reproducción de la instalación del proyecto del que se copiaron los documentos.

## 1. Mantener las cuatro capas

La implementación separa dominio, aplicación, infraestructura y presentación. El diagnóstico se prueba invocando analizarCartola sin React ni lectores de archivos. No hay necesidad documental de añadir repositorios genéricos, clases por regla ni nuevas capas.

El flujo actual usa model.ts, numeric.ts, validation.ts, diagnosis.ts y eligibility.ts. Los nombres propuestos en la copia no se presentan como módulos existentes.

Hay una limitación de separación: AnalysisView deriva subtotales y TAC de subconjuntos para sus tablas. Se registra para revisión posterior; esta actualización no mueve cálculos.

## 2. Describir el stack instalado

Package.json y el lockfile son la referencia: TypeScript 7, React 19, Vite 8, Tailwind 4, Zod 4, decimal.js 10, Vitest 5, Lucide e Inter local mediante Fontsource.

No se instalaron lossless-json, Testing Library ni jsdom en este proyecto. No se requiere una .nvmrc o un entorno DOM inexistente para describir las pruebas actuales. La comprobación de tipos es explícita y build la ejecuta antes de Vite.

Las suites se mantienen junto a los módulos de src. No hay pruebas en tests/domain ni tests/presentation aunque esas rutas aparecieran en la documentación copiada.

## 3. Reconocer los límites de lectura numérica

El lector usa JSON.parse sobre el texto recibido y Zod valida los números interpretados. El cálculo posterior usa decimal.js.

Esto no preserva cada lexema financiero del JSON. Una conversión a Decimal después de Number no recupera dígitos perdidos. Tampoco rechaza específicamente claves repetidas. Se documentan esas limitaciones en lugar de atribuir garantías de un parser que no está instalado.

Una alternativa futura sería un lector que conserve el origen numérico; no es una dependencia ni una tarea completada de esta revisión. Adoptarla requeriría implementación y pruebas específicas, fuera de la autorización documental.

## 4. Política decimal real

El constructor privado usa 40 dígitos significativos y ROUND_HALF_UP. El motor evita redondeo de pantalla antes de comparar mínimos, costos o empates. Las pruebas comprueban redondeo y límites con las entradas admitidas.

El límite aplicado por validarNumero es de 16 dígitos significativos, magnitud máxima 10^15 y mínimo positivo 10^-8, con cero admitido. No equivale a una escala general máxima de ocho decimales ni a una precisión de trabajo de 64 dígitos.

La TAC agregada se obtiene a partir del costo total y la base computable. Los pesos redondeados de pantalla no se usan para reconstruir ese costo.

## 5. Separar errores y estados de acceso

Zod atiende estructura. ValidarNegocio comprueba referencias, unicidad, fechas y magnitudes antes de calcular.

La unicidad de acuerdos es por emisor en el archivo completo; no hay selección entre varios históricos y uno vigente. La fecha posterior del patrimonio se admite si está bien formada y se usa como impedimento de acceso por regla 5 solo cuando es necesaria la agregación.

La propuesta copiada de rechazar globalmente el análisis por esa fecha contradice eligibility.ts y las pruebas temporales actuales. Se corrigió la documentación para mantener la política del proyecto, sin cambiar el motor.

## 6. No confundir inmutabilidad de cálculo con congelación de importación

El caso de uso no modifica las entradas; sus pruebas también reciben objetos congelados. El contexto del resultado usa structuredClone.

La importación no congela profundamente todos los objetos y model.ts no define unidades nominales readonly para cada magnitud. Esas garantías de la copia no se atribuyen a este contrato.

## 7. Usar evidencia verificable

La revisión ejecutó las tres suites existentes de nivel 1: motor, importación y HTML de presentación. Son 121 pruebas, no 26 o 27 archivos de prueba. Typecheck también pasó.

RenderToStaticMarkup permite comprobar el HTML de tablas y componentes; no verifica interacción, foco real, pintura, contraste ni zoom. Un componente de evidencia probado por separado tampoco demuestra que el flujo principal permita llegar a él.

Las cifras y casos están en [quickstart.md](quickstart.md); el registro de ejecución está en [checklists/validation.md](checklists/validation.md).

## 8. Distinguir interfaz, objetivos visuales y estado actual

La aplicación inicia vacía y permite cargar/reemplazar archivos y navegar entre archivos y análisis. Sus pestañas de análisis son Vista general, Posiciones y Series. El sitio completo contiene otras modalidades, sin que formen parte de esta revisión.

Los tokens de DESIGN.md y styles.css ya pertenecen a este proyecto. No se importan como mediciones verificadas los contrastes, tamaños y capturas del otro entorno.

Persisten diferencias entre el resultado y su exposición: Series utiliza Actual en lugar del estado de la tenencia, y el enlace de evidencia lleva a una tabla general. Se documentan en [contracts/ui.md](contracts/ui.md) para no presentar esa consulta como totalmente resuelta.

## 9. Registrar la entrega real

Vite usa VITE_BASE_PATH; el workflow Pages es manual, depende de pruebas/build y publica dist. No tiene trigger de PR ni revisiones de acciones fijadas a SHA.

La publicación, subruta real, recursos del artefacto y revisión del historial necesitan evidencia propia. No se conservan como hechos actuales los mensajes de fallo npm, ausencia de Git, instalación alternativa Node o puntuaciones React Doctor de la copia.

## Conclusión documental

Los requisitos financieros del nivel 1, los contratos y las rutas se alinean con el motor existente. Las limitaciones de lectura, las diferencias de presentación y las verificaciones no realizadas quedan explícitas. Esta actualización no acredita cambios de código ni cierra tareas pendientes de implementación, rendimiento, accesibilidad o entrega.

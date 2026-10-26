<!--
Sync Impact Report
Version change: plantilla sin versión → 1.0.0 (constitución inicial).
Modified principles: los cinco marcadores se reemplazan por:
  I. Reglas explícitas y alcance verificable.
  II. Cálculo puro, determinista y comprobable.
  III. Elegibilidad y beneficio del cliente.
  IV. Evidencia, honestidad y decisión humana.
  V. Simplicidad, ejecución local y datos ficticios.
Added sections: Restricciones del proyecto; Flujo de trabajo y revisión;
  contenido concreto de Governance.
Removed sections: ninguna sección sustantiva; se retiran ejemplos de plantilla.
Deferred items: TODO(RATIFICATION_DATE): confirmar fecha de adopción.
Follow-up: retirar este informe temporal antes de confirmar el archivo en Git.
Scope: solo constitution.md; las plantillas dependientes se leen en ejecución.
-->
# Motor de propuestas Constitution
# Core Principles

Esta constitución gobierna Motor_Propuestas_Inversión completo: diagnóstico, optimización y documentos
auditables. Se aplica a las tres features de los niveles 1, 2 y 3 y a cualquier extensión.
«DEBE», «NO DEBE» y «SE PROHÍBE» expresan obligaciones comprobables. El alcance incremental
determina cuándo se implementa una capacidad; nunca suspende los principios transversales.

### I. FIDELIDAD AL DOMINIO FINANCIERO

- Toda regla implementada DEBE respetar el enunciado de evaluación, sus prioridades y
  excepciones explícitas. Una discrepancia personal se documenta; no altera la regla.
- Se DEBE conservar trazabilidad bidireccional entre R01–R13, decisiones, módulos y pruebas.
  Las reglas pendientes y R13 opcional DEBEN figurar con su estado, sin fingir cobertura.
- Cada resultado financiero DEBE poder explicarse y reproducirse desde entradas, reglas y
  supuestos identificados. Se PROHÍBE inventar valores faltantes, comisiones, rentabilidades,
  condiciones de contratación o resultados para completar un análisis.
- Los datos sintéticos explícitos para ejemplos y pruebas se permiten como datos ficticios
  rotulados y versionados; nunca sustituyen silenciosamente información ausente.

### II. ARQUITECTURA Y RESPONSABILIDADES

- Se DEBEN mantener cuatro capas ligeras: presentación, aplicación, dominio e infraestructura.
  Dominio concentra modelos, cálculos y reglas; aplicación coordina casos de uso;
  infraestructura lee, interpreta, valida y normaliza entradas; presentación gestiona
  interacción, estado y representación de resultados.
- Aplicación y dominio DEBEN usar funciones puras y contratos tipados. NO DEBEN importar
  React, componentes UI, Zod, lectores de archivos, infraestructura ni APIs del navegador.
  Dominio puede usar decimal.js con configuración estable y propia del motor.
- Presentación conecta la lectura con los casos de uso. Los efectos del navegador,
  incluida la obtención asíncrona de una huella, DEBEN quedar fuera del motor puro.
- Se DEBEN preferir funciones y tipos concretos. Clases, patrones o abstracciones requieren
  una responsabilidad o variación real que los justifique.
- `ARCHITECTURE.md` DEBE respetarse; todo cambio relevante exige motivación, alternativas,
  impacto en dependencias y pruebas, y actualización documental explícita.

### III. EJECUCIÓN Y DATOS

- La aplicación DEBE funcionar íntegramente en el navegador, con recursos estáticos y
  compatibilidad con GitHub Pages. Se PROHÍBEN backend, base de datos, autenticación,
  servicios externos y llaves de API en su funcionamiento.
- Solo se DEBEN utilizar datos ficticios. Los datos y recursos necesarios DEBEN poder
  servirse con la aplicación, sin depender de consultas financieras ni servicios remotos.
- Las entradas JSON DEBEN leerse y validarse antes del análisis. Otro formato requiere
  justificación de alcance y validación equivalente; CSV no es requisito para llegar a nivel 3.
- Modificar datos válidos DEBE permitir modificar el análisis conforme a las reglas.
  Se PROHÍBE codificar identificadores o respuestas del ejemplo como lógica financiera.
- El motor prepara evidencia; una persona revisa y decide. La interfaz NO DEBE sugerir
  decisiones autónomas ni ejecución automática de inversiones.

### IV. PRECISIÓN Y DETERMINISMO

- Cálculos decimales y redondeos DEBEN centralizarse con decimal.js. Precisión interna,
  límites admitidos y redondeo DEBEN documentarse y comprobarse; la UI no puede cambiarlos.
- Se DEBE preservar precisión intermedia, sin convertir a `number` para calcular ni
  reutilizar cifras redondeadas de pantalla como entradas del motor.
- Porcentajes, tasas fraccionarias, puntos base, CLP y UF DEBEN distinguirse en contratos
  y conversiones. La política existente exige CLP al peso, TAC agregada a cuatro decimales,
  pesos porcentuales a dos y mitades hacia arriba para montos no negativos; la advertencia
  de discrepancia de valorización usa la tolerancia de 1 CLP de `ARCHITECTURE.md`.
- Las decisiones financieras DEBEN usar fechas de corte explícitas y fuentes fechadas;
  NO DEBEN depender de la fecha actual del dispositivo ni de estado global mutable.
- Las mismas entradas, supuestos, parámetros y versiones DEBEN producir los mismos
  resultados. Las entradas originales NO DEBEN mutarse ni compartir estado mutable con la UI.

### V. ELEGIBILIDAD Y UNIVERSO DE PROPUESTAS

- Se DEBEN separar y declarar los universos de lectura y propuesta de R01. Leer o mantener
  una posición NO autoriza una nueva contratación.
- Ningún destino puede quedar fuera de acuerdos vigentes y series habilitadas, salvo los
  productos sin AGF admitidos por el enunciado y sujetos a sus reglas específicas.
- R04 DEBE detenerse en la primera coincidencia, en este orden: acuerdo/habilitación,
  cierre, APV, mandato, agregación, mínimo insuficiente y elegibilidad restante.
- `eligible`, `conditional`, `blocked` y `out_of_scope` DEBEN conservar significados
  distintos, con código, motivo y evidencia. «Actual» solo identifica la tenencia.
- Una alternativa condicional DEBE mostrarse aparte con sus tareas previas; NO DEBE
  ejecutarse sin confirmación escrita ni tratarse como definitivamente elegible.
  Resolver una condición exige reevaluar todas las reglas con el contexto actualizado.
- R05 DEBE comparar series elegibles del mismo fondo y AGF. Cambiar fondo o AGF corresponde
  a R07; no se puede atribuir ese resultado al ahorro por cambio de serie.

### VI. INDEPENDENCIA Y CONFLICTOS DE INTERÉS

- R10 DEBE respetarse desde nivel 1: la comisión del distribuidor NO DEBE intervenir
  en construcción, selección, optimización ni desempates de propuestas, ni en retornos.
  NO DEBE descontarse artificialmente de costos para aparentar mejoras.
- Su uso DEBE limitarse a BEST_ACCESSIBLE y auditoría interna conforme al enunciado,
  conservando evidencia para nivel 3. Variar solo comisiones, manteniendo habilitación
  y demás datos, NO DEBE cambiar la propuesta ni sus métricas financieras.
- Mostrar comisiones al cliente es una decisión abierta de R10: DEBE justificarse en
  `SPEC.md` y expresarse como parámetro explícito, sin una constante oculta.

### VII. HONESTIDAD FINANCIERA

- Ahorro elegible, ahorro condicional y alternativas bloqueadas DEBEN distinguirse.
  Un ahorro inaccesible NO DEBE sumarse al realizable ni presentarse como garantizado.
- R03 DEBE separar costo acumulado, retorno bruto y retorno neto; cada proyección DEBE
  rotular sus supuestos. Retornos supuestos NO son historia ni promesas.
- R07 DEBE preservar la prioridad: mantener o bajar volatilidad, minimizar costo y
  respetar concentración. El retorno es consecuencia, no objetivo. Riesgo actual y
  propuesto DEBEN compararse con el mismo método y supuestos declarados.
- R06 DEBE respetar plazos, liquidez, concentración y tope de crecimiento del perfil,
  declarar el método de valor presente y el ajuste por cercanía del primer pago,
  y reportar déficit o excedente. Se PROHÍBE cerrar una brecha aumentando riesgo.
- Se DEBEN presentar escenarios adverso, base y favorable, con cobertura y saldo final
  en UF o agotamiento según corresponda. NO DEBEN ocultarse pérdidas ni déficits.
- Posiciones no identificadas y exclusiones DEBEN conservarse y declararse. R02 DEBE
  excluir de su base computable las líneas no identificadas y seguros con ahorro;
  depósitos y efectivo cuentan con costo cero. No se inventan costos faltantes.
- Si se implementa R13, DEBE separarse historia de proyección, respetar aportes, fechas,
  costos y series, y declarar insuficiencia de historial sin extrapolar. Solo se admite
  historia sintética explícitamente rotulada como ejemplo, nunca presentada como real.

### VIII. AUDITORÍA Y DOCUMENTOS

- Los resultados DEBEN incluir códigos, motivos y evidencia estructurada; los controles
  de nivel 3 DEBEN devolver `ok`, `warn` o `block`, con su aplicabilidad y evidencia.
- R09 DEBE conservar los nueve controles: HEADLINE_NONE, RISK_SHIFT, ANCLA_COSTO,
  BEST_ACCESSIBLE, HIDDEN_DEFICIT, INSURANCE_MIX, PESOS_NO_SUMAN, PERFIL_VENCIDO y
  SIN_IDENTIFICAR, con los efectos y ámbitos del enunciado. Ningún `block` puede
  coexistir con la generación del documento definitivo.
- Aceptaciones, motivos y declaraciones que R09 admita para resolver un bloqueo DEBEN
  registrarse y provocar reevaluación; no son un permiso genérico para saltar controles.
  Un cambio de riesgo aceptado sigue identificado como cambio de perfil.
- R08 DEBE producir `costo`, `riesgo`, `ambos` o `ninguno`, con tolerancias declaradas.
  El retorno nunca encabeza. Sin mejora verificable NO DEBE afirmarse una mejora;
  `ninguno` impide generar el documento conforme a R08 y su aplicabilidad en R09.
- BEST_ACCESSIBLE DEBE comparar alternativas elegibles de la misma categoría dentro
  de acuerdos; condicionales y empates de costo no activan una alternativa más barata.
  Todo motivo requerido para resolverlo DEBE imprimirse.
- R11 DEBE separar seguros de la TAC ponderada y documentar ahorro, prima, permanencia
  a 5, 10 y 20 años y multa de rescate. `other` se declara como texto y no se propone.
- R12 DEBE conservar una instantánea inmutable de entradas, catálogo, acuerdos, supuestos,
  parámetros, versiones del motor y reglas, propuesta, resultados y controles. El documento
  DEBE incluir diagnóstico, comparación, riesgo o proyección, seguros si aplican,
  condiciones previas, declaraciones, fuentes de costo y huella.
- Al implementar R12, la serialización canónica DEBE definirse y probarse; su SHA-256
  DEBE figurar en el pie. La misma instantánea DEBE reproducir propuesta, contenido y hash.
  La impresión a PDF ocurre en el navegador. Una corrección crea una versión nueva
  vinculada a la anterior; NO DEBE modificar silenciosamente el documento original.

### IX. EXPERIENCIA DE USUARIO

- La interfaz DEBE seguir las decisiones visuales aplicables de `DESIGN.md`, con identidad
  propia de Motor_Propuestas_Inversión. Las discrepancias visuales se documentan antes de resolverlas.
- Cifras, unidades, fuentes, motivos de bloqueo y condiciones de acceso DEBEN ser legibles.
  Las advertencias DEBEN explicar qué ocurre y qué acción permite atenderlo.
- Se DEBEN verificar adaptación móvil, navegación por teclado, foco visible, etiquetas,
  contraste y tablas consultables sin reducir su texto para hacerlas caber.
- Las cifras monetarias y porcentajes DEBEN alinearse a la derecha y usar cifras tabulares;
  la escala aplicada al producto y controles de al menos 44 px respetan `DESIGN.md`.
- React NO DEBE recalcular reglas financieras. Gráficos, colores y titulares NO DEBEN
  exagerar beneficios ni sugerir conclusiones que los resultados no sostienen.
- Una carga inválida DEBE invalidar resultados presentados como vigentes; cargas obsoletas
  NO DEBEN sobrescribir el análisis más reciente.

### X. CALIDAD Y PRUEBAS

- Se DEBE usar TypeScript estricto y validar entradas externas antes del análisis.
  La validación estructural NO DEBE reemplazar las reglas semánticas del dominio ni
  descartar como error técnico una posición bien formada que no se identifica.
- Vitest DEBE comprobar funciones puras y casos de uso directamente, sin necesitar React
  ni lectores de archivos para verificar reglas financieras.
- Se DEBEN incluir regresiones con cifras del enunciado, casos límite, precedencia,
  invariantes, redondeo, inmutabilidad y variaciones de datos. Las pruebas DEBEN detectar
  errores reales; repetir constantes del ejemplo sin ejercitar cálculos no basta.
- Se DEBEN verificar importación y errores por separado, además del recorrido de usuario.
  Al abordar nivel 3 se DEBEN probar bloqueos efectivos y reproducibilidad documental.
- Una feature solo está completa cuando pasan las pruebas de su alcance, la comprobación
  explícita de tipos y el build. Los comandos y resultados DEBEN ser verificables.

### XI. DESARROLLO INCREMENTAL

- Nivel 1 implementa R01, R02, R04 y R05; nivel 2 incorpora R03, R06 y R07; nivel 3
  incorpora R08, R09, R10, R11 y R12. R13 permanece opcional.
- Independencia de comisiones, honestidad, determinismo, precisión y límites de universo
  DEBEN respetarse desde nivel 1. Reconocer y excluir seguros de TAC también rige desde allí;
  su tratamiento documental completo corresponde al nivel 3.
- La arquitectura DEBE admitir la evolución completa mediante contratos y evidencia,
  sin implementar funcionalidades futuras por anticipado.
- NO DEBE iniciarse el siguiente nivel con errores críticos pendientes del anterior.
  Son críticos los que alteran cifras, elegibilidad, prioridades o capacidad de validar
  y usar correctamente el alcance ya entregado, o permiten tratar datos reales de clientes.

### XII. DOCUMENTACIÓN Y ENTREGA

- `README.md` DEBE mantener instrucciones ejecutables de instalación, desarrollo, pruebas,
  tipos, build y publicación, con stack y archivo de bloqueo de dependencias.
- `SPEC.md` DEBE registrar alcance, decisiones, supuestos, decisiones abiertas resueltas
  y discrepancias argumentadas; NO sustituye ni contradice esta constitución.
- Cambios arquitectónicos relevantes DEBEN documentarse. Especificaciones, planes,
  listas de verificación y demás artefactos de Spec Kit DEBEN mantenerse consistentes
  con esta constitución y con la trazabilidad R01–R13.
- La solución pública DEBE usar nombre y marca propios. Se PROHÍBE publicar el enunciado
  original, su marca o cualquier archivo de `reference/`; los datos ficticios permitidos
  se distribuyen separadamente como datos de ejemplo.
- Solo se DEBE publicar una entrega funcional cuyas pruebas, tipos y build del alcance
  implementado pasen. Se DEBE verificar el sitio compilado bajo la ruta real de GitHub
  Pages, incluidos datos y recursos, y su acceso sin sesión.

## Fuentes, alcance y discrepancias

El enunciado de evaluación es la autoridad para reglas financieras; `ARCHITECTURE.md`
define las decisiones técnicas existentes y `DESIGN.md` las decisiones de interfaz.
Esta constitución gobierna su aplicación global. Una especificación de nivel 1 no reduce
las obligaciones de los otros niveles. La constitución no autoriza reinterpretar el negocio.

La revisión inicial registra estas diferencias, sin modificar las fuentes:

- **Ubicación de referencia:** `reference/test-motor-de-propuestas.md` no existe en esta
  revisión. Se analizó `test-motor-de-propuestas.md` en la raíz como copia disponible.
  Su ubicación actual tampoco autoriza publicarlo. `ARCHITECTURE.md` referencia una
  especificación futura que debe verificarse antes de utilizarse como evidencia.
- **Identidad:** la sección final de `DESIGN.md` conserva un nombre de aplicación incompatible
  con la prohibición de marca del enunciado y la identidad Motor_Propuestas_Inversión. Requiere corrección
  documental explícita antes de publicación; no se hereda como identidad del producto.
- **Diseño:** las restricciones de sombras azuladas discrepan de tokens con negro puro;
  el resumen inicial de radios tampoco coincide íntegramente con tablas y componentes.
  Las medidas generales de marketing difieren de la escala final aplicada a datos financieros.
  Se DEBE registrar la decisión pertinente antes de implementar los valores afectados,
  sin copiar valores truncados o rangos como si fueran valores CSS únicos.
- **Datos ficticios e historia:** la prohibición de inventar resultados no elimina la
  posibilidad explícita de R13 de usar historia sintética rotulada. No hay permiso para
  fabricar historia real, rellenar vacíos silenciosamente o extrapolar datos inexistentes.
- **Riesgo y bloqueos:** R07 prohíbe vender un aumento de riesgo como mejora; R09 contempla
  aceptación explícita de un cambio de perfil. Conservar ambas obligaciones exige registrar
  el cambio y reevaluar; nunca renombrarlo como mejora ni ignorar un `block` vigente.

Las elecciones abiertas del enunciado DEBEN concretarse en `SPEC.md` al abordar su alcance:
método de riesgo y valor presente, ajuste de crecimiento por plazo, tolerancias de R08,
umbral de antigüedad del perfil y visibilidad de comisiones. Los parámetros de controles
DEBEN ser explícitos y respetar los valores exigidos por el enunciado. Esta constitución
no inventa esos valores ni resuelve decisiones funcionales futuras.

## Revisión y criterios de cumplimiento

Cada especificación, plan y revisión de cambio DEBE comprobar los principios aplicables,
identificar R01–R13 afectadas, aportar evidencia de pruebas y registrar decisiones abiertas.
Los requisitos no implementados DEBEN declararse pendientes por alcance, no aprobados.
La revisión DEBE comprobar límites entre capas, trazabilidad, determinismo, independencia
de comisiones, claridad de estados y consistencia de documentos y artefactos de Spec Kit.

Antes de cerrar una feature o publicar, DEBE quedar evidencia de pruebas, tipos y build
correctos y de las verificaciones de interfaz y despliegue pertinentes. En nivel 3 también
DEBE comprobarse que los bloqueos impiden documentos y que la instantánea reproduce su hash.
Una discrepancia no resuelta impide considerar conforme el comportamiento afectado.

## Governance

Esta constitución se aplica a las tres features y a sus extensiones. Ninguna especificación,
plan, tarea o decisión local puede contradecirla. Toda excepción propuesta DEBE documentar
principio afectado, motivo, alcance, riesgos, evidencia y responsable de su aceptación.
Una excepción que contradiga una obligación requiere una enmienda expresa antes de aplicarse;
una justificación aislada no autoriza incumplir el enunciado ni omitir controles financieros.

Los conflictos entre requisitos, arquitectura y diseño DEBEN reportarse con fuentes,
consecuencias y decisión pendiente. NO DEBEN resolverse silenciosamente ni mediante reglas
financieras nuevas. Si la fuente es ambigua, el comportamiento afectado requiere aclaración
documentada antes de considerarse conforme.

Toda enmienda DEBE identificar cambios, justificación y efectos en las tres features,
contratos, pruebas, documentos ya emitidos y artefactos de Spec Kit; registrar revisión
explícita del responsable del proyecto; y actualizar versión, fecha y plan de adecuación.
Los documentos emitidos conservan sus versiones originales; corregirlos exige nueva versión.

Se aplica versionado semántico: MAJOR para eliminar o redefinir obligaciones de forma
incompatible; MINOR para incorporar principios o ampliar obligaciones compatibles; PATCH
para aclaraciones sin cambio normativo. La versión 1.0.0 es la primera adopción: el archivo
anterior era una plantilla sin ratificación. Las revisiones DEBEN comprobar cumplimiento
y efectos de cada enmienda; no basta con actualizar el número de versión.

**Version**: 1.0.1 | **Ratified**: 2026-10-23 | **Last Amended**: 2026-10-23

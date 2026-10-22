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

## Core Principles

### I. Reglas explícitas y alcance verificable

Cada entrega DEBE declarar en `SPEC.md` el nivel implementado, las reglas cubiertas,
las exclusiones y las decisiones abiertas con su justificación. Las reglas del enunciado
`test-motor-de-propuestas.md` DEBEN conservar su significado y prioridad; las discrepancias
DEBEN documentarse sin alterar silenciosamente el resultado exigido. Las ambigüedades que
cambien elegibilidad, costos o riesgo DEBEN resolverse explícitamente antes de implementar
el comportamiento afectado. El nivel 1 DEBE quedar completo y verificable antes de ampliar
el alcance. Esto permite evaluar calidad sin confundir funciones incompletas con capacidades
ya disponibles.

### II. Cálculo puro, determinista y comprobable

El motor DEBE usar funciones puras, separadas de la interfaz, sin red ni base de datos.
Las mismas entradas y versiones de reglas DEBEN producir los mismos resultados. Fechas,
supuestos, unidades, precisión y tolerancias DEBEN ser explícitos; el cálculo NO DEBE depender
de la hora actual ni de valores aleatorios implícitos. Porcentajes, puntos base, CLP y UF
DEBEN convertirse consistentemente, con una política de redondeo documentada. El costo
ponderado DEBE usar el monto identificado según R02, declarar exclusiones y advertir
las discrepancias entre cuotas por valor cuota y monto declarado.

El motor extraído DEBE tener pruebas de comportamiento que cubran las reglas implementadas,
sus límites y cambios de datos; NO DEBE codificar las respuestas del ejemplo. El caso de nivel 1
DEBE reproducir 230.000.000 CLP identificados, 5.000.000 CLP sin identificar, costo anual
de 5.180.000 CLP, TAC de 2,2522 %, ahorro elegible de 1.650.000 CLP y TAC posterior de 1,5348 %,
con el redondeo declarado. Los 615.000 CLP de ahorro condicional adicional DEBEN informarse
separadamente. Estas referencias permiten detectar errores sin prescribir el stack.

### III. Elegibilidad y beneficio del cliente

El motor DEBE distinguir el universo de lectura del universo de propuesta y declarar los
acuerdos vigentes a la fecha de corte. Ningún destino fuera del universo permitido puede
proponerse. La elegibilidad DEBE respetar el orden de primera coincidencia de R04 y exponer
estado, regla y motivo. Las alternativas condicionales DEBEN mostrarse aparte, con su
condición y confirmación escrita previa a cualquier ejecución.

La comisión de distribución NO DEBE intervenir en selección, desempates ni retorno; solo
puede alimentar los controles y la auditoría previstos en R10. Una mejora de costos DEBE
mantener o reducir el riesgo con un método comparable y declarado. Un aumento de riesgo
DEBE presentarse como cambio de perfil y registrar la aceptación explícita exigida por R09.
Una meta NO DEBE cerrar un déficit agregando riesgo por encima del perfil permitido.
Estos límites protegen al cliente frente a incentivos comerciales y proyecciones favorables.

### IV. Evidencia, honestidad y decisión humana

El producto DEBE comunicar que el motor prepara evidencia y una persona revisa, decide y
firma. Cada cifra DEBE poder rastrearse a datos, regla, fecha y fuente. Datos ficticios,
supuestos, estimaciones y posiciones sin identificar DEBEN rotularse como tales. Los retornos
proyectados NO DEBEN presentarse como historia ni promesa. Las propuestas de meta DEBEN
informar déficit y escenarios conforme a las reglas del nivel implementado.

Al implementar el nivel 3, cada control de R09 DEBE devolver `ok`, `warn` o `block` con
evidencia; un solo `block` DEBE impedir generar el documento. Una excepción solo puede
levantarse por el mecanismo previsto en la regla, con el registro exigido. El documento DEBE
congelar entradas, catálogo, acuerdos, supuestos y controles, e incluir el SHA-256 de su JSON
canónico. Mismas entradas DEBEN generar la misma propuesta y huella. Una corrección DEBE
crear una nueva versión que reemplace a la anterior sin editarla. La interfaz NO DEBE anunciar
controles o garantías todavía no implementados.

### V. Simplicidad, ejecución local y datos ficticios

La solución DEBE ejecutar todo el cálculo en el navegador, sin servidor, base de datos,
cuentas, llaves de API ni servicios de pago. Los datos de demostración y prueba DEBEN ser
ficticios y estar disponibles como archivos locales del repositorio; NO DEBEN incorporarse
datos reales de clientes. El cálculo NO DEBE delegarse a inteligencia artificial.

Toda dependencia nueva DEBE responder a una necesidad documentada. El stack DEBE ser gratuito
y justificarse en `README.md`. Mientras se mantenga el prototipo autocontenido, sus cambios
DEBEN respetar su organización; una extracción a aplicación DEBE documentar la separación
entre motor, datos e interfaz. La simplicidad permite publicar un sitio estático reproducible
y explicar las decisiones durante la evaluación.

## Restricciones del proyecto

- La interfaz y los mensajes al usuario DEBEN estar en español y conservar UTF-8.
- Los cambios del prototipo DEBEN seguir `AGENTS.md`: indentación de dos espacios,
  vocabulario CSS y tokens existentes, prefijo `ts-` y JavaScript sin dependencias.
- Las posiciones sin identificar DEBEN declararse sin inventar producto, costo o ahorro.
  Efectivo y depósitos DEBEN tener costo cero; seguros con ahorro DEBEN seguir R11,
  fuera de la TAC ponderada y con desglose propio cuando se incorporen.
- Parámetros abiertos, como tolerancias, vigencia del perfil y divulgación de comisiones,
  DEBEN documentarse en `SPEC.md`; la divulgación de comisiones DEBE ser configurable.
- La entrega pública DEBE usar nombre y marca propios, sin copiar el enunciado ni utilizar
  la marca de la entidad evaluadora. Los datos de ejemplo sí pueden incluirse.
- La aplicación entregable DEBE poder publicarse en GitHub Pages y funcionar sin sesión.
  Esta condición de entrega no ordena publicar con cada cambio.

## Flujo de trabajo y revisión

1. Antes de implementar una capacidad, DEBEN explicitarse alcance, entradas, salidas,
   reglas, criterios de aceptación y decisiones en la especificación aplicable.
2. Los cambios del motor DEBEN acompañarse de pruebas de las reglas afectadas, incluidos
   casos límite y datos modificados. En nivel 3 DEBE incluirse el caso `BEST_ACCESSIBLE`
   de la sección 07. La documentación DEBE indicar cómo ejecutar esas pruebas.
3. Los cambios de interfaz DEBEN revisarse en escritorio y móvil estrecho, comprobando
   interacciones afectadas, navegación, teclado, foco y errores de consola. En el prototipo
   esto incluye enlaces, hash, secciones expandibles y copia de JSON.
4. Cada revisión DEBE comprobar fidelidad de reglas, coherencia entre cifras y JSON,
   separación entre motor e interfaz y ausencia de promesas sin evidencia. Los cambios
   de reglas, ejemplos financieros o cálculos DEBEN señalarse para revisión expresa.
5. Cada entrega DEBE explicar el cambio visible, la verificación y las limitaciones.
   Los cambios visuales DEBEN incluir capturas en la revisión. Al introducir herramientas,
   `README.md` y `AGENTS.md` DEBEN documentar instalación, ejecución y comandos aplicables
   de compilación, análisis y pruebas.

## Governance

Esta constitución rige especificaciones, planes, tareas y revisiones del proyecto.
`AGENTS.md` contiene las instrucciones operativas y el enunciado contiene las reglas de
negocio. Las contradicciones DEBEN registrarse y resolverse explícitamente antes de
implementar el comportamiento afectado; una decisión local sin documentar no exime
del cumplimiento.

Toda enmienda DEBE identificar el motivo, principios afectados, impacto sobre trabajo
existente y migración necesaria. El responsable del proyecto DEBE revisar y aceptar
la enmienda antes de incorporarla a la línea principal. Los cambios sustantivos DEBEN
actualizar versión y fecha de última modificación, conservando la fecha original de
ratificación una vez confirmada.

La versión sigue `MAJOR.MINOR.PATCH`: MAJOR para eliminar o redefinir obligaciones de forma
incompatible; MINOR para añadir principios o ampliar materialmente obligaciones; PATCH
para aclaraciones sin cambio de significado. La primera constitución concreta es `1.0.0`.
Cada revisión de especificación, plan y entrega DEBE evaluar cumplimiento y registrar
desviaciones. Una excepción requiere una enmienda explícita con alcance y justificación.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirmar fecha de adopción | **Last Amended**: 2026-10-22

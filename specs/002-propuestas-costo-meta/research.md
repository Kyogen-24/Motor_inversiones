# Investigación: propuestas de costo y meta — Nivel 2

Fecha: 2026-10-24. Revisada el 2026-10-25. Fuente normativa: [spec.md](spec.md), incluidas las cinco respuestas de aclaración, y constitución 1.0.0. Este documento conserva las decisiones de diseño; la evidencia de implementación y pruebas se mantiene en [quickstart.md](quickstart.md) y [Corrección y aceptación de nivel 2](../../docs/correccion-nivel-2.md).

## R1. Reutilización y límites de la entrega

**Decisión**: Mantener las cuatro capas y el stack instalado. Añadir dos casos de uso puros, `proponerCostos` y `proponerMeta`, sin cambiar el contrato `analizarCartola` ni `Analisis.versionReglas = nivel-1.1`. El resultado nuevo usa `nivel-2.0`.

**Razón**: La inspección que originó el plan confirmó separación entre importación, diagnóstico, R04 y presentación. Las 121 pruebas y `npm run typecheck` registrados entonces son evidencia de base del nivel 1, no de las capacidades propuestas. La evidencia posterior del nivel 2 se registra separadamente.

**Alternativas consideradas**: Sustituir el análisis existente o refactorizar toda la interfaz introduce regresiones sin resolver una necesidad del nivel 2. No se añaden servidor, almacenamiento, cuentas ni integraciones de mercado.

## R2. Contratos compartidos y entrada por modalidad

**Decisión**: Nuevos tipos en `src/domain/proposalModel.ts`, consumidos por aplicación y presentación; Zod permanece en infraestructura. Se conservan `Entradas` y `cargarEjemplo()` de tres archivos. Un mapa ampliado admite cinco clases de archivo y una unión de entradas exige tres para diagnóstico, cuatro para costo y cinco para meta.

**Razón**: ECC contract-first permite un contrato de tipos compartidos cuando todos los consumidores usan el mismo build. Se verificará además la forma serializada en pruebas. No hay frontera HTTP que justifique OpenAPI ni generación de clientes.

**Alternativas consideradas**: Tipos independientes en componentes y motor causan divergencia. Obligar a cargar una meta para costo bloquearía un recorrido independiente de la especificación.

## R3. Universo, retención y denominadores

**Decisión**: El costo y riesgo comparables usan la misma base computable de nivel 1, 230 millones CLP en el ejemplo; las exclusiones permanecen visibles y sin volatilidad inventada. Una posición ya poseída sin acuerdo puede retenerse, pero no recibir una nueva inversión. Gamma puede conservarse con riesgo y costo conocidos. Fondo agrupa todas sus series; AGF agrupa todos sus fondos. Depósitos/caja no son fondos ni AGF y no reciben esos máximos, aunque sí integran capital y crecimiento.

**Razón**: Distinguir lectura/tenencia/destino evita confundir conservación con recomendación fuera del acuerdo. En costo la suma retenida o reasignada debe ser exactamente la base computable original: no se permite excluir capital para fabricar ahorro o menor riesgo. En meta el denominador es el capital asignado, no toda la cartola. El capital de meta es un presupuesto declarado independiente: no se deducen ventas de posiciones concretas ni se atribuye origen a los 70 millones.

**Alternativas consideradas**: Usar 235 millones para mejorar artificialmente pesos, volatilidad o concentración; suponer riesgo cero para desconocidos; bloquear la retención Gamma. Se rechazan las tres.

## R4. Minimización de costo y búsqueda finita

**Decisión**: Búsqueda determinista de candidatos, no un solver numérico propio. Evaluar series y equivalentes sin cambiar los montos por categoría. Dentro de ese conjunto, priorizar menor TAC y usar retención, fase e identificadores como desempates estables; las comisiones y retornos no participan. Si no se encuentra una cartera admisible, ampliar a reparación necesaria de perfil/concentración, incluyendo efectivo y depósitos sin serie ni acuerdo de AGF. Probar repartos en importes relevantes: ticket de origen, mínimos, capacidad restante por fondo/AGF y montos de reparación de perfil. Comparar costo estrictamente menor; ante igualdad conservar tenencias y después usar identificadores estables.

**Razón**: Elegir el menor costo por posición sin revisar capacidades compartidas puede fallar; explorar alternativas y verificar la cartera final evita recomendaciones inválidas. Presupuesto global de 50.000 nodos por ejecución, incluyendo todos los soportes de meta sin reiniciar el contador. Un nodo cuenta cada estado de asignaciones parciales admitido para expansión; también la raíz de cada soporte. Orden y definición del contador se versionan con las reglas; sin fecha del equipo ni timeout para decidir el resultado. El límite es técnico, no representa una restricción financiera.

**Alternativas consideradas**: Greedy como prueba de óptimo/inviabilidad; simplex/MILP implementado desde cero; solver externo. Se investigó [jsLPSolver, repositorio oficial](https://github.com/JWally/jsLPSolver) y su [API](https://github.com/JWally/jsLPSolver/blob/master/API.md): soporta LP/MIP en navegador, pero incorporar un optimizador y adaptar su control de ejecución no elimina la necesidad de verificar las restricciones financieras. No se añade dependencia para esta entrega.

**Límite explícito**: La búsqueda minimiza entre candidatos admisibles explorados. Agotar sus candidatos o presupuesto no prueba un mínimo global ni la inexistencia de solución continua. Se informa `optimalidad = no_demostrada`, o `cota_alcanzada` únicamente con una cota inferior válida alcanzada por una solución verificada. Una búsqueda detenida informa `limite_alcanzado`; sin candidato devuelve `sin_candidato`, no «imposible». Solo se declara inviabilidad con una prueba independiente, como capacidad total insuficiente incluso en una relajación. La interfaz muestra «mejor propuesta encontrada» cuando no existe certificado. No se da por cumplida una búsqueda incompleta como prueba de minimización global.

## R5. Ticket final y precisión de acceso

**Decisión**: En costo los lotes originales se conservan separados para evaluar R04; una división reduce el ticket de cada destino y exige reevaluación. En meta el ticket es el monto final por fondo y serie sumando tramos, conservando reservas individuales. Reevaluar R04 tras cada reparación de capacidad o perfil, antes de aceptar una solución. Ampliar `evaluarAcceso` de `number` a `number | string` para tickets calculados, con conversión directa a la instancia decimal privada y sin vuelta a `number`.

**Razón**: Una asignación provisional no autoriza el ticket final. La consolidación aprobada para nuevas inversiones de meta no cambia las reglas de las posiciones existentes. Los condicionales se separan y nunca financian automáticamente una propuesta.

**Alternativas consideradas**: Evaluar mínimos sobre todo el capital, redondear tickets o juntar tenencias existentes: altera R04.

## R6. Fechas, plazos y liquidez

**Decisión**: Fechas civiles UTC sin reloj implícito. Años de VP/proyección = días reales / 365,25. Meses = aniversarios calendario completos más fracción hasta el siguiente aniversario, ajustando días inexistentes al último día del mes. Fronteras `[desde, hasta)` y último tramo abierto. Liquidez en días enteros se contrasta con los días reales hasta el primer pago que sirve la asignación; no con el extremo superior del tramo.

**Razón**: 60 meses calendario deben entrar en el tramo que empieza en 60, aun cuando ACT/365,25 multiplicado por 12 difiera ligeramente. El tramo final sin extremo no autoriza liquidez infinita.

**Alternativas consideradas**: Meses = años ACT × 12 y liquidez contra `hasta_meses`: producen fronteras o permisos incorrectos.

## R7. Selección por tramo y dependencia entre VP y asignación

**Decisión**: Enumerar conjuntos de categorías efectivas en el orden declarado del tramo. Para cada conjunto, `r_real` es su promedio aritmético simple de retornos brutos, cada categoría una vez. Calcular los VP con esa tasa; distribuir en orden cronológico, llenar candidatos por categoría/menor TAC con sus capacidades y mínimos, consolidar tickets y verificar que todas y solo las categorías supuestas recibieron monto positivo. Si no coincide el soporte o un ticket no es elegible, descartar esa combinación y continuar. La búsqueda y sus estados usan R4; no se acepta una iteración que no converja como solución.

**Razón**: Concentración puede obligar a añadir categorías, lo que cambia el promedio usado en el VP. Enumerar soportes con comprobación final evita fijar silenciosamente una tasa anterior. Entre alternativas del mismo orden de categorías se prioriza menor TAC; el retorno nunca se maximiza para tapar una brecha. El perfil y concentración son restricciones duras.

**Alternativas consideradas**: VP congelado con todas las categorías del archivo o repetición sin comprobar convergencia. No coincide con FR-010, que usa categorías efectivamente seleccionadas.

**Aplicación del capital**: Reservar VP de pagos próximos primero; remanente al primer pago incompleto; excedente al tramo ocupado más largo. Si allí no puede invertirse respetando las reglas, registrar `capitalNoAsignable`, mostrar propuesta parcial y no inventar un destino fuera de categoría. Ese importe no cuenta como capital invertido ni financia escenarios. Los pesos conservan denominador de capital asignado para no ocultar la parte no invertida.

## R8. Trayectoria neta y costo acumulado

**Decisión**: Proyectar saldos por instrumento desde la fecha de referencia hasta cada aniversario mensual o fecha de pago, lo que ocurra primero. Para intervalo de longitud `dt` años, `g` bruto ajustado por escenario y `c` TAC, ambos fraccionarios: `n = g − c`; `S_pre = S_inicio × (1 + n)^dt`. El costo informativo del intervalo es `(S_inicio + S_pre) / 2 × c × dt`. Después se aplica el retiro. Acumular costo por instrumento y convertir UF a CLP únicamente con la referencia declarada.

**Razón**: Es la convención explícita de R03 con retorno neto anual efectivo y aproximación por saldo medio. `S_pre` es previo al retiro: un desembolso no reduce retroactivamente el costo del intervalo. El costo acumulado se presenta como estimación informativa, no como otro débito; la trayectoria ya descontó TAC al usar `n`.

**Alternativas consideradas**: Descontar de nuevo el costo por saldo medio duplica TAC. Usar saldo después de retiro para el promedio subestima el costo anterior al pago. No igualar la estimación de costo a una factura o a la diferencia exacta entre dos trayectorias capitalizadas.

**Validación numérica**: Requerir `1 + n > 0` en los tres escenarios para toda categoría/serie proyectada; en otro caso el resultado afectado requiere corrección de supuestos, sin ocultar ni truncar tasas. Se permiten retornos negativos dentro de ese dominio.

## R9. Retiros, composición y escenarios

**Decisión**: La mezcla inicial de cada tramo permanece en sus instrumentos; no hay rebalanceo ni nuevas contrataciones futuras implícitas. Un pago consume primero el saldo de su tramo; para cada instrumento respetar la liquidez y vender proporcionalmente a los saldos disponibles en ese tramo. Si falta, usar únicamente excedentes de tramos que ya no tengan pagos pendientes, en orden de plazo; no consumir reservas de pagos posteriores. Registrar todas las transferencias entre reservas. Cada rescate se programa con los días de liquidez de antelación; un excedente solo puede transferirse si entre la fecha en que queda libre y el pago hay días suficientes para liquidarlo. La aproximación capitaliza hasta la liquidación; no supone disponibilidad inmediata de instrumentos ilíquidos.

**Razón**: Las transferencias de excedentes ya liberados no comprometen las reservas futuras. Un pago parcialmente financiado cuenta en cobertura por monto. Los tres escenarios usan el mismo plan inicial y política de retiros; solo cambia `g`. Los pesos de mercado pueden variar por evolución y retiros: FR-017 congela decisiones y restricciones de entrada, no impone pesos de mercado constantes sin operaciones.

**Alternativas consideradas**: Volver a optimizar cada escenario o vender sin plazo; usar saldos de una cuenta agotada que ignoren dinero disponible en otras. El diseño no incluye un servicio futuro de gestión ni garantiza que un perfil se mantenga automáticamente durante años.

## R10. Conclusión, cobertura y brechas

**Decisión**: `deficitVpUf`/`excedenteVpUf` explican la asignación inicial. `pendienteBaseUf` suma UF no pagadas en sus fechas en escenario base; determina «alcanza» solo si es cero. El pendiente no es una estimación de cuánto capital adicional se necesita hoy: esa búsqueda inversa está fuera de alcance. Cobertura = UF pagadas / UF exigidas × 100, incluso parcial. Agotamiento = primera fecha en que el saldo agregado invertido llega a cero. Mantener aparte `primeraFechaPagoPendiente`: una reserva corta o un saldo ilíquido con otras reservas positivas no constituye agotamiento total. No inventar agotamiento entre pagos mientras existan saldos positivos.

**Razón**: Las aclaraciones 2–4 distinguen cronología, monto financiado y VP bruto frente a resultado neto. CLP de referencia no es una previsión de UF futura.

**Capital cero**: Meta válida con presupuesto cero devuelve `sin_candidato`, motivo `capital_cero`, y tres resúmenes de escenario sin inversiones: saldo/pagado/costo/cobertura cero, pendientes iguales a los desembolsos y conclusión negativa. Riesgo/retornos, VP de selección y pesos son null, no supuestos cero. No se realiza búsqueda ni se afirma un soporte de inversión efectivo para una cartera vacía.

**Alternativas consideradas**: Contar pagos completos, declarar éxito solo por VP o usar escenario favorable como conclusión principal.

## R11. Validación, límites y evidencia

**Decisión**: Conservar 5 MB/archivo y límites de nivel 1. Añadir hasta 1.000 pagos, 100 tramos y las nueve categorías originales; hasta 9 categorías por tramo, con presupuesto de búsqueda R4 para combinaciones. No definir una extensión de familias en este nivel: categoría desconocida necesaria impide la propuesta. Metadatos generales `version`, `fecha` y `fuente` de supuestos son opcionales para aceptar el original; si faltan, declarar no informados y conservar el nombre del archivo y fecha UF, sin fabricar fuente histórica. Meta y supuestos deben usar el mismo valor UF y fecha, coincidentes con el corte; referencia de cliente debe coincidir. No introducir una caducidad de perfil no especificada.

**Razón**: Todas las entradas normativas del ejemplo se conservan. El dominio valida referencias y rangos además de Zod. Un archivo ajeno a una modalidad no bloquea otra válida.

**Presentación**: CLP 0 decimales, UF 4, TAC/riesgo/retornos 4, pesos/cobertura 2; `ROUND_HALF_UP`. Decisiones sobre valores internos de 40 dígitos significativos; tolerancia de comparación numérica 10^-24 en tasas/pesos y 10^-16 UF o CLP en residuos algebraicos, jamás aplicada para acreditar mínimos o permitir sobrepasar límites: si aparece un exceso, reparar y revalidar. No redondear al calcular.

## R12. Verificación y fuentes de trabajo

**Decisión**: Karpathy orienta cambios pequeños y aceptación por invariantes; ECC fija la autoridad compartida de contratos; tres agentes revisaron costo, proyección y entrada/UX de forma independiente. Codebase Memory orientó búsquedas de `analizarCartola`, `evaluarAcceso`, `interpretar`, `validarNegocio` y `App`; generación consultada 2026-10-24T00:16:37Z. La cobertura marcó archivos cambiados y se leyeron sus fuentes actuales; no se interpreta el índice como prueba exhaustiva. La decisión del solver usa la documentación primaria enlazada en R4.

**Alternativas consideradas**: Introducir pipelines ECC de implementación, publicación o agentes que escriban código durante Plan. El comando termina con diseño de fase 1. Los archivos de código, dependencias y ejemplos nuevos se crearán al implementar.

**Resultado de investigación**: Se resuelven método de riesgo, proyección, VP/soportes, ticket, búsqueda, errores, precisión y contratos. No quedan decisiones técnicas abiertas para elaborar tareas; las limitaciones de búsqueda y el alcance de las proyecciones son parte explícita del diseño y deben validarse al implementar.

**Revisión cruzada final**: Se incorporaron observaciones de los tres agentes: conservación completa de capital en costo; resultado degenerado explícito de meta sin capital; categorías originales sin extensión de familia implícita; presupuesto global por ejecución; y un segundo oráculo de cobertura (220 UF de 660 UF = 33,3333… %) que detecta la confusión con conteo de pagos. No se abrió alcance de implementación.

# Contrato del análisis puro — Nivel 1

## Frontera y módulos reales

AnalizarCartola recibe cartola, catálogo y acuerdos normalizados y devuelve un Analisis con versionReglas nivel-1.1. Es una función síncrona: si falla validarNegocio, lanza Error. No devuelve una unión discriminada ok/error ni un resultado financiero parcial.

| Archivo | Responsabilidad |
| --- | --- |
| src/application/analizarCartola.ts | Coordina validación, diagnóstico por posición, totales y contexto |
| src/domain/validation.ts | Coherencia de referencias, unicidad, fechas y magnitudes |
| src/domain/diagnosis.ts | Clasificación, costo, valorización y comparación por posición |
| src/domain/eligibility.ts | Vigencia, primera coincidencia R04 y tareas condicionales |
| src/domain/numeric.ts | Decimal privado, sumas, porcentajes, fechas y límites numéricos |
| src/domain/model.ts | Entradas y tipos de resultado del nivel 1 |

Aplicación y dominio no importan React, Zod, File ni lectores de infraestructura. No consultan la fecha actual del dispositivo. Las pruebas usan entradas congeladas para comprobar que el cálculo no las modifica; eso no significa que la importación congele los objetos ni que todos los tipos sean profundamente readonly.

## Política numérica

El constructor privado de decimal.js utiliza 40 dígitos significativos y ROUND_HALF_UP. Las entradas contienen números JSON; los resultados monetarios y tasas calculadas se serializan como texto decimal o nulo. La precisión decimal de trabajo no elimina las limitaciones previas de JSON.parse.

- Costo de una posición = monto × TAC porcentual / 100.
- Peso porcentual = monto / base computable × 100.
- TAC agregada = costo anual total / base computable × 100.
- Ahorro CLP = monto × (TAC actual − TAC elegible) / 100.
- Ahorro en puntos base = (TAC actual − TAC elegible) × 100.
- La valorización se comprueba con diferencia absoluta mayor de 1 CLP.
- La presentación redondea CLP al peso, TAC agregada a cuatro decimales y pesos a dos. No se reutilizan importes presentados para decidir acceso o ahorro.

Las divisiones periódicas usan la precisión de trabajo; no se promete exactitud decimal infinita ni transporte sin pérdida de tokens JSON arbitrarios.

## Identificación y cálculo por posición

El fondo mutuo o de inversión es computable si su serie actual se reconoce. Efectivo y depósitos computan a costo cero. Un ETF requiere tac_pct en el producto. Seguros, other y productos reconocidos sin costo verificable quedan excluidos. Un producto o serie actual desconocidos se clasifica como unidentified.

El monto declarado permanece como base. Cuando faltan cuotas o valor cuota en un fondo, se genera SIN_VALORIZACION; una diferencia superior al umbral genera VALORIZACION, con ambos montos y diferencia.

## R04 y patrimonio al corte

La evaluación sigue acuerdo/habilitación, cierre, APV, mandato, agregación y mínimo. La etiqueta de tenencia se conserva aparte en Acceso.actual.

Solo con ticket inferior al mínimo y sin regla anterior se considera el patrimonio. Si patrimonio_al es posterior al corte, la alternativa es blocked por regla 5 con motivo temporal. El resultado conserva el dato declarado y la razón de descarte. Las series con ticket suficiente y los estados anteriores no se alteran.

Una condición por mandato exige formalizarlo y reevaluar. Si el mínimo sigue incumplido, las tareas exigen acreditar patrimonio suficiente al corte o alcanzar el mínimo con el ticket.

## Selección y ahorro

La comparación solo recorre series del mismo producto y AGF. Una alternativa elegible necesita TAC estrictamente menor y monto de posición positivo para producir cambio. Las mejoras empatadas se ordenan por código de serie; empates conserva sus códigos. Si ninguna mejora, elegida mantiene la serie original.

Condicional contiene como máximo la mejor reducción adicional positiva por posición respecto de la elegible aplicada o de la actual. Sus tareas no equivalen a elegibilidad automática. El total condicional suma una magnitud por posición, no todas las series alternativas.

Las comisiones no forman parte del costo ni de la comparación. La habilitación usa presencia de la clave, aunque su valor sea cero.

## Salida y evidencia

Analisis contiene contexto clonado, posiciones, totales y nombres de acuerdos vigentes. Cada ResultadoPosicion conserva su índice, entrada, identificación, clasificación, motivo, monto, peso, TAC/costo, alternativas, elegida, posterior, ahorro, puntos base, empates, condicional y advertencias.

Cada Acceso conserva serie, actual, estado, regla, motivo y evidencia: ticket, mínimo, agregado y fecha, corte, mandato, APV, habilitación, vigencia, inicio y fin. No existe un tipo separado EvaluacionSerie con códigos de motivo adicionales.

Totales distingue monto total, identificado, computable, sinIdentificar y excluido. Identificado incluye productos reconocidos excluidos; la base de TAC es computable. Hay conteos y medidas de ahorro, posterior y adicional condicional.

Los textos de motivo se originan también en dominio; la salida no se limita a códigos que React deba traducir. El contexto se copia con structuredClone, sin congelación profunda obligatoria de todo el resultado.

## Invariantes

1. Total = computable + sin identificar + excluido.
2. Base computable y montos se conservan antes y después.
3. Costo actual − ahorro elegible = costo posterior, antes del redondeo.
4. Ningún cambio sale del fondo o AGF ni usa una alternativa condicional, bloqueada o fuera de alcance.
5. Tenencia actual no concede acceso.
6. Base cero produce TAC/pesos nulos y costo computable cero; no se inventa una TAC para información faltante.
7. Repetir entradas produce los mismos resultados sin mutarlas.
8. Los errores de coherencia impiden devolver el análisis; las advertencias de valorización y posiciones desconocidas permiten continuar.

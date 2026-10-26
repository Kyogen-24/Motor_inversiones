# Modelo de datos — Nivel 1

Las reglas están en [spec.md](spec.md). Los tipos implementados se mantienen en src/domain/model.ts y el contrato de cálculo en [analysis.md](contracts/analysis.md). Este modelo describe los nombres y relaciones reales del proyecto.

## Tipos y unidades

Las entradas usan números JSON. Los importes, porcentajes y puntos base calculados se entregan como cadenas decimales; las cantidades que no corresponden o no pueden calcularse se expresan con null. No se implementaron tipos nominales MontoCLP o DecimalTexto ni congelación profunda de todos los contratos.

El motor usa una instancia privada de decimal.js con 40 dígitos. Los límites de importación y la pérdida potencial previa de JSON.parse están en [input-json.md](contracts/input-json.md).

## Entradas

| Tipo | Campos principales |
| --- | --- |
| Cartola | cliente, corte, moneda y posiciones |
| Cliente | referencia, perfil_riesgo, perfil_evaluado_el y plan_apv; todos obligatorios |
| Posicion | producto y serie nulos o texto; descripcion_original opcional; monto_clp obligatorio; cuotas y valor_cuota nulos o número |
| Catalogo | version, corte_costos, fuente_costos, emisores y productos |
| Producto | id, emisor, nombre, tipo, categoria, liquidez_dias, series y tac_pct opcional |
| Serie | codigo, tac_pct, minimo_clp, abierta, solo_apv y requiere_mandato |
| Acuerdo | emisor, estado, vigente_desde, vigente_hasta, mandato, patrimonio_agregado_clp, patrimonio_al y series |
| Acuerdos | distribuidor, acuerdos y productos_sin_serie |

El índice de una posición se incorpora al resultado; no se exige como campo del JSON. Cada serie pertenece al producto que la contiene. El costo de un ETF se declara como tac_pct, no costo_anual_pct.

Un acuerdo por emisor es la condición de unicidad actual, incluso para registros históricos. La vigencia se decide después con el corte; no se consolidan varios registros para una AGF.

## Clasificación y conciliación

| Código del resultado | Significado |
| --- | --- |
| computable | Producto y costo reconocidos; incluye efectivo y depósitos a cero |
| unidentified | Producto o serie actual sin identificar; conserva monto y motivo |
| excluded | Producto reconocido que no integra la base de TAC |

Los códigos son los anteriores, no no_identificada/excluida; sus etiquetas de pantalla están en español. Las exclusiones se diferencian por tipo y motivo, sin un desglose estructurado adicional por cada familia.

Monto total = computable + sinIdentificar + excluido. Identificado suma las posiciones reconocidas, incluidas las exclusiones. No equivale necesariamente a computable.

Si el total es cero, porcentajeSinIdentificar es nulo. Si la base computable es cero, TAC y pesos son nulos y el costo computable es cero.

## Evaluaciones de acceso

Acceso contiene la serie, la marca actual, estado, regla, motivo y evidencia. Estado puede ser eligible, conditional, blocked u out_of_scope. Actual es una marca de tenencia independiente del permiso de contratación.

La evidencia contiene ticket, mínimo, patrimonio agregado y su fecha, corte, mandato, plan APV, habilitación, vigencia e inicio/fin del acuerdo.

El patrimonio posterior no acredita mínimos al corte: cuando se necesita agregación y no se aplicó una regla previa, produce blocked por regla 5. No es un error que invalide el archivo de acuerdos. El ticket es siempre individual para nivel 1.

## Resultado por posición

ResultadoPosicion incluye:

- Identidad: indice, entrada, nombre, emisor y tipo.
- Diagnóstico: clasificacion, motivo, monto, peso, tac y costo.
- Comparación: alternativas, elegida, tacPosterior, costoPosterior, ahorro, bps y empates.
- Condicional: serie, TAC, adicional y tareas, o nulo.
- Advertencias: código y mensaje; en valorización, declarado, calculado y diferencia.

La elegida puede ser la actual sin mejora. Empates contiene las alternativas de menor TAC elegible que reducen costo; el código de serie resuelve la elección de forma estable.

## Resultado agregado

Analisis usa versionReglas nivel-1.1 y conserva contexto de cartola, catálogo y acuerdos con structuredClone, posiciones, totales y acuerdosVigentes.

Totales incluye monto, identificado, computable, sinIdentificar, porcentajeSinIdentificar, excluido, costo, tac, ahorro, costoPosterior, tacPosterior, condicional, porcentajes de ahorro/posterior y conteos.

No existe una unión de salida ok/error. Un error de validación semántica lanza Error; la infraestructura y la presentación lo convierten en un aviso del archivo cuando identifican su ruta.

## Mutación, carga y límites

El caso de uso no modifica las entradas y las pruebas lo comprueban con objetos congelados. Eso no significa que la importación produzca objetos congelados ni que exista una instantánea documental de nivel 3.

La carga mantiene revisiones y descarta respuestas obsoletas. Cambiar un archivo retira el resultado anterior como vigente; limpiar o recargar vacía el estado. No hay historial, persistencia, confirmaciones guardadas ni documento firmado.

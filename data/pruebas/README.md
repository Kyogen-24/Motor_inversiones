# Datos para probar la aplicación

Cada carpeta `01` a `04` contiene un conjunto completo: selecciona su `cartola.json`, `catalogo.json` y `acuerdos.json` en las secciones correspondientes. No mezcles conjuntos. Los archivos originales de `data/` siguen disponibles.

Son entradas manuales; la aplicación no las carga automáticamente. Esta carpeta contiene solo datos de prueba, nunca archivos reales de clientes.

## Escenarios válidos

Valores de referencia calculados a partir de los datos; pendientes de comprobar en la aplicación.

| Carpeta | Qué revisar | Costo anual actual | Ahorro anual elegible | Costo anual posterior |
|---|---|---:|---:|---:|
| `01-cambios-y-condiciones` | Norte pasa de BASE a B y Sur de BASE a B. Norte M requiere mandato; P requiere confirmar agregación. APV y CERRADA están bloqueadas. | $800.000 | $400.000 | $400.000 |
| `02-apv-y-mandato` | Cliente con APV y mandato Norte: Norte pasa a M y Sur a APV. | $800.000 | $580.000 | $220.000 |
| `03-acuerdos-vencidos` | Ambos acuerdos vencieron antes del corte: no corresponde proponer cambios. | $800.000 | $0 | $800.000 |
| `04-sin-ahorro` | El cliente ya tiene B en ambos fondos. No hay alternativas más baratas elegibles ni condicionales. | $400.000 | $0 | $400.000 |

En todos: patrimonio total $40.000.000, base TAC $35.000.000, monto sin identificar $2.000.000 y seguro excluido de TAC por $3.000.000. El depósito de $5.000.000 integra la base con costo cero. Cuotas y valores de cuota de los fondos coinciden con los montos.

En `01`, la mejor oportunidad condicional es M: $60.000 adicionales al ahorro elegible, sujetos a formalizar el mandato. P es otra alternativa condicional, con ahorro adicional menor; no se deben sumar ambas oportunidades del mismo fondo.

## Archivos con errores

Carga primero los tres archivos de `01-cambios-y-condiciones`. Después reemplaza **solo el archivo indicado**, analiza y revisa el aviso. Restaura el original de `01` antes del siguiente caso.

| Archivo de `05-errores/` | Sección | Aviso esperado |
|---|---|---|
| `cartola-sin-monto.json` | Cartola | Falta el monto en CLP de la posición 1. |
| `cartola-monto-negativo.json` | Cartola | El monto de la posición 2 no tiene un valor permitido. |
| `catalogo-sin-tac.json` | Catálogo | Falta el costo anual TAC de la serie 2 del producto 1. |
| `acuerdos-serie-inexistente.json` | Acuerdos | La serie NO-EXISTE no aparece en el catálogo. |

Para comprobar la identificación por contenido, selecciona un `catalogo.json` en Cartola y un `cartola.json` en Catálogo a la vez: ambos deben marcarse para revisión. Renombrar un archivo correcto no cambia su tipo.

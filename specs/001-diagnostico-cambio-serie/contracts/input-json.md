# Contrato de entrada JSON — Nivel 1

## Recorrido de carga

El diagnóstico requiere cartola, catálogo y acuerdos seleccionados manualmente. Los archivos se leen con File.text, se retira un BOM UTF-8 inicial si existe y se interpretan con JSON.parse. Zod comprueba estructura y aplica únicamente los valores predeterminados documentados. La coherencia entre archivos se verifica antes del cálculo.

No se utiliza lossless-json ni un lector que preserve el lexema numérico original. Los números pasan primero por Number de JavaScript; convertirlos después a decimal no recupera precisión que ya se haya perdido. Tampoco existe una comprobación específica de claves JSON repetidas: JSON.parse conserva el último valor. La documentación no debe atribuir rechazo de esos casos a esta implementación.

Los importes JSON son números, no strings. No se convierten textos numéricos, booleanos ni nulos en importes. Los objetos abiertos conservan campos adicionales para previsualización, sin usarlos como reglas financieras.

## Cartola

| Campo | Condición |
| --- | --- |
| cliente.referencia | Texto obligatorio |
| cliente.perfil_riesgo | Texto obligatorio; se conserva, sin evaluar caducidad en nivel 1 |
| cliente.perfil_evaluado_el | Fecha obligatoria |
| cliente.plan_apv | Booleano obligatorio |
| corte | Fecha civil de análisis |
| moneda | CLP |
| posiciones | Lista de hasta 10.000 registros; puede estar vacía |
| posiciones[].producto y serie | Texto o nulo explícito |
| posiciones[].descripcion_original | Texto opcional |
| posiciones[].monto_clp | Número obligatorio no negativo |
| posiciones[].cuotas y valor_cuota | Número no negativo o nulo explícito |

Un identificador de producto o serie que no esté en el catálogo no invalida por sí mismo la cartola: la línea conserva monto y motivo como sin identificar. Una posición repetida conserva su identidad y ticket individual.

## Catálogo

Version, corte_costos, fuente_costos, emisores y productos son obligatorios. Cada producto declara id, emisor, nombre, tipo, categoria, liquidez_dias y una lista de series.

Los tipos admitidos son mutual_fund, investment_fund, equity_etf, time_deposit, cash, insurance_savings y other. Un fondo mutuo o de inversión debe tener series. Cada serie exige codigo, tac_pct y minimo_clp; una TAC de serie ausente es un error de estructura, no una serie válida con costo desconocido.

Solo se completan las banderas omitidas:

| Campo | Valor predeterminado |
| --- | --- |
| abierta | true |
| solo_apv | false |
| requiere_mandato | false |

Un ETF puede declarar tac_pct en el producto. Este es el campo utilizado; costo_anual_pct no es un alias reconocido. Un ETF sin tac_pct queda excluido del costo computable. Efectivo y depósitos computan con costo cero y sin serie; seguros y other permanecen reconocidos y excluidos.

## Acuerdos

Se requiere distribuidor y la lista acuerdos. Cada acuerdo declara emisor, estado, vigente_desde, vigente_hasta (fecha o nulo), mandato, patrimonio_agregado_clp, patrimonio_al y series, con el mapa producto → serie → comisión.

Productos_sin_serie es un mapa opcional que se completa como objeto vacío si se omite. La existencia de una clave de serie habilita su evaluación; una comisión cero no la deshabilita.

Se permite un solo acuerdo por emisor en el archivo completo. Dos registros del mismo emisor se rechazan, aunque sean históricos o solo uno esté vigente. Debe prepararse un archivo sin duplicados; el motor no selecciona automáticamente el registro más reciente.

Una fecha de patrimonio posterior, si es válida como fecha, se admite como dato. Al necesitar agregación, R04 descarta ese patrimonio para acreditar el mínimo y bloquea la alternativa por regla 5. No rechaza la cartola ni modifica una regla anterior.

## Límites efectivos

| Dato | Límite |
| --- | --- |
| Tamaño de archivo | 5 × 1024 × 1024 bytes; la interfaz lo denomina 5 MB |
| Posiciones | 10.000 |
| Productos, emisores y acuerdos | 1.000 por lista |
| Series | 100 por producto; no hay un máximo global de 10.000 series |
| Texto de los campos del contrato | De 1 a 500 caracteres, sin texto formado solo por espacios; no se atribuye este límite a todo campo adicional |
| Valores numéricos de entrada | Finitos y no negativos, hasta 10^15 |
| Montos, cuotas, valor cuota y mínimos comprobados por dominio | Hasta 16 dígitos significativos; cero o valor positivo desde 10^-8 |
| TAC y comisiones | Hasta 100 %; la validación de negocio comprueba también su representación numérica |
| Fechas | AAAA-MM-DD, calendario válido entre 1900-01-01 y 2200-12-31 |

No existe un límite general de ocho decimales. Una entrada puede tener más decimales si cumple los límites que le correspondan. La notación exponencial se procesa mediante JSON.parse y las validaciones posteriores; no hay una fase de expansión de lexemas sin Number.

Los límites pertenecen a los campos y etapas donde se comprueban. No se atribuye a todos los campos una validación de 16 dígitos que solo se ejecuta para determinadas magnitudes del dominio. Los totales calculados no heredan el máximo individual de un monto.

## Errores y validación semántica

La importación diferencia lectura, sintaxis y estructura. ErrorArchivo conserva tipo de archivo y mensaje; los problemas de esquema señalan rutas y muestran hasta ocho, con cantidad adicional. No devuelve el contrato estructurado de etapa/código/evidencia que describía la copia original.

ValidarNegocio comprueba unicidad de emisores, productos, series por producto y acuerdos por emisor; referencias internas; fechas y orden de vigencia; montos y costos necesarios. Una referencia rota dentro de catálogo o acuerdos es un error; un producto desconocido de la cartola es un resultado permitido.

Un acuerdo vencido o una serie cerrada son datos válidos con consecuencias de acceso. La fecha posterior del patrimonio pertenece a esa evaluación, no a un rechazo semántico global.

Todos los archivos admiten alternativamente [CSV](input-csv.md), convertido al mismo esquema antes de analizar. Este contrato describe la ruta de importación JSON.

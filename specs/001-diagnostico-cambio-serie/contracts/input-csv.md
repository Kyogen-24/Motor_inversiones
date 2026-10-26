# Contratos de entrada CSV

Los cinco archivos admiten JSON o CSV, combinados libremente en una misma carga. Ambos formatos llegan al mismo modelo, esquema de validación y motor; CSV no cambia las reglas financieras. Los archivos se interpretan según el control donde se cargan.

La cartola usa una fila por posición. Catálogo, acuerdos, supuestos y meta usan una tabla de rutas tipadas, que conserva sus listas, relaciones y campos adicionales sin exigir JSON dentro de una celda. Las dos variantes comparten la lectura de separadores y comillas.

El archivo usa UTF-8, con BOM opcional, y una cabecera. Se admite coma o punto y coma como separador, detectado en la cabecera. Cada registro representa una posición. Los campos que contienen el separador, saltos de línea o comillas se encierran entre comillas dobles; una comilla dentro del campo se escribe dos veces. Se aceptan saltos de línea LF y CRLF y se omiten líneas vacías.

## Cartola: columnas por posición

El orden puede cambiar; los nombres deben coincidir exactamente. Se rechazan columnas duplicadas, desconocidas o ausentes y registros con una cantidad de campos distinta de la cabecera.

| Columnas | Contenido |
| --- | --- |
| `referencia`, `perfil_riesgo` | Identificador del cliente y perfil declarado |
| `perfil_evaluado_el`, `corte` | Fechas `AAAA-MM-DD` |
| `plan_apv` | Literal `true` o `false` |
| `moneda` | Literal `CLP` |
| `producto`, `serie` | Identificadores exactos; campo vacío o literal `null` para un valor nulo |
| `cuotas`, `valor_cuota` | Números; campo vacío o literal `null` cuando no se informan |
| `monto_clp` | Número obligatorio; un campo vacío no equivale a cero |
| `descripcion_original` | Texto opcional; es la única columna que puede omitirse |

Los datos del cliente, perfil, condición APV, corte y moneda se repiten idénticos en todas las filas. Las diferencias se rechazan para evitar combinar clientes o cortes. Los identificadores no se recortan ni se buscan por aproximación.

Los números admiten punto o coma decimal, sin separadores de miles ni símbolos monetarios; con separador de columnas coma, una coma decimal requiere un campo entre comillas. Se admite notación exponencial dentro de los mismos límites numéricos. Se comprueban hasta 16 dígitos significativos antes de convertir a Number y se rechaza una conversión que pierda valor decimal. Los importes admiten cero o valores positivos entre 10^-8 y 10^15. No se redondean entradas para hacerlas válidas.

El límite es 5 MB y 10.000 posiciones. Los errores de CSV indican el registro y el campo cuando corresponde; el registro 1 es la cabecera. Las validaciones posteriores del esquema identifican la posición y el campo del modelo común.

La referencia completa está en [data/cartola.csv](../../../data/cartola.csv). Las pruebas de importación verifican que esa cartola y su versión JSON produzcan el mismo diagnóstico y las mismas propuestas de costo y meta.

## Catálogo, acuerdos, supuestos y meta: rutas tipadas

La cabecera contiene exactamente `ruta`, `tipo` y `valor`, en cualquier orden. Cada registro declara un campo o un contenedor del documento. Los registros pueden reordenarse sin cambiar el resultado.

| Columna | Contenido |
| --- | --- |
| `ruta` | Ubicación del campo en formato JSON Pointer; la raíz se escribe como celda vacía |
| `tipo` | `objeto`, `lista`, `texto`, `numero`, `booleano` o `nulo` |
| `valor` | Contenido del campo; vacío para objetos, listas y nulos |

Se incluye un registro de raíz de tipo `objeto`. Cada objeto o lista padre debe tener su propio registro, aunque esté vacío. Las listas utilizan índices consecutivos desde 0. En las claves, `/` se representa con `~1` y `~` con `~0`; una clave numérica dentro de un objeto sigue siendo una clave, no un índice de lista.

En el catálogo, la ruta `/productos/0/series/1/minimo_clp` permite editar el mínimo de esa serie. En acuerdos, las comisiones permanecen bajo `/acuerdos/…/series/…`. En supuestos, los retornos conservan sus categorías y los escenarios sus ajustes. En meta, cada desembolso mantiene su fecha y monto dentro de `/desembolsos/…`. Las rutas son las mismas que la estructura JSON, sin abreviar ni renombrar campos.

Un `texto` vacío es una cadena vacía; no se convierte en nulo. Un `booleano` admite únicamente `true` o `false`. Un `numero` admite signo y punto o coma decimal, sin separadores de miles; se comprueba que sea finito, tenga hasta 16 dígitos significativos y conserve el valor al convertirlo a Number. Después, el esquema y las reglas aplican los límites del campo: por ejemplo, permiten retornos negativos y rechazan montos o TAC negativos.

Se rechazan rutas repetidas o inválidas, padres ausentes, hijos de valores escalares, listas con huecos, índices inválidos y tipos desconocidos. El límite es 5 MB, 100.000 registros de datos y 50 componentes por ruta; los límites de productos, series, acuerdos, tramos y pagos del modelo común también se mantienen.

Las referencias completas están en [catalogo.csv](../../../data/catalogo.csv), [acuerdos.csv](../../../data/acuerdos.csv), [supuestos.csv](../../../data/supuestos.csv) y [meta.csv](../../../data/meta.csv). Las pruebas comparan sus datos completos con los JSON y verifican las mismas salidas del motor. Esta decisión conserva la estructura anidada y permite editar datos en una hoja de cálculo sin inferir relaciones por el orden de las filas.

# Contrato de importación — Nivel 2

## Compatibilidad y autoridad

`src/infrastructure/input.ts` reconoce las claves `supuestos` y `meta`, además de las entradas de nivel 1. Las definiciones tipadas compartidas están en `src/domain/proposalModel.ts`; Zod valida estructura y funciones puras validan relaciones y reglas. Este documento define la semántica que ambas capas verifican; React no mantiene modelos independientes.

Las cinco entradas admiten JSON o CSV, combinados libremente. Supuestos y meta utilizan el CSV de rutas tipadas del [contrato común](../../001-diagnostico-cambio-serie/contracts/input-csv.md), que reconstruye la estructura completa antes de validar. Las versiones de referencia son `data/supuestos.csv` y `data/meta.csv`. El formato no cambia retornos, restricciones, cálculos ni reglas de selección.

| Recorrido | Archivos requeridos | Resultado |
| --- | --- | --- |
| Diagnóstico | cartola, catálogo, acuerdos | `Analisis`, `nivel-1.1` |
| Mejora de costo | los tres anteriores y supuestos | Propuesta costo, `nivel-2.0` |
| Meta | los cuatro anteriores y meta | Propuesta meta, `nivel-2.0` |

No cargar ejemplos automáticamente. Un archivo meta ausente o inválido no bloquea diagnóstico/costo. Supuestos ausentes no bloquean nivel 1. Reemplazar cualquier archivo retira inmediatamente las cifras que dependen de él y conserva las otras cargas válidas.

## Supuestos

Se acepta el objeto original de `supuestos.json` conservado en el contexto del nivel 1:

| Ruta | Tipo y unidad | Condición |
| --- | --- | --- |
| `uf.valor_clp` | número CLP/UF | Positivo, límites numéricos existentes |
| `uf.fecha` | AAAA-MM-DD | Igual al corte; no usar una UF actual de internet |
| `categorias.<id>.retorno_real_bruto_pct` | número % anual real | Con signo, entre −100 y 100; validar además dominio neto de las trayectorias |
| `categorias.<id>.volatilidad_pct` | número % | 0–100 |
| `categorias.<id>.peso_crecimiento` | número fraccionario | `rv_chile`/`rv_global`: 1; `balanceado`: 0,5; restantes categorías admitidas: 0 |
| `perfiles.<id>.max_crecimiento_pct` | número % | 0–100; debe existir el perfil del cliente |
| `limites.max_por_fondo_pct` | número % | 0–100 |
| `limites.max_por_agf_pct` | número % | 0–100 |
| `tramos[]` | lista ordenada | Hasta 100; IDs únicos, intervalos contiguos no vacíos desde 0, último abierto |
| `tramos[].desde_meses` | entero meses | No negativo, inclusivo |
| `tramos[].hasta_meses` | entero meses o null | Mayor que desde; exclusivo; null solo en último tramo |
| `tramos[].categorias[]` | lista de IDs | 1–9 existentes sin duplicados; el orden es prioridad de selección |
| `escenarios[]` | lista | Exactamente adverso −1,5 pp, base 0, favorable +1,5 pp, IDs sin duplicados |

Hasta 9 categorías y 100 perfiles; los IDs son cadenas no vacías. Categorías utilizables: `caja`, `deposito_plazo`, `deuda_corto_clp`, `deuda_uf_corto`, `deuda_uf_mediano`, `deuda_uf_largo`, `balanceado`, `rv_chile`, `rv_global`. Una categoría necesaria desconocida o sin supuesto impide el resultado afectado: nunca se asume volatilidad cero. No se añade campo de familia ni se infiere por el nombre del fondo; una extensión a otras categorías requiere un contrato posterior.

`version`, `fecha`, `fuente` y `_aviso` generales son opcionales. Conservar los declarados; si faltan, indicar «no informado». No convertir el nombre de archivo ni su fecha de carga en versión, fuente de mercado o fecha del supuesto. `uf.fecha` identifica solo la referencia de conversión. La previsualización conserva campos adicionales originales.

## Meta

| Ruta | Tipo y unidad | Condición |
| --- | --- | --- |
| `tipo`, `nombre` | texto | No vacío |
| `referencia_cliente` | texto | Igual a `cartola.cliente.referencia` |
| `capital_asignado_clp` | número CLP | No negativo; cero es válido y genera cobertura cero |
| `valor_uf_clp` | número CLP/UF | Positivo e igual a `supuestos.uf.valor_clp` |
| `fecha_referencia` | AAAA-MM-DD | Igual a corte de cartola y `supuestos.uf.fecha` |
| `desembolsos[]` | lista | 1–1.000 pagos; conservar orden e índice originales |
| `desembolsos[].fecha` | AAAA-MM-DD | Posterior a fecha de referencia |
| `desembolsos[].uf` | número UF | Estrictamente positivo |

Los pagos de igual fecha son válidos: se ordenan por fecha e índice original. La necesidad agregada en esa fecha no elimina su identidad ni duplica capital disponible. El capital asignado es un presupuesto explícito; el contrato no exige identificar ventas de posiciones de la cartola.

Capital cero: devolver motivo `capital_cero` y tres resúmenes de escenario de saldo/pagado/costo/cobertura cero, pendiente total y conclusión negativa; riesgo/retornos null, sin inventar instrumentos. Ver el contrato de salida.

## Validaciones cruzadas y límites

- Reutilizar 5 MB/archivo, fechas 1900–2200, números finitos con hasta 16 dígitos significativos y límite monetario 10^15; no reutilizar el validador no negativo para retornos.
- Todas las nuevas asignaciones requieren producto, serie, emisor y categoría existentes; caja y depósitos siguen sin serie ni TAC adicional. Seguros y productos sin costo/riesgo identificables conservan exclusión.
- `liquidez_dias` debe ser entero no negativo para los instrumentos usados por nivel 2. Comparar con el primer pago servido, usando fechas civiles.
- Para cada trayectoria comprobar `1 + (retorno_bruto_pct + ajuste_pp − tac_pct) / 100 > 0`. Rechazar la proyección afectada si no se cumple; no cambiar silenciosamente el retorno.
- La suma por fondo incluye todas las series y tramos; por AGF todos sus fondos. El patrimonio agregado de R04 no aumenta ni capital ni capacidad de concentración de la cartera.
- Los tickets de meta se consolidan por producto/serie con el monto final; no se redondean ni se convierten a `number` para decidir acceso. Reevaluación tras cualquier cambio.

## Errores observables

Ampliar `ErrorArchivo` y la traducción de rutas para los cinco archivos. Separar lectura, JSON, estructura y relaciones; como mínimo `tipo`, `ruta` y `mensaje` en el error de entrada. Presentar hasta ocho errores por archivo y cantidad adicional, manteniendo la política existente.

Ejemplos: `meta.desembolsos[3].uf` se muestra como «Meta · Desembolso 4 · Monto UF»; `supuestos.tramos[1].desde_meses` identifica el segundo tramo. Cliente distinto, UF incompatible, hueco de tramos o categoría sin supuesto deben señalar el campo afectado, no caer en «error para soporte».

Archivo inválido no es `sin_candidato`. Una serie bloqueada tampoco es un error de importación: se conserva como evaluación de acceso con motivo. Los excesos de límites técnicos de búsqueda son estado de búsqueda, no prueba de déficit financiero.

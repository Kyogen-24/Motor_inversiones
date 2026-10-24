# Contrato de entrada y presentación — R04 temporal

## Entrada pública: tres JSON

Se mantiene el contrato de `data/cartola.json`, `data/catalogo.json` y `data/acuerdos.json`.
`cartola.corte` y `acuerdos[].patrimonio_al` son fechas obligatorias AAAA-MM-DD válidas.
`patrimonio_agregado_clp` y los mínimos son importes CLP no negativos dentro de los límites
ya documentados. No se añade acreditación histórica ni se transforma una fecha futura.

Seleccionar acuerdos con `patrimonio_al` posterior a `corte` debe permitir analizar
si el resto de la entrada es válido. La fecha se consulta para acceso por alternativa,
no para rechazar toda la carga. Entradas imposibles o incompletas siguen mostrando
archivo/campo y no habilitan análisis. Cambiar un archivo retira resultados anteriores.

## Resultado del motor y consumo interno

La firma `analizarCartola(cartola, catalogo, acuerdos)` se conserva, al igual que las
firmas actuales de `evaluarAcceso` y `tareasCondicionales`. Cada alternativa devuelve
`estado`, `regla`, `motivo` y `evidencia`. El resultado se marca `nivel-1.1`.

| Evidencia | Formato | Significado |
| --- | --- | --- |
| `ticket`, `minimo` | Cadena decimal | Montos individuales evaluados. |
| `agregado` | Cadena decimal o null | Importe declarado, incluso si se descarta. |
| `patrimonioAl` | Fecha o null | Fecha declarada; no corregida. |
| `corte` (nuevo) | Fecha obligatoria | Corte usado en esa evaluación. |

Los campos restantes permanecen. Fecha anterior o igual y monto suficiente permiten
regla 4 solo después de reglas 0–3 y con ticket insuficiente. Fecha posterior implica
regla 5 al necesitar agregación. `motivo` debe identificar la fecha posterior al corte,
sin afirmar que un importe suficiente es inferior al mínimo.

## Contrato observable de interfaz

- Mantener carga vacía/manual y previsualización completa de los tres archivos.
- En «Acceso y series», mostrar estado, regla y motivo por serie; en evidencia,
  ticket, mínimo, patrimonio declarado, fecha del patrimonio y corte de evaluación.
- Para F Alfa con patrimonio futuro: «Bloqueada», regla 5 y explicación temporal.
  Para B con ticket suficiente: «Elegible», regla 6, sin bloquear la AGF.
- En mandato ausente, conservar «Condicional», regla 3. Las tareas piden formalizar
  mandato, acreditar patrimonio suficiente al corte o alcanzar el mínimo individual
  cuando haga falta, confirmación escrita y reevaluación. No afirmar agregación aceptada.
- Comparación y totales no incluyen F bloqueada como elegible ni condicional;
  otras condicionales mantienen su evaluación independiente.
- «Cómo se calcula» debe explicar que agregación exige fecha anterior o igual al corte.
- La UI presenta decisiones del motor sin comparar fechas ni recalcular acceso.
- Mantener español, foco visible, tablas desplazables por teclado y acceso en móvil.

No hay API HTTP pública ni servidor de aplicación que diseñar para este cambio.

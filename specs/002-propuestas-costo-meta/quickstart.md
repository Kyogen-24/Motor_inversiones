# Validación de Nivel 2

## Estado de la implementación (2026-10-25)

Se corrigieron validación compartida, retención y repartos de costo, selección conjunta de soportes, VP y tickets, concentración sobre presupuesto, reservas por pago, proyección mensual y rescates con liquidez. La reparación de costo también puede usar efectivo o depósitos cuando sea necesaria para cumplir perfil o concentración. La generación usa un Worker local, con cancelación, revisión vigente y error visible. Ver [registro de corrección](../../docs/correccion-nivel-2.md) para pruebas, limitaciones y evidencia actual.

## Preparación

Desde la raíz, con Node/npm compatibles con README y versiones del lock:

```bash
npm ci
npm run typecheck
npm test
npm run dev
```

Los cinco archivos de referencia ya están en `data/`; cargarlos manualmente. La aplicación inicia sin datos y no carga estos archivos por sí sola. No se exige un comando de lint.

Para validar el estado actual:

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

Estos comandos no despliegan Pages. Ver [entradas](contracts/entradas.md), [salida](contracts/propuestas.md) y [modelo](data-model.md).

## 1. Regresión nivel 1

Cargar los tres JSON actuales sin supuestos ni meta. Esperar 230.000.000 CLP computables, 5.000.000 sin identificar, costo 5.180.000, ahorro por series 1.650.000, posterior 3.530.000 y condicional adicional 615.000. Mantener primera coincidencia y casos temporales de R04. El resultado conserva `nivel-1.1`.

## 2. Costo de ejemplo

Añadir supuestos y elegir costo; meta no requerida. Cartera admisible de referencia manteniendo categorías:

| Instrumento | CLP | Tratamiento |
| --- | ---: | --- |
| Delta Deuda Corporativa UF B | 60.000.000 | Equivalente de Alfa Deuda UF |
| Delta RV Global Indexada B | 45.000.000 | Equivalente de Alfa RV Global |
| Beta Balanceado M | 50.000.000 | Serie elegible con mandato |
| Beta Corto CLP B | 30.000.000 | Cambio de serie |
| Gamma RV Chile CLASI | 25.000.000 | Retenida; no nueva contratación |
| Depósito UF | 20.000.000 | Retenido; costo cero |

Costo anual 2.525.000 CLP, ahorro 2.655.000, TAC 1,0978260869… %, riesgo actual/propuesto 7,7434782608… %, crecimiento 41,3043478260… %. Delta recibe 105 millones, 45,6521739130… % de la base; todos los fondos debajo de 40 %. Estas cifras no son constantes del motor ni prueba aislada de óptimo global.

Comprobar tres escenarios a cinco años, fuentes y etiquetas. Variar solo comisiones: mismas selecciones/cifras. Variar TAC o mínimos: recalcular. Con perfil/concentración válidos, conservar montos por categoría.

## 3. Meta de educación

Cargar cinco archivos. Capital 70 millones / 40.000 = 1.750 UF. Ocho pagos totalizan 2.200 UF entre 2031-03-01 y 2038-03-01. Tramos esperados: T2, T3, T3, T3, T4, T4, T4, T4.

Oráculo de VP con categorías efectivas T2 deuda UF corta (1,8 %), T3 deuda UF mediana (2,8 %) y T4 balanceado + RV global (promedio 4,4 %), todos supuestos:

| Magnitud | UF aproximadas |
| --- | ---: |
| VP T2 | 203,332736385873 |
| VP T3 | 732,208014053638 |
| VP T4 | 727,938778205245 |
| VP total | 1.663,479528644755 |
| Excedente VP | 86,520471355245 |

Asignación inicial admisible para comprobar esas categorías: T2 Beta UF Corto CLASI 203,332736… UF; T3 Delta Deuda B 700 UF + Alfa Deuda CLASI 32,208014… UF; T4 Beta Balanceado M 700 UF + Delta RV Global CLASI 114,459249… UF, incluido excedente. Verificar con precisión interna, no con estas cifras redondeadas.

No usar Beta UF Corto B, Alfa B o Delta RV B para esos tickets: no alcanzan sus mínimos finales; patrimonio agregado condicional no equivale a elegibilidad automática. Inicialmente se cumplen fondo 40 %, Beta 51,6190135… %, Delta 46,5405285… %, Alfa 1,8404579… % y crecimiento 26,5405285… %.

El motor debe simular pagos y emitir conclusión neta base, cobertura y pendientes. Estos VP prueban asignación inicial, no que la meta alcance. Si elige otro candidato, comprobar soporte/tasa/VP coherentes y sus propias cifras; la asignación ilustrativa no es la única solución permitida.

## 4. Oráculos y variantes

- Probar **un intervalo de exactamente un año**, no el agregado mensual, con 1.000 UF, bruto 3 %, TAC 1 %. Adverso: saldo previo 1.005, costo estimado 10,025 UF; base: 1.020 y 10,1; favorable: 1.035 y 10,175. Retiro de 220 después deja 785, 800 y 815. Detecta TAC doble y promedio posterior al retiro. El costo mensual acumulado suma sus propios intervalos y puede diferir de la aproximación anual única.
- Dos pagos 220 + 440 UF; pagar 220 + 110 implica cobertura 50 % y pendiente 330 UF. Además pagar 220 + 0 debe dar 33,333333… %, no 50 %: este segundo caso distingue cálculo por monto de conteo de pagos.
- Capital ≥ VP bruto y pagos netos base pendientes: conclusión «no alcanza en el escenario base», con brechas separadas.
- Capital insuficiente: reservar primero pagos próximos; remanente al primero incompleto; respetar perfil/concentración.
- Función de tope a 0/12/24 meses: 0/mitad/máximo. El caso 0 es prueba aislada: pago en referencia es inválido al importar una meta. Fronteras de 24/60/96 meses entran al siguiente tramo.
- Dos tramos que juntos cumplen el mínimo del mismo fondo/serie; reducir uno obliga a reevaluar ticket final. Dos series del mismo fondo suman a concentración.
- Pagos de igual fecha conservan identidad; capital cero no divide por cero. Retorno negativo válido se admite; potencia fuera de dominio da error del dato afectado.
- Cliente, UF, fecha, categoría, perfil o liquidez incompatibles señalan el campo; meta inválida no bloquea diagnóstico/costo.
- Fixture que agota presupuesto: repetición idéntica, sin afirmar óptimo ni inviabilidad. Verificar Decimal de todo candidato, mínimos y límites exactos.
- Costo conserva íntegra la base computable en sus asignaciones; rechazar candidatos que dejen capital fuera para fabricar ahorro. Probar dos lotes que compiten por capacidad de la misma AGF y donde elegir primero el más barato impide el destino del segundo: explorar otra combinación debe recuperar una cartera admisible.
- Variar solo retornos de supuestos en costo cambia escenarios, pero no la selección R07 si riesgo/perfil y demás entradas no cambian. El presupuesto de nodos es global incluso al recorrer distintos soportes de meta.
- Meta de capital cero: tres resúmenes sin inversiones, saldo/pagado/costo/cobertura cero, pendiente igual a todos los pagos, retorno/riesgo null, conclusión negativa y motivo capital_cero.
- Reserva corta con saldos futuros positivos muestra primer pago pendiente y saldo, sin llamar agotamiento al incumplimiento parcial. Transferencias solo desde excedentes ya liberados de tramos completados y liquidables a tiempo.
- Repetición sin mutar entradas, invariancia frente a comisiones y cambios coherentes frente a retornos supuestos; escenarios no reoptimizados.

## 5. Navegador y entrega

Revisar escritorio y móvil de 360 px; cargar/reemplazar archivos, generar modalidades, leer errores y recorrer con teclado. Verificar foco, regiones desplazables, encabezados y etiquetas «supuesto» al leer cada tabla. Reemplazar durante cálculo: worker viejo no sobrescribe nueva revisión. Limpiar/recargar vuelve a vacío. Revisar consola y registrar capturas de ambas modalidades.

Medir tiempos del caso de referencia y del entorno; el objetivo de ingeniería es <2 s en escritorio, sin garantía para otros equipos. Cancelación y navegación no deben bloquear la interfaz. Revisar el build en preview y publicar solo `dist/` cuando corresponda. Sincronizar README, SPEC y AGENTS con capacidades y pruebas efectivamente realizadas.

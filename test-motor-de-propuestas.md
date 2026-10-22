Test técnico para el equipo de producto

# Motor de propuestas.

Imagina que eres un fund seller y un cliente te manda la cartola de su cuenta. Tienes que armarle una propuesta: pagar menos por lo que ya tiene, o llegar a una meta. Tu trabajo es construir el programa que lo hace.

No necesitas saber de inversiones. Este documento te las explica desde cero, antes de pedirte nada técnico.

Empezar

Para

Candidato

Plazo

Lo acordamos contigo al enviarte este documento

Fecha

20 oct 2026

1. Leer Recibe la cartola del cliente y la entiende.
2. Diagnosticar Calcula cuánto le cuesta lo que tiene.
3. Proponer Arma una mejora de costos o un plan para su meta.
4. Verificar Revisa que la propuesta no engañe a nadie.
5. Documentar Genera el documento final, que ya no se edita.

01

01 · Qué vas a construir

## Un programa que revisa una cartola y propone una mejora.

La situación

Eres un fund seller: ayudas a personas a elegir en qué fondos invertir. Un cliente te manda su cartola, que es el estado de cuenta con lo que tiene hoy. Tú trabajas con los fondos de algunas administradoras.

Tu trabajo es decirle si puede pagar menos por lo mismo, o armarle un plan para una meta, como pagar la universidad de sus hijos. Hacerlo a mano toma horas y se presta a errores. Por eso se programa, y esa es tu tarea.

### Lo que entra y lo que sale

Entra

- La cartola del cliente: 7 posiciones, 235.000.000 CLP en total.
- El catálogo de fondos, con lo que cobra cada serie.
- Los acuerdos del distribuidor: con qué administradoras puede trabajar.

Sale

- Un diagnóstico: hoy el cliente paga 2,2522 % al año, unos 5.180.000 CLP.
- Una propuesta: con series más baratas de los mismos fondos paga 1,5348 %, y ahorra 1.650.000 CLP al año.
- Un documento que el asesor puede imprimir y mostrar al cliente.

Dato de ejemplo. Cliente ACC-4471, corte al 30 sep 2026. Los datos son ficticios.

### Dos objetivos posibles

Mejorar costos

El cliente ya tiene una cartola y ninguna meta especial. Tu motor busca cómo pagar menos, sin subirle el riesgo.

Alcanzar una meta

El cliente quiere juntar dinero para algo con fechas, como los pagos de una universidad. Tu motor reparte el dinero según cuándo se necesita y revisa si alcanza.

### Qué entregas, en corto

- Tu propia especificación, un SPEC.md. Te damos las reglas del negocio, no el diseño: cómo lo armas lo decides tú.
- El motor, con pruebas, y una página web sencilla para usarlo.
- Todo publicado por ti en un repositorio público de GitHub y en un sitio de GitHub Pages. Sin base de datos y sin servidor.

El detalle está en la sección 08. Antes de eso, lo que necesitas saber para entender el problema.

02

02 · Inversiones sin jerga

## Lo básico de inversiones, sin jerga.

Tres ideas bastan para entender casi todo lo que viene después.

Los ejemplos usan el mercado chileno, de ahí vienen palabras como AGF o UF. Si una te suena rara, está explicada más abajo.

### Un fondo es un pozo común.

Muchas personas ponen dinero en un mismo fondo. Un administrador lo invierte, por ejemplo en bonos o en acciones, y cada persona recibe cuotas: su parte del fondo. Si lo invertido sube de valor, cada cuota vale más.

### Los fondos cobran todos los años.

Ese cobro se llama TAC, tasa anual de costo, y se mide en porcentaje del dinero invertido. Si un fondo cobra 2 % y tienes 100 millones, pagas 2 millones al año, ganes o no. No llega como factura: se descuenta del valor de la cuota.

### El mismo fondo tiene varios precios.

Un fondo se ofrece en series. Todas invierten en exactamente lo mismo, pero cobran distinto según cuánto dinero pones o qué tipo de cliente eres. Es como comprar lo mismo por unidad o al por mayor.

### Dónde se invierte y cuánto sube y baja

Cada fondo cae en una categoría. Más riesgo significa que el valor de la cuota sube y baja más, y eso se mide con la volatilidad.

| Categoría | En qué invierte | Retorno real bruto | Volatilidad |
|---|---|---|---|
| Efectivo caja | Dinero disponible, sin invertir. | 0,5 % | 0,5 % |
| Depósito a plazo deposito_plazo | Dinero que se presta a un banco por un plazo fijo. | 1,5 % | 0,8 % |
| Deuda de corto plazo en pesos deuda_corto_clp | Bonos y otros préstamos de plazo corto, en pesos. | 0,8 % | 1,0 % |
| Deuda de corto plazo en UF deuda_uf_corto | Bonos de plazo corto, reajustados por inflación. | 1,8 % | 2,0 % |
| Deuda de mediano plazo en UF deuda_uf_mediano | Bonos de plazo medio, reajustados por inflación. | 2,8 % | 3,5 % |
| Deuda de largo plazo en UF deuda_uf_largo | Bonos de plazo largo, reajustados por inflación. | 3,2 % | 6,0 % |
| Balanceado balanceado | Una mezcla de bonos y acciones. | 3,8 % | 8,0 % |
| Acciones de Chile rv_chile | Partes de empresas chilenas. | 4,5 % | 18,0 % |
| Acciones globales rv_global | Partes de empresas de todo el mundo. | 5,0 % | 15,0 % |

Dato de ejemplo (supuestos.json). Son supuestos del test, no historia ni promesa.

### Por qué importa el costo

En los datos de ejemplo, el cliente paga unos 5.180.000 CLP al año por sus fondos. Con las mismas inversiones, pero en las series más baratas que puede usar, pagaría unos 3.530.000 CLP. Son 1.650.000 CLP de diferencia cada año, sin cambiar en qué está invertido su dinero. Ese ahorro es lo que tu motor tiene que encontrar.

03

03 · El rol del fund seller

## Un fund seller elige y recomienda, no administra.

Es un distribuidor independiente de fondos. No crea los fondos ni guarda el dinero.

Los fondos los administra cada AGF (administradora general de fondos), y las cuotas quedan registradas a nombre del cliente en ella. El fund seller hace lo de en medio: elige bien, explica con evidencia y ejecuta lo que el cliente acepta.

Para ofrecer los fondos de una AGF firma con ella un acuerdo de distribución. El acuerdo dice qué fondos y series puede ofrecer y qué comisión recibe por cada una. Por eso solo puede recomendar fondos de las AGF con las que tiene acuerdo, aunque haya otros más baratos en el mercado.

### El dilema que tu motor ayuda a resolver

Gana de tres formas posibles: una comisión que la AGF le paga por cada serie, honorarios por asesoría, o ambas. Pero algunas series pagan más comisión que otras. Un buen fund seller no elige la serie que más le paga: elige la que más le conviene al cliente.

Tres principios guían el motor, y verás que reaparecen en las reglas.

### El motor prepara. La persona decide.

El motor hace el cálculo y deja la evidencia. Una persona revisa, decide y firma. Tu página no debe sugerir que el sistema decide por su cuenta.

### Si no se puede demostrar, no se muestra.

Cada cifra sale de una regla y de un dato con fecha y fuente. Si el motor no puede respaldar una afirmación, no genera el documento.

### Siempre se dice qué universo se usó.

Se lee todo el mercado, pero solo se propone lo que el distribuidor puede vender. El documento lo declara.

04

04 · Temas técnicos

## Los términos que vas a encontrar, y qué hace tu motor con cada uno.

Es una tabla de consulta. No tienes que memorizarla: vuelve a ella cuando un término te trabe.

| Término | Qué significa | Qué hace tu motor con eso |
|---|---|---|
| Cartola | Estado de cuenta con las posiciones del cliente a una fecha de corte. Puede venir de un banco o de una corredora, como BTG. | Es la entrada principal. |
| AGF | Administradora general de fondos. Gestiona los fondos y registra las cuotas de cada cliente. | Agrupa los productos por administradora y revisa si hay acuerdo con ella. |
| Fondo y serie | Un fondo se ofrece en series (CLASI, B, F, M, APV) que invierten en lo mismo pero cobran distinto. | Evalúa cada serie del fondo para cada posición. |
| Cuota y valor cuota | El cliente tiene cuotas de un fondo. El monto es cuotas por valor cuota a la fecha de corte. | Calcula el monto de cada posición y avisa si no coincide con la cartola. |
| TAC | Costo anual de una serie, en porcentaje del patrimonio invertido. | Con la TAC de cada serie calcula cuánto cuesta la cartola. |
| Mínimo de inversión | Monto mínimo que pide una serie para poder usarla. | Descarta la serie si el monto es menor, salvo que aplique la agregación. |
| Patrimonio agregado | Lo que el distribuidor tiene en total con una AGF. Algunas series aceptan que ese total cuente para el mínimo. | Permite usar una serie con mínimo alto, pero solo con una condición que hay que confirmar. |
| Serie APV | Serie solo para ahorro previsional voluntario. La puede contratar únicamente quien tiene un plan APV. | La cierra si el cliente no tiene plan APV. |
| Mandato de administración de cartera | Contrato por el que el cliente delega la gestión de su cartera. Algunas series solo se abren a clientes con mandato en esa AGF. | Marca esas series como condicionales si no hay mandato. |
| Acuerdo de distribución | Contrato entre el distribuidor y una AGF, que define qué series puede ofrecer. | Define el universo de propuesta. |
| Comisión de distribución | Parte de la TAC que la AGF paga al distribuidor, por serie. Cambia de una serie a otra del mismo fondo. | No influye en la propuesta. Solo alimenta un control de honestidad. |
| Perfil de riesgo | Resultado del cuestionario del cliente: conservador, moderado o agresivo. Tiene fecha de evaluación. | Limita cuánto riesgo puede tener la propuesta, y avisa si el perfil es antiguo. |
| UF | Unidad de fomento, que se reajusta con la inflación. Las metas de largo plazo se expresan en UF. | Convierte los pagos de una meta a pesos. |
| Volatilidad | Cuánto sube y baja el valor de una inversión. Más volatilidad, más riesgo. | Mide el riesgo de la cartera actual y de la propuesta. |

### No todo es un fondo

La unidad de trabajo es el producto: un fondo con su serie, un depósito, efectivo, una póliza. El motor debe tratar a todos con la misma interfaz y con reglas de costo distintas.

| Tipo | Se lee | Se propone | Cómo cuenta en el costo |
|---|---|---|---|
| mutual_fund | Sí | Sí | TAC de la serie |
| investment_fund | Sí | Sí | TAC de la serie |
| time_deposit | Sí | Sí | Costo 0 |
| cash | Sí | Sí | Costo 0 |
| equity_etf | Sí | Si el catálogo trae su costo | Costo que declare el catálogo |
| insurance_savings | Sí | Solo con su sección propia (R11) | Fuera de la TAC ponderada |
| other | Como texto declarado | No | No cuenta |

05

05 · Un ejemplo completo

## Una posición, de la cartola a la propuesta.

Así piensa el motor. Tu programa repite esto para cada posición y suma el resultado.

1. Leer. La cartola dice que el cliente tiene 60.000.000 CLP en Alfa Deuda UF, serie CLASI. Esa serie cobra una TAC de 2,10 %.
2. Diagnosticar. Costo anual: 60.000.000 por 2,10 %, es decir 1.260.000 CLP al año.
3. Mirar las otras series del mismo fondo. Para cada una, el motor responde si se puede ofrecer, no se puede, o se puede con una condición.

| Serie | TAC % | Mínimo CLP | Estado | Por qué |
|---|---|---|---|---|
| CLASI | 2,10 | — | actual | Serie que tiene hoy el cliente |
| B | 1,45 | 5.000.000 | eligible | Mínimo 5.000.000 no supera el ticket |
| F | 0,95 | 100.000.000 | conditional | Mínimo 100.000.000 mayor que el ticket; el patrimonio agregado en AGF Alfa (180.000.000) lo alcanza |
| M | 1,00 | — | conditional | Requiere mandato y AGF Alfa no lo tiene |
| APV | 0,80 | — | blocked | Solo APV y el plan del cliente no es APV |

Dato de ejemplo. Ticket de 60.000.000 CLP. Acuerdos y patrimonio agregado al 30 sep 2026.

1. Proponer lo que se puede. La serie más barata que se puede ofrecer sin condiciones es la B, con 1,45 %. Cambiar de CLASI a B baja el costo en 65 puntos base y ahorra 390.000 CLP al año.
2. Informar lo condicional, por separado. La F es todavía más barata, pero exige una confirmación. El motor no la propone sin esa confirmación: la anota como un ahorro posible de 300.000 CLP más, con su condición.

Después de repetirlo con las seis posiciones identificadas, el motor suma todo y obtiene el costo de la cartola entera, antes y después. En total, es una cadena de cinco etapas.

| Etapa | Qué hace | Entra | Sale |
|---|---|---|---|
| 1 · Leer | Normaliza la cartola y el catálogo, identifica cada posición y declara las que no logra identificar. | Cartola, catálogo | Posiciones con producto y serie |
| 2 · Diagnosticar | Calcula el costo ponderado y el costo anual, y evalúa qué series puede usar cada posición. | Posiciones, acuerdos | Diagnóstico |
| 3 · Proponer | Arma la propuesta de mejora de costos o la de la meta. | Diagnóstico, meta o perfil, supuestos | Cartera propuesta |
| 4 · Verificar | Corre los controles de honestidad. Si uno falla, el documento no se genera y el motor dice por qué. | Propuesta | Resultado por control |
| 5 · Documentar | Congela los datos usados y genera el documento final. | Propuesta verificada | Documento que ya no se edita |

06

06 · Qué tienes que hacer

## Tres niveles: avanza hasta donde llegues con calidad.

No esperamos que llegues al nivel 3. Preferimos un nivel 1 bien hecho y bien explicado que tres niveles a medias.

Cada nivel trae las reglas que necesitas, plegadas. Tócalas para abrirlas. Cada una empieza con una línea «en simple». Son obligatorias en lo que dicen y libres en cómo las implementas. Si discrepas de alguna, impleméntala como está escrita y deja en tu SPEC.md qué cambiarías y por qué: una regla discutida con argumentos pesa más que una copiada.

Nivel 1

### Leer, medir y cambiar de serie

Lees los tres archivos de la sección 07, calculas cuánto cuesta la cartola, evalúas qué series puede usar cada posición y calculas el ahorro por cambio de serie. Lo muestras en una página.

**Listo cuando** tu motor, con los datos de ejemplo, da las cifras de la sección 07.

**R01 Hay dos universos y siempre se declaran.**

**En simple:** lees todo, pero solo recomiendas lo que tu distribuidor puede vender.

El universo de lectura es todo el catálogo: el motor puede leer, valorizar y diagnosticar cualquier producto. El universo de propuesta son solo los productos de AGF con acuerdo vigente, más los productos sin AGF, como depósitos y efectivo, que siempre se pueden proponer. Un producto fuera del universo de propuesta nunca aparece como destino.

Un acuerdo está vigente si su estado es active, empezó antes de la fecha de corte y no terminó antes de ella. Todo documento lleva esta declaración:

> «Esta propuesta considera productos de las administradoras con las que {distribuidor} mantiene acuerdos de distribución vigentes. Puede haber en el mercado alternativas de menor costo fuera de ese universo.»

**R02 El costo se pondera por el monto identificado.**

**En simple:** el costo de la cartola es el promedio de lo que cobra cada fondo, contando más a los fondos donde hay más dinero.

```
peso_i          = monto_i / total_identificado
tac_ponderada   = Σ ( peso_i × tac_i )
costo_anual_clp = Σ ( monto_i × tac_i )
```

Efectivo y depósitos entran con costo 0. Las pólizas con ahorro (R11) y las líneas que el motor no logra identificar quedan fuera del total identificado, y el documento declara qué porcentaje de la cartola quedó sin identificar. Si cuotas por valor cuota no coincide con el monto de la cartola, el motor lo advierte.

**R04 Una serie tiene un estado, y la primera regla que aplica gana.**

**En simple:** no toda serie sirve para todo cliente. Para cada una, el motor responde: se puede, no se puede, o se puede con una condición.

El ticket es el monto que se pondría en la serie. El motor evalúa cada serie del producto en este orden y se detiene en la primera coincidencia.

| Orden | Condición | Estado | Nota |
|---|---|---|---|
| 0 | La AGF no tiene acuerdo vigente, o el acuerdo no habilita esa serie. | out_of_scope | Se lee, no se propone. |
| 1 | La serie está cerrada. | blocked |  |
| 2 | La serie es solo APV y el plan del cliente no es APV. | blocked | Se cierra por código, no por advertencia. |
| 3 | La serie requiere mandato y no hay mandato con esa AGF. | conditional | Si hay mandato, la evaluación sigue en la regla 4. |
| 4 | El mínimo supera el ticket, pero el patrimonio agregado en la AGF alcanza el mínimo. | conditional | Es una agregación. La condición se imprime en el documento. |
| 5 | El mínimo supera el ticket. | blocked |  |
| 6 | Ninguna de las anteriores. | eligible |  |

Una serie condicional se puede mostrar como ahorro posible, siempre separada y con su condición, y pasa a la lista de tareas previas a la ejecución. Sin confirmación escrita, no se ejecuta.

**R05 El ahorro por cambio de serie se mide en puntos base y en pesos.**

**En simple:** si el mismo fondo tiene una serie más barata que el cliente puede usar, cambiarse baja el costo sin cambiar en qué está invertido su dinero.

Para cada posición, el motor busca la serie elegible más barata del mismo fondo y de la misma AGF.

```
ahorro_clp_anual = ( tac_actual − tac_nueva ) × monto
ahorro_bps       = ( tac_actual − tac_nueva ) × 100
```

Un punto base es 0,01 %. El ahorro condicional se reporta aparte, con su condición. Si la AGF no tiene acuerdo, no existe un cambio de serie posible: el motor lo declara y no inventa un ahorro. Cambiar de AGF o de fondo es otra operación, y pertenece a la regla R07.

Nivel 2

### Las dos propuestas: mejorar costos y alcanzar una meta

Ahora el motor no solo cambia series. Para mejorar costos puede proponer fondos equivalentes más baratos, cuidando el riesgo. Para una meta reparte el dinero según cuándo se necesita cada pago.

**Listo cuando** tu motor arma una propuesta de mejora de costos con los datos de ejemplo, y arma una para la meta de ejemplo y dice si alcanza o cuánto falta.

**R03 El costo acumulado y el retorno neto son supuestos rotulados.**

**En simple:** para proyectar hacia adelante necesitas supuestos de retorno, y siempre hay que decir que son supuestos.

```
saldo_medio(t)      = ( saldo(t−1) + saldo(t) ) / 2
costo_acumulado     = Σ saldo_medio(t) × tac
retorno_real_neto   = retorno_bruto_ponderado − tac_ponderada
```

Los retornos brutos salen de supuestos.json y se rotulan «supuesto» dondequiera que aparezcan. No son historia ni promesa.

**R07 En la mejora de costos mandan el costo y el riesgo.**

**En simple:** sin meta, bajas el costo sin subir el riesgo. Si el cliente termina con más riesgo, eso no es una mejora y hay que decirlo.

Los objetivos van en este orden. El retorno es una consecuencia, nunca un objetivo.

1. Mantener o bajar la volatilidad.
2. Minimizar el costo dentro del universo de propuesta.
3. Respetar los límites de concentración, por fondo y por AGF.

Orden sugerido de los cambios: primero otra serie del mismo fondo, luego un equivalente más barato de la misma categoría dentro de los acuerdos, y solo si hace falta, una reasignación hacia el perfil. Puedes proponer y justificar otro orden.

El riesgo se mide con el mismo método y los mismos supuestos en la cartera actual y en la propuesta, y el método se declara en el documento. Una suma ponderada simple de volatilidades es válida si lo dices; una con correlaciones, también.

**R06 En la meta, el dinero se reparte calzando plazos.**

**En simple:** el dinero que se necesita en 2031 no debería estar en un fondo que sube y baja mucho. Ordenas los pagos por fecha y le das a cada uno inversiones acordes a su plazo.

1. Ordena los desembolsos por fecha y asigna cada uno a un tramo, según los meses que faltan para pagarlo.
2. Calcula el valor presente de cada tramo: VP = Σ flujo / (1 + r_real)^t, con t en años. Como r_real puedes usar el retorno real bruto promedio de las categorías del tramo. Declara qué hiciste.
3. El peso de cada tramo es su VP dividido por el capital asignado.
4. Si la suma de los VP supera el capital, informa el déficit. Si sobra, el excedente va al tramo más largo.
5. Dentro de cada tramo elige primero la categoría exigida, luego la serie elegible más barata y luego una liquidez menor o igual al plazo del tramo. Respeta el máximo por fondo y por AGF.
6. Aplica el tope de crecimiento del perfil. El peso de crecimiento de la cartera es Σ peso_i × peso_crecimiento_i, con renta variable en 1, balanceados en 0,5 y el resto en 0. Si faltan pocos meses para el primer pago, el tope debe bajar: define y declara cuánto.

> **Nunca cierres una brecha agregando riesgo.** Si la meta no se cubre con el riesgo que el perfil permite, el documento dice cuánto falta.

Cada propuesta se proyecta en tres escenarios, sumando el ajuste al retorno real bruto de cada categoría.

| Escenario | Ajuste al retorno | Qué reporta |
|---|---|---|
| Adverso | −1,5 pp | Saldo final en UF o fecha de agotamiento. Cobertura: el porcentaje de los pagos que se cubren antes de que el saldo se agote. |
| Base | 0 pp |  |
| Favorable | +1,5 pp |  |

Nivel 3

### Un motor en el que se pueda confiar

Aquí el motor se vuelve un producto serio: se frena solo cuando una propuesta no se puede defender, y el documento final se puede reproducir y auditar.

**Listo cuando** tu motor bloquea las propuestas que no se pueden defender, y el documento final trae su huella (hash) para reproducirlo.

**R08 El titular dice qué mejoró, y a veces dice que nada.**

**En simple:** el motor debe poder decir qué mejoró: el costo, el riesgo, ambos o nada. Si no mejoró nada, no hay documento que mostrar.

La función headline() devuelve una de cuatro respuestas: costo, riesgo, ambos o ninguno. «Ninguno» significa que no se genera el documento. Tú defines y declaras las tolerancias con las que decides que algo bajó, por ejemplo cuántos puntos base cuentan como mejora. El retorno nunca encabeza.

**R09 Nueve controles protegen la honestidad de la propuesta.**

**En simple:** son revisiones automáticas que impiden mostrar una propuesta engañosa.

Cada control devuelve ok, warn o block, junto con la evidencia que lo respalda. Un solo block impide generar el documento.

| Código | Aplica a | Qué verifica | Efecto |
|---|---|---|---|
| HEADLINE_NONE | Mejora de costos | El titular no es «ninguno». | Bloquea |
| RISK_SHIFT | Mejora de costos | Si la propuesta sube el riesgo, eso es un cambio de perfil y no una mejora. | Bloquea hasta registrar la aceptación del cliente |
| ANCLA_COSTO | Mejora de costos | Al menos 40 % de la mejora del retorno neto viene de una TAC menor. El 40 % es un parámetro. | Bloquea si es menos |
| BEST_ACCESSIBLE | Ambas | No existe una serie elegible más barata en la misma categoría dentro de los acuerdos. | Bloquea hasta registrar un motivo, y el motivo se imprime |
| HIDDEN_DEFICIT | Meta | Si la cobertura base es 100 % o más y la adversa es menor de 90 %, el documento lo declara. | Bloquea si no está declarado |
| INSURANCE_MIX | Ambas | Un producto con cobertura separa cuánto va a ahorro y cuánto a prima. | Bloquea si no hay desglose |
| PESOS_NO_SUMAN | Ambas | Los pesos suman 100 %, con tolerancia de 0,5 puntos. | Bloquea |
| PERFIL_VENCIDO | Ambas | El perfil del cliente no está vencido. Tú defines el umbral. | Advierte |
| SIN_IDENTIFICAR | Ambas | Hay posiciones sin identificar. Se declaran en el documento. | Advierte |

Estos son los mensajes que la persona que revisa puede leer. Escríbelos así o mejóralos, pero conserva el tono: dicen lo que pasa y qué hacer.

HEADLINE_NONE

«Esta propuesta no baja el costo ni el riesgo. Lo único que mejora es un supuesto. Revisa la asignación.»

RISK_SHIFT

«Esto no es una mejora: es un cambio de perfil de riesgo. Debe declararse y aceptarse explícitamente.»

BEST_ACCESSIBLE

«Existe {serie} con menor costo dentro de tus acuerdos. Registra por qué elegiste esta.»

HIDDEN_DEFICIT

«El escenario adverso no cubre la meta y no está declarado.»

INSURANCE_MIX

«Un producto con cobertura debe separar cuánto va a ahorro y cuánto a prima.»

**R10 La comisión de distribución no construye la propuesta.**

**En simple:** lo que gana el distribuidor no debe influir en lo que recomienda.

La comisión no interviene en cómo se arma una propuesta ni en ningún cálculo de retorno. Solo alimenta a BEST_ACCESSIBLE y a la auditoría interna.

> **Decisión abierta.** Dejamos sin responder a propósito si el documento para el cliente muestra la comisión que recibe el distribuidor. Decídelo y justifícalo en tu SPEC.md, pensando en el conflicto de interés y en lo que esperaría un regulador. Sea cual sea tu decisión, hazla un parámetro y no una constante escondida en el código.

**R11 Lo que no es un fondo tiene reglas propias.**

**En simple:** depósitos y efectivo son fáciles. Un seguro con ahorro mezcla cobertura y ahorro, y se trata aparte.

- Depósitos y efectivo se leen y se pueden proponer. Su costo es 0 (R02).
- Seguros con ahorro quedan fuera de la TAC ponderada y tienen su propia sección en el documento, con el costo de permanencia a 5, 10 y 20 años, incluida la multa de rescate. Siempre separan cuánto del aporte va a ahorro y cuánto a prima, con una nota que dice que el producto mezcla dos necesidades: cobertura y ahorro.
- «Other» se lee como texto declarado y no se propone.

**R12 Cada documento se puede reproducir y no se edita.**

**En simple:** con los mismos datos, el motor genera el mismo documento. Y una vez generado, no se cambia: si hay un error, se hace uno nuevo.

El documento tiene estos bloques:

- Identificación del cliente y fecha de corte.
- Diagnóstico.
- Comparación, con el titular de la regla R08.
- Proyección en la meta, o riesgo en la mejora de costos.
- Sección de seguros, si aplica.
- Tareas previas a la ejecución, para las series condicionales.
- Declaraciones: universo de propuesta, supuestos rotulados, fuentes de costo con período y fecha de obtención, líneas estimadas, posiciones sin identificar y los motivos registrados de BEST_ACCESSIBLE.
- Pie con el hash.

Al generarlo, el motor congela una copia de lo que usó: las entradas, la versión del catálogo, los acuerdos, los supuestos y el resultado de cada control. El hash es un SHA-256 sobre el JSON canónico y se imprime en el pie. Mismas entradas, misma propuesta, mismo hash.

Un documento generado es inmutable. Una corrección es una versión nueva que reemplaza a la anterior. El documento se imprime a PDF desde el navegador.

**R13 Opcional: «qué habría pasado si» es historia, no promesa.**

**En simple:** mirar hacia atrás para ver cómo le habría ido al cliente con la propuesta.

Muestra qué habría pasado con los mismos aportes y fechas a 6 meses, 1 año y 10 años atrás, neto de costos y con las series correspondientes. Se rotula como historia y se muestra junto a la proyección, con sus supuestos. Si no hay historial suficiente, lo declaras; no extrapolas.

No te damos datos históricos. Si haces esta extensión, inventa un conjunto pequeño y rotúlalo como dato de ejemplo.

07

07 · Datos de ejemplo y verificación

## Con estos datos, tu motor debe dar estas cifras.

Administradoras, fondos, series, costos y cliente son ficticios. Úsalos para tu primera versión y después cámbialos, para probar que tu motor no depende de ellos.

| Archivo | Qué contiene | Para qué nivel |
|---|---|---|
| catalogo.json | Emisores y productos con su categoría y liquidez. Cada serie trae TAC, monto mínimo y condiciones. Lleva versión y fecha de corte de costos. | 1, 2 y 3 |
| acuerdos.json | Qué AGF tienen acuerdo vigente, qué series están habilitadas y su comisión, si hay mandato y el patrimonio agregado. | 1, 2 y 3 |
| cartola.json | Posiciones del cliente a una fecha de corte, su perfil y si tiene plan APV. | 1, 2 y 3 |
| supuestos.json | Retorno y volatilidad por categoría, límites de concentración, tramos, escenarios y valor de la UF. | 2 y 3 |
| meta.json | Capital asignado y desembolsos en UF con su fecha. | 2 y 3 |

Los cinco archivos están aquí, listos para copiar, y también en el .zip que recibes con este documento. En tu repositorio guárdalos en una carpeta data/.

Los archivos JSON no se repiten en este PDF: van en el .zip adjunto.

brand-check: off

**catalogo.json Emisores, productos y series con su TAC · 5,6 KB**

```
{
  "_aviso": "Dato de ejemplo. Administradoras, fondos, series y costos ficticios.",
  "_nota": "En cada serie, los campos omitidos valen: abierta = true, solo_apv = false, requiere_mandato = false. La TAC es anual, en porcentaje.",
  "version": "ejemplo-2026-10",
  "corte_costos": "2026-09-30",
  "fuente_costos": "Dato de ejemplo",
  "emisores": [
    { "id": "alfa", "nombre": "AGF Alfa", "tipo": "agf" },
    { "id": "beta", "nombre": "AGF Beta", "tipo": "agf" },
    { "id": "gamma", "nombre": "AGF Gamma", "tipo": "agf" },
    { "id": "delta", "nombre": "AGF Delta", "tipo": "agf" },
    { "id": "epsilon", "nombre": "Seguros Épsilon", "tipo": "aseguradora" },
    { "id": "banco-ejemplo", "nombre": "Banco Ejemplo", "tipo": "banco" }
  ],
  "productos": [
    {
      "id": "alfa-deuda-uf",
      "emisor": "alfa",
      "nombre": "Alfa Deuda UF Mediano Plazo",
      "tipo": "mutual_fund",
      "categoria": "deuda_uf_mediano",
      "liquidez_dias": 2,
      "series": [
        { "codigo": "CLASI", "tac_pct": 2.10, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 1.45, "minimo_clp": 5000000 },
        { "codigo": "F", "tac_pct": 0.95, "minimo_clp": 100000000 },
        { "codigo": "M", "tac_pct": 1.00, "minimo_clp": 0, "requiere_mandato": true },
        { "codigo": "APV", "tac_pct": 0.80, "minimo_clp": 0, "solo_apv": true }
      ]
    },
    {
      "id": "alfa-rv-global",
      "emisor": "alfa",
      "nombre": "Alfa Renta Variable Global",
      "tipo": "mutual_fund",
      "categoria": "rv_global",
      "liquidez_dias": 4,
      "series": [
        { "codigo": "CLASI", "tac_pct": 3.20, "minimo_clp": 0 },
        { "codigo": "A", "tac_pct": 2.60, "minimo_clp": 0, "abierta": false },
        { "codigo": "B", "tac_pct": 2.30, "minimo_clp": 5000000 },
        { "codigo": "F", "tac_pct": 1.60, "minimo_clp": 150000000 },
        { "codigo": "APV", "tac_pct": 1.40, "minimo_clp": 0, "solo_apv": true }
      ]
    },
    {
      "id": "beta-corto-clp",
      "emisor": "beta",
      "nombre": "Beta Deuda Corto Plazo Pesos",
      "tipo": "mutual_fund",
      "categoria": "deuda_corto_clp",
      "liquidez_dias": 1,
      "series": [
        { "codigo": "CLASI", "tac_pct": 1.10, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 0.75, "minimo_clp": 10000000 }
      ]
    },
    {
      "id": "beta-deuda-uf-corto",
      "emisor": "beta",
      "nombre": "Beta Deuda UF Corto Plazo",
      "tipo": "mutual_fund",
      "categoria": "deuda_uf_corto",
      "liquidez_dias": 2,
      "series": [
        { "codigo": "CLASI", "tac_pct": 1.15, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 0.70, "minimo_clp": 10000000 }
      ]
    },
    {
      "id": "beta-balanceado",
      "emisor": "beta",
      "nombre": "Beta Balanceado Moderado",
      "tipo": "mutual_fund",
      "categoria": "balanceado",
      "liquidez_dias": 3,
      "series": [
        { "codigo": "CLASI", "tac_pct": 2.80, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 1.95, "minimo_clp": 20000000 },
        { "codigo": "M", "tac_pct": 1.30, "minimo_clp": 0, "requiere_mandato": true },
        { "codigo": "APV", "tac_pct": 1.50, "minimo_clp": 0, "solo_apv": true }
      ]
    },
    {
      "id": "gamma-rv-chile",
      "emisor": "gamma",
      "nombre": "Gamma Renta Variable Chile",
      "tipo": "mutual_fund",
      "categoria": "rv_chile",
      "liquidez_dias": 3,
      "series": [
        { "codigo": "CLASI", "tac_pct": 3.00, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 2.10, "minimo_clp": 5000000 }
      ]
    },
    {
      "id": "gamma-deuda-uf-largo",
      "emisor": "gamma",
      "nombre": "Gamma Deuda UF Largo Plazo",
      "tipo": "mutual_fund",
      "categoria": "deuda_uf_largo",
      "liquidez_dias": 3,
      "series": [
        { "codigo": "CLASI", "tac_pct": 1.90, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 1.20, "minimo_clp": 30000000 }
      ]
    },
    {
      "id": "delta-deuda-corp",
      "emisor": "delta",
      "nombre": "Delta Deuda Corporativa UF",
      "tipo": "mutual_fund",
      "categoria": "deuda_uf_mediano",
      "liquidez_dias": 3,
      "series": [
        { "codigo": "CLASI", "tac_pct": 1.70, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 1.05, "minimo_clp": 10000000 }
      ]
    },
    {
      "id": "delta-rv-global-idx",
      "emisor": "delta",
      "nombre": "Delta Renta Variable Global Indexada",
      "tipo": "mutual_fund",
      "categoria": "rv_global",
      "liquidez_dias": 3,
      "series": [
        { "codigo": "CLASI", "tac_pct": 1.35, "minimo_clp": 0 },
        { "codigo": "B", "tac_pct": 0.60, "minimo_clp": 10000000 }
      ]
    },
    {
      "id": "deposito-uf-90d",
      "emisor": "banco-ejemplo",
      "nombre": "Depósito a plazo en UF a 90 días",
      "tipo": "time_deposit",
      "categoria": "deposito_plazo",
      "liquidez_dias": 90,
      "series": []
    },
    {
      "id": "efectivo-clp",
      "emisor": "banco-ejemplo",
      "nombre": "Efectivo en pesos",
      "tipo": "cash",
      "categoria": "caja",
      "liquidez_dias": 0,
      "series": []
    },
    {
      "id": "seguro-epsilon-ahorro",
      "emisor": "epsilon",
      "nombre": "Seguro con ahorro Épsilon",
      "tipo": "insurance_savings",
      "categoria": "seguro_ahorro",
      "liquidez_dias": 30,
      "series": [],
      "prima_riesgo_pct_del_aporte": 18.0,
      "curva_costo_permanencia": [
        { "horizonte_anios": 5, "costo_total_pct_de_aportes": 14.0, "multa_rescate_pct": 8.0 },
        { "horizonte_anios": 10, "costo_total_pct_de_aportes": 11.0, "multa_rescate_pct": 4.0 },
        { "horizonte_anios": 20, "costo_total_pct_de_aportes": 9.0, "multa_rescate_pct": 0.0 }
      ]
    }
  ]
}
```

**acuerdos.json Acuerdos vigentes, series habilitadas y comisiones · 1,8 KB**

```
{
  "_aviso": "Dato de ejemplo. Acuerdos de distribución ficticios.",
  "_nota": "Una serie está habilitada si aparece bajo el producto, con su comisión de distribución en porcentaje anual. La AGF Gamma no tiene acuerdo: sus productos se leen, no se proponen.",
  "distribuidor": "Distribuidor de ejemplo",
  "acuerdos": [
    {
      "emisor": "alfa",
      "estado": "active",
      "vigente_desde": "2025-03-01",
      "vigente_hasta": null,
      "mandato": false,
      "patrimonio_agregado_clp": 180000000,
      "patrimonio_al": "2026-09-30",
      "series": {
        "alfa-deuda-uf": { "CLASI": 0.80, "B": 0.55, "F": 0.20, "M": 0.30, "APV": 0.30 },
        "alfa-rv-global": { "CLASI": 1.00, "A": 0.60, "B": 0.70, "F": 0.30, "APV": 0.40 }
      }
    },
    {
      "emisor": "beta",
      "estado": "active",
      "vigente_desde": "2025-06-01",
      "vigente_hasta": null,
      "mandato": true,
      "patrimonio_agregado_clp": 40000000,
      "patrimonio_al": "2026-09-30",
      "series": {
        "beta-corto-clp": { "CLASI": 0.40, "B": 0.25 },
        "beta-deuda-uf-corto": { "CLASI": 0.50, "B": 0.30 },
        "beta-balanceado": { "CLASI": 0.90, "B": 0.60, "M": 0.35, "APV": 0.40 }
      }
    },
    {
      "emisor": "delta",
      "estado": "active",
      "vigente_desde": "2026-01-15",
      "vigente_hasta": null,
      "mandato": false,
      "patrimonio_agregado_clp": 15000000,
      "patrimonio_al": "2026-09-30",
      "series": {
        "delta-deuda-corp": { "CLASI": 0.70, "B": 0.30 },
        "delta-rv-global-idx": { "CLASI": 0.50, "B": 0.20 }
      }
    }
  ],
  "productos_sin_serie": {
    "deposito-uf-90d": { "comision_distribucion_pct": 0.00 },
    "efectivo-clp": { "comision_distribucion_pct": 0.00 },
    "seguro-epsilon-ahorro": { "comision_distribucion_pct": 3.00 }
  }
}
```

**cartola.json Posiciones del cliente ACC-4471 · 1,2 KB**

```
{
  "_aviso": "Dato de ejemplo. Cliente y montos ficticios.",
  "cliente": {
    "referencia": "ACC-4471",
    "perfil_riesgo": "moderado",
    "perfil_evaluado_el": "2025-08-14",
    "plan_apv": false
  },
  "corte": "2026-09-30",
  "moneda": "CLP",
  "posiciones": [
    { "producto": "alfa-deuda-uf", "serie": "CLASI", "cuotas": 40000.0000, "valor_cuota": 1500.0000, "monto_clp": 60000000 },
    { "producto": "alfa-rv-global", "serie": "CLASI", "cuotas": 30000.0000, "valor_cuota": 1500.0000, "monto_clp": 45000000 },
    { "producto": "beta-balanceado", "serie": "CLASI", "cuotas": 25000.0000, "valor_cuota": 2000.0000, "monto_clp": 50000000 },
    { "producto": "beta-corto-clp", "serie": "CLASI", "cuotas": 20000.0000, "valor_cuota": 1500.0000, "monto_clp": 30000000 },
    { "producto": "gamma-rv-chile", "serie": "CLASI", "cuotas": 10000.0000, "valor_cuota": 2500.0000, "monto_clp": 25000000 },
    { "producto": "deposito-uf-90d", "serie": null, "cuotas": null, "valor_cuota": null, "monto_clp": 20000000 },
    { "producto": null, "descripcion_original": "FM Zeta Acciones Asia, serie A", "serie": null, "cuotas": null, "valor_cuota": null, "monto_clp": 5000000 }
  ]
}
```

**supuestos.json Retornos, límites, tramos y escenarios · 1,9 KB**

```
{
  "_aviso": "Dato de ejemplo. Son supuestos declarados, no historia.",
  "uf": { "valor_clp": 40000, "fecha": "2026-09-30" },
  "categorias": {
    "caja": { "retorno_real_bruto_pct": 0.5, "volatilidad_pct": 0.5, "peso_crecimiento": 0 },
    "deposito_plazo": { "retorno_real_bruto_pct": 1.5, "volatilidad_pct": 0.8, "peso_crecimiento": 0 },
    "deuda_corto_clp": { "retorno_real_bruto_pct": 0.8, "volatilidad_pct": 1.0, "peso_crecimiento": 0 },
    "deuda_uf_corto": { "retorno_real_bruto_pct": 1.8, "volatilidad_pct": 2.0, "peso_crecimiento": 0 },
    "deuda_uf_mediano": { "retorno_real_bruto_pct": 2.8, "volatilidad_pct": 3.5, "peso_crecimiento": 0 },
    "deuda_uf_largo": { "retorno_real_bruto_pct": 3.2, "volatilidad_pct": 6.0, "peso_crecimiento": 0 },
    "balanceado": { "retorno_real_bruto_pct": 3.8, "volatilidad_pct": 8.0, "peso_crecimiento": 0.5 },
    "rv_chile": { "retorno_real_bruto_pct": 4.5, "volatilidad_pct": 18.0, "peso_crecimiento": 1 },
    "rv_global": { "retorno_real_bruto_pct": 5.0, "volatilidad_pct": 15.0, "peso_crecimiento": 1 }
  },
  "perfiles": {
    "conservador": { "max_crecimiento_pct": 20 },
    "moderado": { "max_crecimiento_pct": 50 },
    "agresivo": { "max_crecimiento_pct": 80 }
  },
  "limites": { "max_por_fondo_pct": 40, "max_por_agf_pct": 60 },
  "tramos": [
    { "id": "T1", "desde_meses": 0, "hasta_meses": 24, "categorias": ["caja", "deposito_plazo", "deuda_corto_clp"] },
    { "id": "T2", "desde_meses": 24, "hasta_meses": 60, "categorias": ["deuda_uf_corto"] },
    { "id": "T3", "desde_meses": 60, "hasta_meses": 96, "categorias": ["deuda_uf_mediano", "deuda_uf_largo"] },
    { "id": "T4", "desde_meses": 96, "hasta_meses": null, "categorias": ["balanceado", "rv_chile", "rv_global"] }
  ],
  "escenarios": [
    { "id": "adverso", "ajuste_retorno_pp": -1.5 },
    { "id": "base", "ajuste_retorno_pp": 0 },
    { "id": "favorable", "ajuste_retorno_pp": 1.5 }
  ]
}
```

**meta.json Meta de la modalidad A · 0,6 KB**

```
{
  "_aviso": "Dato de ejemplo. Meta ficticia para la modalidad A.",
  "tipo": "educacion",
  "nombre": "Educación universitaria de dos hijos",
  "referencia_cliente": "ACC-4471",
  "capital_asignado_clp": 70000000,
  "valor_uf_clp": 40000,
  "fecha_referencia": "2026-09-30",
  "desembolsos": [
    { "fecha": "2031-03-01", "uf": 220 },
    { "fecha": "2032-03-01", "uf": 220 },
    { "fecha": "2033-03-01", "uf": 220 },
    { "fecha": "2034-03-01", "uf": 440 },
    { "fecha": "2035-03-01", "uf": 440 },
    { "fecha": "2036-03-01", "uf": 220 },
    { "fecha": "2037-03-01", "uf": 220 },
    { "fecha": "2038-03-01", "uf": 220 }
  ]
}
```

brand-check: on

### Series del catálogo de ejemplo

| Producto | Serie | TAC % | Mínimo CLP | Condición | Con acuerdo |
|---|---|---|---|---|---|
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | CLASI | 2,10 | — | — | Sí |
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | B | 1,45 | 5.000.000 | — | Sí |
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | F | 0,95 | 100.000.000 | — | Sí |
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | M | 1,00 | — | requiere mandato | Sí |
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | APV | 0,80 | — | solo APV | Sí |
| Alfa Renta Variable Global alfa-rv-global | CLASI | 3,20 | — | — | Sí |
| Alfa Renta Variable Global alfa-rv-global | A | 2,60 | — | cerrada | Sí |
| Alfa Renta Variable Global alfa-rv-global | B | 2,30 | 5.000.000 | — | Sí |
| Alfa Renta Variable Global alfa-rv-global | F | 1,60 | 150.000.000 | — | Sí |
| Alfa Renta Variable Global alfa-rv-global | APV | 1,40 | — | solo APV | Sí |
| Beta Deuda Corto Plazo Pesos beta-corto-clp | CLASI | 1,10 | — | — | Sí |
| Beta Deuda Corto Plazo Pesos beta-corto-clp | B | 0,75 | 10.000.000 | — | Sí |
| Beta Deuda UF Corto Plazo beta-deuda-uf-corto | CLASI | 1,15 | — | — | Sí |
| Beta Deuda UF Corto Plazo beta-deuda-uf-corto | B | 0,70 | 10.000.000 | — | Sí |
| Beta Balanceado Moderado beta-balanceado | CLASI | 2,80 | — | — | Sí |
| Beta Balanceado Moderado beta-balanceado | B | 1,95 | 20.000.000 | — | Sí |
| Beta Balanceado Moderado beta-balanceado | M | 1,30 | — | requiere mandato | Sí |
| Beta Balanceado Moderado beta-balanceado | APV | 1,50 | — | solo APV | Sí |
| Gamma Renta Variable Chile gamma-rv-chile | CLASI | 3,00 | — | — | No |
| Gamma Renta Variable Chile gamma-rv-chile | B | 2,10 | 5.000.000 | — | No |
| Gamma Deuda UF Largo Plazo gamma-deuda-uf-largo | CLASI | 1,90 | — | — | No |
| Gamma Deuda UF Largo Plazo gamma-deuda-uf-largo | B | 1,20 | 30.000.000 | — | No |
| Delta Deuda Corporativa UF delta-deuda-corp | CLASI | 1,70 | — | — | Sí |
| Delta Deuda Corporativa UF delta-deuda-corp | B | 1,05 | 10.000.000 | — | Sí |
| Delta Renta Variable Global Indexada delta-rv-global-idx | CLASI | 1,35 | — | — | Sí |
| Delta Renta Variable Global Indexada delta-rv-global-idx | B | 0,60 | 10.000.000 | — | Sí |
| Depósito a plazo en UF a 90 días deposito-uf-90d | — | — | — | time_deposit, deposito_plazo | Sí |
| Efectivo en pesos efectivo-clp | — | — | — | cash, caja | Sí |
| Seguro con ahorro Épsilon seguro-epsilon-ahorro | — | — | — | insurance_savings, seguro_ahorro | Sí |

Dato de ejemplo. Costos con corte al 30 sep 2026. La TAC es anual. Una serie sin condiciones es abierta, no es solo APV y no requiere mandato.

### Casos límite escondidos

- La serie A de Alfa Renta Variable Global está cerrada, aunque el acuerdo la habilita.
- Las series APV existen, pero el cliente no tiene plan APV.
- La serie M exige mandato: Alfa no lo tiene y Beta sí.
- La serie F de Alfa solo se alcanza por agregación del patrimonio.
- AGF Gamma no tiene acuerdo, así que todos sus productos se leen y ninguno se propone.
- La categoría deuda_uf_largo solo existe en Gamma.
- Una posición de la cartola no se puede identificar.

### Nivel 1: diagnóstico esperado de la cartola

Total identificado

230.000.000 CLP

Seis posiciones de la cartola

Sin identificar

5.000.000 CLP

2,13 % de 235.000.000 CLP

TAC ponderada

2,2522 %

Sobre el total identificado

Costo anual

5.180.000 CLP

Suma de monto por TAC

Dato de ejemplo. Cliente ACC-4471, corte al 30 sep 2026.

| Posición | Monto CLP | Peso | TAC % | Costo anual CLP |
|---|---|---|---|---|
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | 60.000.000 | 26,09 % | 2,10 | 1.260.000 |
| Alfa Renta Variable Global alfa-rv-global | 45.000.000 | 19,57 % | 3,20 | 1.440.000 |
| Beta Balanceado Moderado beta-balanceado | 50.000.000 | 21,74 % | 2,80 | 1.400.000 |
| Beta Deuda Corto Plazo Pesos beta-corto-clp | 30.000.000 | 13,04 % | 1,10 | 330.000 |
| Gamma Renta Variable Chile gamma-rv-chile | 25.000.000 | 10,87 % | 3,00 | 750.000 |
| Depósito a plazo en UF a 90 días deposito-uf-90d | 20.000.000 | 8,70 % | 0,00 | 0 |
| Total identificado | 230.000.000 | 100,00 % | 2,2522 % | 5.180.000 |

Dato de ejemplo. Peso sobre el total identificado. Los depósitos entran con costo 0.

### Nivel 1: estado de cada serie por posición

Para cada posición, el ticket es el monto de esa posición. La serie que el cliente tiene hoy aparece como «actual».

| Posición | Serie | TAC % | Estado | Regla | Motivo |
|---|---|---|---|---|---|
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | CLASI | 2,10 | actual | — | Serie que tiene hoy el cliente |
|  | B | 1,45 | eligible | 6 | Mínimo 5.000.000 no supera el ticket |
|  | F | 0,95 | conditional | 4 | Mínimo 100.000.000 mayor que el ticket; el patrimonio agregado en AGF Alfa (180.000.000) lo alcanza |
|  | M | 1,00 | conditional | 3 | Requiere mandato y AGF Alfa no lo tiene |
|  | APV | 0,80 | blocked | 2 | Solo APV y el plan del cliente no es APV |
| Alfa Renta Variable Global alfa-rv-global | CLASI | 3,20 | actual | — | Serie que tiene hoy el cliente |
|  | A | 2,60 | blocked | 1 | Serie cerrada |
|  | B | 2,30 | eligible | 6 | Mínimo 5.000.000 no supera el ticket |
|  | F | 1,60 | conditional | 4 | Mínimo 150.000.000 mayor que el ticket; el patrimonio agregado en AGF Alfa (180.000.000) lo alcanza |
|  | APV | 1,40 | blocked | 2 | Solo APV y el plan del cliente no es APV |
| Beta Balanceado Moderado beta-balanceado | CLASI | 2,80 | actual | — | Serie que tiene hoy el cliente |
|  | B | 1,95 | eligible | 6 | Mínimo 20.000.000 no supera el ticket |
|  | M | 1,30 | eligible | 6 | Hay mandato con AGF Beta; sin mínimo |
|  | APV | 1,50 | blocked | 2 | Solo APV y el plan del cliente no es APV |
| Beta Deuda Corto Plazo Pesos beta-corto-clp | CLASI | 1,10 | actual | — | Serie que tiene hoy el cliente |
|  | B | 0,75 | eligible | 6 | Mínimo 10.000.000 no supera el ticket |
| Gamma Renta Variable Chile gamma-rv-chile | CLASI | 3,00 | actual | — | Serie que tiene hoy el cliente |
|  | B | 2,10 | out_of_scope | 0 | AGF Gamma no tiene acuerdo vigente |

Dato de ejemplo. Acuerdos y patrimonio agregado al 30 sep 2026.

### Nivel 1: ahorro por cambio de serie

| Posición | Monto CLP | Serie actual | Mejor elegible | Ahorro bps | Ahorro CLP al año | Condicional adicional |
|---|---|---|---|---|---|---|
| Alfa Deuda UF Mediano Plazo alfa-deuda-uf | 60.000.000 | CLASI a 2,10 | B a 1,45 | 65 | 390.000 | F a 0,95: 300.000 CLP más |
| Alfa Renta Variable Global alfa-rv-global | 45.000.000 | CLASI a 3,20 | B a 2,30 | 90 | 405.000 | F a 1,60: 315.000 CLP más |
| Beta Balanceado Moderado beta-balanceado | 50.000.000 | CLASI a 2,80 | M a 1,30 | 150 | 750.000 | — |
| Beta Deuda Corto Plazo Pesos beta-corto-clp | 30.000.000 | CLASI a 1,10 | B a 0,75 | 35 | 105.000 | — |
| Gamma Renta Variable Chile gamma-rv-chile | 25.000.000 | CLASI a 3,00 | — | 0 | 0 | Cambiar de AGF, no de serie |
| Total | 210.000.000 |  |  |  | 1.650.000 | 615.000 CLP |

Dato de ejemplo. El ahorro elegible es la diferencia con la serie elegible más barata. El condicional se informa aparte, con su condición.

En total, el ahorro elegible es de **1.650.000 CLP al año**, y la TAC ponderada baja de 2,2522 % a 1,5348 %. El ahorro condicional adicional es de **615.000 CLP** (300.000 más 315.000), y depende de las condiciones de la tabla. La posición en Gamma no tiene ahorro por serie: cambiarla sería cambiar de AGF, no de serie.

### Nivel 3: prueba de BEST_ACCESSIBLE

Si propones Alfa Deuda UF serie B (TAC 1,45 %, comisión de distribución 0,55 %) para los 60.000.000 CLP de la posición de Alfa, el control debe saltar. En la misma categoría hay una serie elegible más barata dentro de tus acuerdos: Delta Deuda Corporativa UF serie B, con TAC 1,05 % y comisión de 0,30 %. Las series condicionales no cuentan como alternativa, y un empate en costo no hace saltar el control.

### Nivel 2: meta de ejemplo

Educación universitaria de dos hijos, con 70.000.000 CLP asignados (1.750 UF, a una UF de 40.000 CLP del 30 sep 2026) y ocho desembolsos el 1 de marzo de cada año.

| Fecha | Desembolso UF | Desembolso CLP | UF acumuladas |
|---|---|---|---|
| 1 mar 2031 | 220 | 8.800.000 | 220 |
| 1 mar 2032 | 220 | 8.800.000 | 440 |
| 1 mar 2033 | 220 | 8.800.000 | 660 |
| 1 mar 2034 | 440 | 17.600.000 | 1.100 |
| 1 mar 2035 | 440 | 17.600.000 | 1.540 |
| 1 mar 2036 | 220 | 8.800.000 | 1.760 |
| 1 mar 2037 | 220 | 8.800.000 | 1.980 |
| 1 mar 2038 | 220 | 8.800.000 | 2.200 |
| Total | 2.200 | 88.000.000 |  |

Dato de ejemplo. Cliente ACC-4471. El valor en CLP usa la UF del 30 sep 2026.

Como referencia, el capital alcanza si el retorno real neto promedio ronda 3,0 % al año. Con una tasa plana de 2,0 %, los ocho desembolsos valen unas 1.882 UF contra 1.750 UF de capital; con 3,5 %, valen unas 1.680 UF. Según tus supuestos y tus series, esta meta puede quedar justa o con déficit, y tu motor debe decir cuál de los dos casos es y por cuánto. Estas cifras son de referencia, no el resultado que esperamos.

No damos un resultado esperado para la meta. Es donde más se nota tu criterio.

08

08 · Cómo lo entregas

## Entregas un repositorio público y un sitio que funciona.

### Qué entregas

| Entregable | Qué esperamos |
|---|---|
| SPEC.md | Tu especificación: qué vas a construir, cómo modelas los datos, qué decisiones tomaste tú y qué reglas discutes. Puede ser corta. |
| El motor | Funciones puras, sin red ni base de datos, con pruebas que incluyan el caso de verificación de la sección 07. |
| La página web | Cargar una cartola en JSON o CSV, ver el diagnóstico y las propuestas que tu nivel permita. Si llegas al documento, que se pueda imprimir a PDF. |
| Repositorio y sitio | Un repositorio público en GitHub y un sitio en GitHub Pages, ambos a tu nombre. |
| README.md | Cómo correr el sitio, cómo correr las pruebas, qué stack usaste y por qué. |

### Condiciones

- Sin base de datos ni servidor. Los datos viven como archivos JSON dentro del repositorio y todo corre en el navegador.
- Sin cuentas ni llaves de API. Si algo necesita una llave, no entra.
- Sin datos reales de clientes. Usa los datos de ejemplo de este documento y los que inventes tú.
- Stack libre y gratuito. Elige el que quieras y justifícalo en una línea del README.
- Puedes usar herramientas de IA para programar. Tienes que poder explicar cada decisión, y en la presentación cambiaremos datos en vivo.
- El repositorio es tuyo y es público. No uses el nombre ni la marca de varenne en él y no copies este documento. Los datos de ejemplo sí puedes incluirlos.

### Un orden que te sugerimos

1. Lee los cinco archivos de datos y escribe tu SPEC.md, aunque sea corta.
2. Programa el motor del nivel 1 y comprueba que da las cifras de la sección 07.
3. Arma la página para mostrarlo.
4. Publica en GitHub antes de seguir. Un nivel 1 publicado vale más que un nivel 3 sin publicar.
5. Sigue con los niveles 2 y 3 si tienes tiempo.

### Cómo lo publicas

1. Crea un repositorio público en tu cuenta de GitHub.
2. Sube el código, los datos de ejemplo y tu SPEC.md.
3. Activa GitHub Pages desde la configuración del repositorio.
4. Abre el sitio en una ventana privada y comprueba que funciona sin tu sesión.
5. Envíanos los dos enlaces: el del repositorio y el del sitio.

### Cómo lo presentas

Nos muestras el sitio y el repositorio. Cambiamos datos en vivo, por ejemplo un mínimo, una comisión o una serie cerrada, y miramos cómo responde el motor. Nos explicas tus decisiones y qué reglas cambiarías.

### Lo que no te pedimos

Inicio de sesión, usuarios, base de datos, tiempo real, diseño de marca ni inteligencia artificial dentro del cálculo. El cálculo es determinista.

09

09 · Cómo evaluamos

## Evaluamos tu criterio más que la cantidad de reglas.

Queremos ver cómo piensas, cómo explicas lo que hiciste y qué haces cuando algo no está claro. Un nivel 1 limpio, bien probado y bien explicado es un buen resultado.

| Criterio | Qué miramos |
|---|---|
| Fidelidad a las reglas | Los casos límite y las cifras del caso de verificación. |
| Especificación | Claridad, decisiones explícitas, y lo que dejas fuera con su motivo. |
| Corrección | Pruebas, y que las mismas entradas den el mismo resultado. |
| Honestidad del producto | Los textos no prometen lo que el motor no sabe, y los controles que hagas frenan de verdad. |
| Ingeniería | Estructura, separación entre motor y página, y simplicidad. |
| Criterio | Una regla que discutes con argumentos pesa más que una que copias. |
| Publicación y presentación | El sitio abre, el repositorio se entiende y explicas lo que hiciste. |

## Cuando termines, envíanos dos enlaces.

El repositorio y el sitio. Con eso agendamos la presentación.

Si algo del enunciado no está claro, pregúntanos antes de suponer. Cómo preguntas también cuenta.

Test técnico · 20 oct 2026 · Datos de ejemplo


# Contexto extraído del enunciado

Fecha de extracción: 2026-10-22. Material de trabajo interno para especificación y planificación.
Fuentes locales: [HTML](../../test-motor-de-propuestas.html) y
[Markdown](../../test-motor-de-propuestas.md), enunciado fechado 2026-10-20.

## Propósito y procedencia

Ambas fuentes presentan el mismo test técnico de producto. Se revisó el contenido documental
del HTML, incluidas reglas plegadas, tablas y bloques de datos, y el Markdown. Los cinco
conjuntos JSON coinciden por contenido; las diferencias de presentación, botones de copia,
navegación y avisos de impresión no introducen reglas de negocio adicionales.
Este anexo sintetiza el contexto de las nueve secciones y conserva todos los datos ficticios;
no constituye una copia del diseño ni una obligación de implementar los tres niveles.
La fuente de alcance de esta entrega es [spec.md](spec.md).

## Contexto de las secciones 01 a 05

- **Situación**: Un asesor distribuidor recibe una cartola y necesita diagnosticar su costo
  y preparar alternativas que una persona revisa y acepta. No administra fondos ni custodia
  el dinero: las AGF administran y registran las cuotas del cliente.
- **Entradas**: Cartola, catálogo y acuerdos; para niveles siguientes, supuestos y meta.
  El ejemplo tiene siete posiciones y 235 millones de CLP al corte 2026-09-30.
- **Objetivos posibles**: Reducir costos manteniendo o bajando riesgo; o financiar una meta
  cuyos pagos tienen fechas. Esta entrega selecciona solo diagnóstico y cambio de serie.
- **Fondo**: Inversión colectiva dividida en cuotas. El monto se contrasta con cuotas por valor
  cuota. Las series del mismo fondo comparten inversión, pero cambian costos y requisitos.
- **TAC**: Costo anual porcentual incorporado al valor de cuota; no es una factura adicional
  ni depende de que la inversión gane. Mínimos, APV, mandato y apertura limitan acceso.
- **Distribución**: Solo los acuerdos vigentes permiten ofrecer productos de una AGF.
  Una comisión de distribución puede variar entre series y no debe guiar la propuesta.
- **Patrimonio agregado**: Patrimonio del distribuidor en la AGF que puede permitir cumplir
  un mínimo; no convierte automáticamente una alternativa en elegible sin condición.
- **Perfil y volatilidad**: Contexto del riesgo permitido y de fluctuación de la inversión.
  La UF reajusta por inflación y se usa en metas futuras. No se requieren proyecciones en nivel 1.
- **Principios de producto**: Decisión humana, cifras respaldadas por datos y reglas,
  declaración del universo considerado y reconocimiento de alternativas fuera de acuerdos.
- **Cadena completa del producto**: Leer → diagnosticar → proponer → verificar → documentar.
  Nivel 1 implementa las primeras etapas hasta comparar series en pantalla; las restantes
  se introducen de acuerdo con el nivel elegido.
- **Ejemplo individual**: Alfa Deuda UF, 60 millones CLP en CLASI al 2,10 %, cuesta
  1.260.000 CLP al año. B al 1,45 % ahorra 390.000 CLP y 65 bps; F al 0,95 % permitiría
  300.000 CLP adicionales si se confirma agregación; M exige mandato; APV no aplica.

## Tipos de producto y costos

| Tipo | Lectura | Uso como destino en el producto completo | Costo |
| --- | --- | --- | --- |
| mutual_fund | Sí | Según acuerdos y acceso | TAC de serie |
| investment_fund | Sí | Según acuerdos y acceso | TAC de serie |
| time_deposit | Sí | Permitido sin AGF | Cero |
| cash | Sí | Permitido sin AGF | Cero |
| equity_etf | Sí | Solo si existe costo en catálogo | Costo declarado |
| insurance_savings | Sí | Requiere sección específica R11 | Fuera de TAC ponderada |
| other | Texto declarado | No | Excluido |

En nivel 1, permitir un tipo de producto en el universo no implica reasignar dinero hacia él:
solo se comparan series dentro del fondo ya poseído.

## Trazabilidad de reglas de la sección 06

| Regla | Contenido de negocio | Tratamiento en esta entrega |
| --- | --- | --- |
| R01 | Universo leído completo; destinos limitados por acuerdos vigentes y habilitación | FR-008, FR-009 |
| R02 | Costos ponderados sobre monto identificado; depósitos/caja a cero; exclusiones y discrepancias | FR-004 a FR-007 |
| R03 | Costo acumulado por saldos medios y retorno real neto con supuestos rotulados | Futuro nivel 2 |
| R04 | Primera coincidencia entre reglas 0 a 6; motivos y condiciones | FR-010 a FR-013 |
| R05 | Mejor serie elegible del mismo fondo/AGF; ahorro CLP y bps; condicional separado | FR-014 a FR-017 |
| R06 | Metas por fechas, tramos, VP, déficit, liquidez, concentración y perfil | Futuro nivel 2 |
| R07 | Priorizar riesgo no mayor, después costo y concentración; método de riesgo declarado | Futuro nivel 2; nivel 1 conserva la exposición |
| R08 | Titular costo/riesgo/ambos/ninguno y tolerancias; ninguno impide documento | Futuro nivel 3 |
| R09 | Nueve controles con evidencia y estados ok/warn/block | Futuro nivel 3 |
| R10 | Comisión solo para control y auditoría; divulgación configurable y justificada | Independencia transversal FR-018; documento formal futuro |
| R11 | Seguros separados, desglose ahorro/prima, costos 5/10/20 años y rescate | Solo reconocimiento/exclusión de TAC; sección completa futura |
| R12 | Documento reproducible, inmutable, instantánea de entradas y huella SHA-256 | Futuro nivel 3 |
| R13 | Historia opcional a 6 meses, 1 y 10 años; no extrapolar sin historia | Fuera de alcance |

### Contexto retenido de niveles posteriores

- R03: costo acumulado es suma de saldo medio por TAC; saldo medio es el promedio entre
  saldo anterior y actual. Retorno real neto es retorno bruto ponderado menos TAC ponderada.
  Los retornos salen de supuestos, no representan historia ni promesa.
- R06: ordenar desembolsos; asignar tramos por meses; calcular valores presentes por flujo;
  obtener pesos sobre capital; declarar déficit y asignar excedente al tramo más largo.
  Dentro del tramo, respetar categoría, menor costo elegible y liquidez compatible;
  aplicar concentración y crecimiento según perfil, reduciendo el tope cerca del primer pago.
  Nunca cubrir una brecha aumentando riesgo fuera del perfil.
- Escenarios: ajustes al retorno bruto de −1,5 pp, 0 pp y +1,5 pp. Reportar saldo final UF
  o fecha de agotamiento y proporción de pagos cubiertos.
- R07: primero no aumentar volatilidad, después minimizar costo y respetar concentración.
  Orden sugerido: serie, equivalente de categoría dentro de acuerdos y reasignación al perfil.
  Se puede discutir el orden, pero el método de riesgo debe ser igual antes y después.
- R08: solo costo o riesgo pueden justificar el titular; retorno no lo encabeza.
- R10: mostrar comisiones al cliente es una decisión abierta que debe justificarse y ser
  configurable; no se requiere interpretarla como una exigencia legal externa.
- R11: costo de permanencia del seguro incluye rescate, separa ahorro de prima y declara
  la mezcla de cobertura y ahorro. No se mezcla con la TAC de fondos.
- R12: bloques del documento: identificación/corte, diagnóstico, comparación/titular,
  riesgo o proyección, seguros si corresponde, tareas previas, declaraciones y huella.
  Declaraciones incluyen universo, supuestos, fuentes y período/obtención, estimaciones,
  no identificados y razones de BEST_ACCESSIBLE. Se congelan entradas, versiones y controles;
  JSON canónico alimenta SHA-256. Las correcciones generan una nueva versión y se imprime a PDF.
- R13: si se inventa historia por no disponer de datos, se rotula explícitamente ficticia.

### Controles de nivel 3 retenidos como contexto

| Control | Aplicación | Condición y efecto |
| --- | --- | --- |
| HEADLINE_NONE | Costos | Sin mejora de costo/riesgo, bloquea documento |
| RISK_SHIFT | Costos | Aumento de riesgo bloquea hasta aceptación registrada |
| ANCLA_COSTO | Costos | Al menos 40 % de mejora neta debe provenir de TAC menor; parámetro |
| BEST_ACCESSIBLE | Ambas | Alternativa elegible más barata en categoría bloquea hasta motivo registrado e impreso |
| HIDDEN_DEFICIT | Meta | Base ≥100 % y adverso <90 % exige declaración; si falta, bloquea |
| INSURANCE_MIX | Ambas | Falta desglose ahorro/prima bloquea |
| PESOS_NO_SUMAN | Ambas | Fuera de 100 % ±0,5 pp bloquea |
| PERFIL_VENCIDO | Ambas | Umbral definido por quien implementa; advierte |
| SIN_IDENTIFICAR | Ambas | Advierte y exige declaración |

Los mensajes deben decir qué ocurre y cómo resolverlo, sin promesas ni lenguaje punitivo.
Un único bloqueo impide el documento formal. El caso de prueba futuro de BEST_ACCESSIBLE
compara Alfa Deuda UF B (1,45 %, comisión 0,55 %) con Delta Deuda Corporativa UF B
(1,05 %, comisión 0,30 %), elegible para 60 millones en la misma categoría. La alternativa
más barata dispara el control; series condicionales y empates no lo disparan. En nivel 1
esta comparación entre fondos está fuera de alcance y no invalida el ahorro por serie.

## Datos y casos de referencia de la sección 07

- Seis emisores: Alfa, Beta, Gamma, Delta, Épsilon y Banco Ejemplo.
- Doce productos, 26 series de fondos y tres productos sin serie.
- Alfa: agregado 180 millones al 2026-09-30, sin mandato; Beta: 40 millones y con mandato;
  Delta: 15 millones y sin mandato. Gamma carece de acuerdo.
- Casos deliberados: Alfa RV A cerrada; APV no permitido al cliente; mandato Alfa/Beta
  distinto; F accesible solo por agregación; Gamma leído sin destinos; deuda UF larga solo
  en Gamma; línea Zeta sin identificar.
- Diagnóstico y ahorro exactos: tablas completas en [spec.md](spec.md), sin duplicar aquí
  un segundo conjunto de criterios de aceptación.
- Meta futura: educación de dos hijos, capital 70 millones = 1.750 UF a 40.000 CLP/UF;
  ocho pagos de marzo 2031 a marzo 2038, total 2.200 UF = 88 millones al valor de referencia.
  El enunciado no fija resultado esperado: alrededor de 3 % neto real puede alcanzar;
  con 2 % el VP ronda 1.882 UF y con 3,5 % ronda 1.680 UF. Son referencias, no promesas.
- Las categorías, retornos, volatilidades, perfiles, concentración, tramos y escenarios
  completos quedan conservados en el bloque `supuestos.json` al final.

## Entrega y evaluación de las secciones 08 y 09

La entrega del candidato comprende especificación propia `SPEC.md`, motor puro y pruebas,
página que importa JSON o CSV, repositorio público y GitHub Pages, y `README.md` con uso,
pruebas, stack y justificación. Todo corre localmente en el navegador, sin base de datos,
servidor de aplicación, cuentas, llaves ni datos reales. El stack es libre y gratuito.
Se permite IA para desarrollar, pero cada decisión debe poder explicarse y el cálculo es
determinista. La marca de la entidad y el enunciado no se publican con la solución; los datos
ficticios sí pueden incluirse. Los cinco conjuntos se destinan a `data/` en la futura aplicación.

El orden sugerido es leer datos, especificar, completar nivel 1, crear la página y publicar
antes de ampliar niveles. Deben entregarse enlaces de repositorio y sitio, comprobar acceso
sin sesión privada y explicar decisiones durante cambios en vivo de mínimo, comisión o cierre.
Los criterios evalúan fidelidad, decisiones explícitas, corrección reproducible, honestidad,
separación motor/interfaz, simplicidad, argumentos, publicación y capacidad de explicación.
No se pide login, gestión de usuarios, tiempo real, diseño de marca ni IA en el cálculo.

## Decisiones adoptadas y diferencias de interpretación

- Las dos fuentes no contradicen los datos JSON. Las unidades porcentuales de las fórmulas
  se concretan en la especificación para impedir errores de factor 100.
- «Empezó antes» se conserva como inicio anterior estricto; término igual al corte es válido.
- Se elige JSON como la opción de importación de nivel 1, sin imponer CSV adicional.
- «Actual» es etiqueta de tenencia; no salta la evaluación de acceso para nuevas propuestas.
- 210 millones en tabla de cambios corresponde solo a los fondos; 230 millones incluye depósito
  y es la base de TAC. El ahorro condicional es adicional al elegible, no al costo inicial.
- Redondeo, empates y entradas inválidas se concretan como supuestos explícitos en `spec.md`.
- La documentación se mantiene interna durante Specify. Publicación, datos en `data/`, código,
  pruebas y documentación de operación corresponden a fases posteriores.

## Datos ficticios originales

Los siguientes bloques se extrajeron de ambos documentos y se compararon como datos.
Se conserva el contenido completo de los cinco, incluidos avisos y campos ajenos al nivel 1.
No son archivos de datos ejecutables ni selección de tecnología.

### catalogo.json

```json
{
  "_aviso": "Dato de ejemplo. Administradoras, fondos, series y costos ficticios.",
  "_nota": "En cada serie, los campos omitidos valen: abierta = true, solo_apv = false, requiere_mandato = false. La TAC es anual, en porcentaje.",
  "version": "ejemplo-2026-10",
  "corte_costos": "2026-09-30",
  "fuente_costos": "Dato de ejemplo",
  "emisores": [
    {
      "id": "alfa",
      "nombre": "AGF Alfa",
      "tipo": "agf"
    },
    {
      "id": "beta",
      "nombre": "AGF Beta",
      "tipo": "agf"
    },
    {
      "id": "gamma",
      "nombre": "AGF Gamma",
      "tipo": "agf"
    },
    {
      "id": "delta",
      "nombre": "AGF Delta",
      "tipo": "agf"
    },
    {
      "id": "epsilon",
      "nombre": "Seguros Épsilon",
      "tipo": "aseguradora"
    },
    {
      "id": "banco-ejemplo",
      "nombre": "Banco Ejemplo",
      "tipo": "banco"
    }
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
        {
          "codigo": "CLASI",
          "tac_pct": 2.1,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 1.45,
          "minimo_clp": 5000000
        },
        {
          "codigo": "F",
          "tac_pct": 0.95,
          "minimo_clp": 100000000
        },
        {
          "codigo": "M",
          "tac_pct": 1.0,
          "minimo_clp": 0,
          "requiere_mandato": true
        },
        {
          "codigo": "APV",
          "tac_pct": 0.8,
          "minimo_clp": 0,
          "solo_apv": true
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 3.2,
          "minimo_clp": 0
        },
        {
          "codigo": "A",
          "tac_pct": 2.6,
          "minimo_clp": 0,
          "abierta": false
        },
        {
          "codigo": "B",
          "tac_pct": 2.3,
          "minimo_clp": 5000000
        },
        {
          "codigo": "F",
          "tac_pct": 1.6,
          "minimo_clp": 150000000
        },
        {
          "codigo": "APV",
          "tac_pct": 1.4,
          "minimo_clp": 0,
          "solo_apv": true
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 1.1,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 0.75,
          "minimo_clp": 10000000
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 1.15,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 0.7,
          "minimo_clp": 10000000
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 2.8,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 1.95,
          "minimo_clp": 20000000
        },
        {
          "codigo": "M",
          "tac_pct": 1.3,
          "minimo_clp": 0,
          "requiere_mandato": true
        },
        {
          "codigo": "APV",
          "tac_pct": 1.5,
          "minimo_clp": 0,
          "solo_apv": true
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 3.0,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 2.1,
          "minimo_clp": 5000000
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 1.9,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 1.2,
          "minimo_clp": 30000000
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 1.7,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 1.05,
          "minimo_clp": 10000000
        }
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
        {
          "codigo": "CLASI",
          "tac_pct": 1.35,
          "minimo_clp": 0
        },
        {
          "codigo": "B",
          "tac_pct": 0.6,
          "minimo_clp": 10000000
        }
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
        {
          "horizonte_anios": 5,
          "costo_total_pct_de_aportes": 14.0,
          "multa_rescate_pct": 8.0
        },
        {
          "horizonte_anios": 10,
          "costo_total_pct_de_aportes": 11.0,
          "multa_rescate_pct": 4.0
        },
        {
          "horizonte_anios": 20,
          "costo_total_pct_de_aportes": 9.0,
          "multa_rescate_pct": 0.0
        }
      ]
    }
  ]
}
```

### acuerdos.json

```json
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
        "alfa-deuda-uf": {
          "CLASI": 0.8,
          "B": 0.55,
          "F": 0.2,
          "M": 0.3,
          "APV": 0.3
        },
        "alfa-rv-global": {
          "CLASI": 1.0,
          "A": 0.6,
          "B": 0.7,
          "F": 0.3,
          "APV": 0.4
        }
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
        "beta-corto-clp": {
          "CLASI": 0.4,
          "B": 0.25
        },
        "beta-deuda-uf-corto": {
          "CLASI": 0.5,
          "B": 0.3
        },
        "beta-balanceado": {
          "CLASI": 0.9,
          "B": 0.6,
          "M": 0.35,
          "APV": 0.4
        }
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
        "delta-deuda-corp": {
          "CLASI": 0.7,
          "B": 0.3
        },
        "delta-rv-global-idx": {
          "CLASI": 0.5,
          "B": 0.2
        }
      }
    }
  ],
  "productos_sin_serie": {
    "deposito-uf-90d": {
      "comision_distribucion_pct": 0.0
    },
    "efectivo-clp": {
      "comision_distribucion_pct": 0.0
    },
    "seguro-epsilon-ahorro": {
      "comision_distribucion_pct": 3.0
    }
  }
}
```

### cartola.json

```json
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
    {
      "producto": "alfa-deuda-uf",
      "serie": "CLASI",
      "cuotas": 40000.0,
      "valor_cuota": 1500.0,
      "monto_clp": 60000000
    },
    {
      "producto": "alfa-rv-global",
      "serie": "CLASI",
      "cuotas": 30000.0,
      "valor_cuota": 1500.0,
      "monto_clp": 45000000
    },
    {
      "producto": "beta-balanceado",
      "serie": "CLASI",
      "cuotas": 25000.0,
      "valor_cuota": 2000.0,
      "monto_clp": 50000000
    },
    {
      "producto": "beta-corto-clp",
      "serie": "CLASI",
      "cuotas": 20000.0,
      "valor_cuota": 1500.0,
      "monto_clp": 30000000
    },
    {
      "producto": "gamma-rv-chile",
      "serie": "CLASI",
      "cuotas": 10000.0,
      "valor_cuota": 2500.0,
      "monto_clp": 25000000
    },
    {
      "producto": "deposito-uf-90d",
      "serie": null,
      "cuotas": null,
      "valor_cuota": null,
      "monto_clp": 20000000
    },
    {
      "producto": null,
      "descripcion_original": "FM Zeta Acciones Asia, serie A",
      "serie": null,
      "cuotas": null,
      "valor_cuota": null,
      "monto_clp": 5000000
    }
  ]
}
```

### supuestos.json

```json
{
  "_aviso": "Dato de ejemplo. Son supuestos declarados, no historia.",
  "uf": {
    "valor_clp": 40000,
    "fecha": "2026-09-30"
  },
  "categorias": {
    "caja": {
      "retorno_real_bruto_pct": 0.5,
      "volatilidad_pct": 0.5,
      "peso_crecimiento": 0
    },
    "deposito_plazo": {
      "retorno_real_bruto_pct": 1.5,
      "volatilidad_pct": 0.8,
      "peso_crecimiento": 0
    },
    "deuda_corto_clp": {
      "retorno_real_bruto_pct": 0.8,
      "volatilidad_pct": 1.0,
      "peso_crecimiento": 0
    },
    "deuda_uf_corto": {
      "retorno_real_bruto_pct": 1.8,
      "volatilidad_pct": 2.0,
      "peso_crecimiento": 0
    },
    "deuda_uf_mediano": {
      "retorno_real_bruto_pct": 2.8,
      "volatilidad_pct": 3.5,
      "peso_crecimiento": 0
    },
    "deuda_uf_largo": {
      "retorno_real_bruto_pct": 3.2,
      "volatilidad_pct": 6.0,
      "peso_crecimiento": 0
    },
    "balanceado": {
      "retorno_real_bruto_pct": 3.8,
      "volatilidad_pct": 8.0,
      "peso_crecimiento": 0.5
    },
    "rv_chile": {
      "retorno_real_bruto_pct": 4.5,
      "volatilidad_pct": 18.0,
      "peso_crecimiento": 1
    },
    "rv_global": {
      "retorno_real_bruto_pct": 5.0,
      "volatilidad_pct": 15.0,
      "peso_crecimiento": 1
    }
  },
  "perfiles": {
    "conservador": {
      "max_crecimiento_pct": 20
    },
    "moderado": {
      "max_crecimiento_pct": 50
    },
    "agresivo": {
      "max_crecimiento_pct": 80
    }
  },
  "limites": {
    "max_por_fondo_pct": 40,
    "max_por_agf_pct": 60
  },
  "tramos": [
    {
      "id": "T1",
      "desde_meses": 0,
      "hasta_meses": 24,
      "categorias": [
        "caja",
        "deposito_plazo",
        "deuda_corto_clp"
      ]
    },
    {
      "id": "T2",
      "desde_meses": 24,
      "hasta_meses": 60,
      "categorias": [
        "deuda_uf_corto"
      ]
    },
    {
      "id": "T3",
      "desde_meses": 60,
      "hasta_meses": 96,
      "categorias": [
        "deuda_uf_mediano",
        "deuda_uf_largo"
      ]
    },
    {
      "id": "T4",
      "desde_meses": 96,
      "hasta_meses": null,
      "categorias": [
        "balanceado",
        "rv_chile",
        "rv_global"
      ]
    }
  ],
  "escenarios": [
    {
      "id": "adverso",
      "ajuste_retorno_pp": -1.5
    },
    {
      "id": "base",
      "ajuste_retorno_pp": 0
    },
    {
      "id": "favorable",
      "ajuste_retorno_pp": 1.5
    }
  ]
}
```

### meta.json

```json
{
  "_aviso": "Dato de ejemplo. Meta ficticia para la modalidad A.",
  "tipo": "educacion",
  "nombre": "Educación universitaria de dos hijos",
  "referencia_cliente": "ACC-4471",
  "capital_asignado_clp": 70000000,
  "valor_uf_clp": 40000,
  "fecha_referencia": "2026-09-30",
  "desembolsos": [
    {
      "fecha": "2031-03-01",
      "uf": 220
    },
    {
      "fecha": "2032-03-01",
      "uf": 220
    },
    {
      "fecha": "2033-03-01",
      "uf": 220
    },
    {
      "fecha": "2034-03-01",
      "uf": 440
    },
    {
      "fecha": "2035-03-01",
      "uf": 440
    },
    {
      "fecha": "2036-03-01",
      "uf": 220
    },
    {
      "fecha": "2037-03-01",
      "uf": 220
    },
    {
      "fecha": "2038-03-01",
      "uf": 220
    }
  ]
}
```

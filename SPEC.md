# Alcance y decisiones del nivel 1 — Motor_inversiones

## Alcance de este documento

Este documento resume exclusivamente diagnóstico de costos, acceso y comparación de series del nivel 1. Su especificación está en [spec.md](specs/001-diagnostico-cambio-serie/spec.md). La aplicación contiene modalidades adicionales; su existencia no amplía R05 ni autoriza a atribuirles ahorro por cambio de serie.

Las reglas y decisiones vigentes de propuestas de costo y meta pertenecen a [la especificación de nivel 2](specs/002-propuestas-costo-meta/spec.md). Sus contratos, modelo de datos, plan, investigación, tareas y guía de validación están en `specs/002-propuestas-costo-meta/`; el registro de correcciones está en [docs/correccion-nivel-2.md](docs/correccion-nivel-2.md). Esta separación evita atribuir capacidades de nivel 2 al diagnóstico de nivel 1.

## Entradas y diagnóstico

La aplicación inicia vacía. Se seleccionan cartola, catálogo y acuerdos; el diagnóstico no necesita supuestos ni meta. Cartola, catálogo, acuerdos y las entradas de nivel 2 admiten JSON o CSV; se pueden combinar formatos. Los archivos se procesan localmente, sin cuentas, servidor de aplicación ni API financiera.

Monto_clp es obligatorio y se conserva como base. Cuotas por valor cuota comprueba la valorización; una diferencia absoluta mayor de 1 CLP produce advertencia sin cambiar el monto.

Efectivo y depósitos son computables con costo cero. Seguros, other y productos reconocidos sin costo verificable quedan excluidos. Producto o serie actual desconocidos permanecen sin identificar. Un ETF usa tac_pct del producto si está declarada.

El total concilia como computable más sin identificar más excluido. Identificado suma lo reconocido, incluidas exclusiones; no es sinónimo de base computable. TAC y pesos usan solo esa base.

## Acceso y ahorro

La vigencia exige estado activo, inicio anterior al corte y fin nulo o igual/posterior al corte. Hay un solo registro por emisor en acuerdos; los duplicados se rechazan incluso si uno es histórico.

R04 se detiene en la primera coincidencia. Solo después de acuerdo/habilitación, cierre, APV y mandato, y con ticket insuficiente, se considera el patrimonio agregado. Si su fecha es posterior al corte, esa alternativa se bloquea por regla 5 con motivo temporal. El diagnóstico y las otras series continúan.

El ticket es individual. La tenencia actual no autoriza nuevas compras. Solo se cambia a una serie elegible, estrictamente más barata, del mismo fondo y AGF. Las mejoras empatadas se ordenan por código y se conservan como evidencia; un empate con la actual no produce cambio.

El adicional condicional parte de la mejor opción elegible aplicada o de la actual. Solo se suma la mejor reducción adicional positiva por posición y se muestra separada. Formalizar mandato o confirmar agregación exige actualizar datos y reevaluar.

Las comisiones se conservan en el contexto. Su valor no elige series, desempata ni se suma a TAC. La previsualización de Acuerdos muestra las comisiones recibidas; las tablas del análisis no las presentan como costo del cliente.

## Precisión y contratos efectivos

La lectura JSON usa JSON.parse y Zod; lossless-json no forma parte del proyecto. En JSON no hay preservación de lexemas arbitrarios ni rechazo específico de claves repetidas. Los límites de los números interpretados se aplican antes o durante la validación de negocio según el campo.

CSV se convierte al mismo modelo y pasa por el mismo esquema. Su cabecera, campos, nulos y límites están definidos en [el contrato CSV](specs/001-diagnostico-cambio-serie/contracts/input-csv.md). Se rechazan registros de distintos clientes o cortes y no se infieren separadores de miles. La cartola usa columnas por posición; catálogo, acuerdos, supuestos y meta usan las columnas ruta, tipo y valor para conservar listas y campos anidados, con padres explícitos y rutas únicas. La conversión numérica comprueba los dígitos significativos y la conservación del valor decimal antes de entregar un Number al modelo común.

La configuración privada de decimal.js tiene 40 dígitos significativos y ROUND_HALF_UP. La salida financiera usa cadenas decimales. CLP se presenta al peso, TAC agregada a cuatro decimales y pesos a dos. No se decide elegibilidad con cifras redondeadas.

Límites de importación: 5 × 1024 × 1024 bytes por archivo, 10.000 posiciones, 1.000 productos/emisores/acuerdos y 100 series por producto. Los montos, cuotas y mínimos comprobados por dominio admiten hasta 16 dígitos significativos; cero o valores positivos desde 10^-8 hasta 10^15. TAC y comisiones llegan hasta 100 %. Fechas entre 1900 y 2200. No existe una regla general de ocho decimales.

Los tipos de entrada contienen números, no unidades nominales ni texto decimal sin parsear. AnalizarCartola devuelve Analisis nivel-1.1 o lanza Error. No devuelve una unión ok/error. No muta entradas; clona su contexto sin prometer congelación profunda de toda la estructura.

## Arquitectura y archivos

Se mantienen dominio, aplicación, infraestructura y presentación. La función pura de aplicación coordina el diagnóstico; la interfaz gestiona archivos y estados. Los módulos y las pruebas están en src, no en un árbol tests separado.

| Requisitos | Regla | Archivos principales | Pruebas existentes |
| --- | --- | --- | --- |
| FR-001–003 | Entrada y contexto | infrastructure/input.ts; presentation/useAppWorkflow.ts | infrastructure/input.test.ts; presentation/tables.test.tsx |
| FR-004–005 | R01 | domain/eligibility.ts; domain/validation.ts | application/analizarCartola.test.ts |
| FR-006–009 | R02 | domain/diagnosis.ts; application/analizarCartola.ts | application/analizarCartola.test.ts; presentation/tables.test.tsx |
| FR-010–013 | R04 | domain/eligibility.ts; domain/model.ts | application/analizarCartola.test.ts |
| FR-014–017 | R05 | domain/diagnosis.ts; presentation/AnalysisView.tsx | application/analizarCartola.test.ts; presentation/tables.test.tsx |
| FR-018–020 | Independencia, determinismo y precisión | domain/numeric.ts; domain/diagnosis.ts; presentation/format.ts | application/analizarCartola.test.ts |
| FR-021–023 | Consulta y nuevas cargas | presentation/DataPanel.tsx; InputReview.tsx; AnalysisView.tsx; useAppWorkflow.ts | presentation/tables.test.tsx; verificaciones de recorrido pendientes |
| FR-024 | Trazabilidad | Esta matriz y documentos de nivel 1 | checklists/validation.md |

Las rutas de la tabla son relativas a src. Los contratos completos están en [entrada](specs/001-diagnostico-cambio-serie/contracts/input-json.md), [análisis](specs/001-diagnostico-cambio-serie/contracts/analysis.md) e [interfaz](specs/001-diagnostico-cambio-serie/contracts/ui.md).

## Presentación y límites observados

El análisis tiene Vista general, Posiciones y Series. La revisión de archivos permite consultar contenido y campos adicionales, con búsqueda y paginación donde corresponda. Cambiar un archivo invalida resultados; las lecturas obsoletas se descartan.

La inspección detectó diferencias que la documentación copiada daba por resueltas:

- La tabla principal de Series muestra «Actual» en lugar del estado/regla de esa serie. El motor sí conserva ambos datos.
- El resultado conserva evidencia completa y tareas, pero el recorrido principal no expone todos esos campos. El componente PositionDetail existe, aunque el enlace «Ver evidencia» del análisis lleva a la tabla general, sin seleccionar una posición.
- AnalysisView calcula algunos subtotales y TAC de subconjuntos a partir del resultado. No se acredita separación absoluta de todos los cálculos derivados de presentación.
- No se han acreditado para este checkout los benchmarks, contrastes, zoom ni pruebas DOM del otro proyecto.

Estos puntos permanecen documentados para una revisión de implementación posterior. La autorización actual es solo documental.

## Verificación y entrega

La revisión documental de nivel 1 ejecutó 121 pruebas en tres archivos y la comprobación de tipos, ambas sin fallos. El [registro de validación](specs/001-diagnostico-cambio-serie/checklists/validation.md) detalla esa evidencia y sus pendientes. La verificación posterior de nivel 2 se registra por separado para no mezclar alcances ni resultados.

El workflow existente se inicia manualmente, ejecuta pruebas y build y publica solo dist. No hay ejecución automática por pull request en ese archivo ni acciones fijadas a SHA; usa referencias de versión. No se ejecutó publicación ni se confirmó una URL pública en esta revisión.

Nivel 1 no genera proyecciones, propuestas entre fondos, controles de nivel 3, PDF ni huella. Sus pruebas no acreditan esos otros alcances.

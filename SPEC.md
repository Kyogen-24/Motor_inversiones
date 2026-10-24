# Especificación de entrega — Motor_inversiones

## Alcance

Nivel 1: R01, R02, R04 y R05. Carga JSON de cartola, catálogo y acuerdos; diagnóstico de costos, acceso por primera coincidencia, comparación de series del mismo fondo y AGF, evidencia y tareas condicionales. Comisiones independientes de selección y desempates.

La especificación detallada de trabajo es `specs/001-diagnostico-cambio-serie/spec.md` (FR-001 a FR-024). `ARCHITECTURE.md` define las cuatro capas. `DESIGN.md` y `docs/frontend-direction.md` guían la interfaz.

## Entradas y salidas

La aplicación inicia vacía y solicita selección manual de los tres archivos. Los archivos de entrada de `data/` definen el contrato JSON. Los importes se expresan en CLP y las TAC en porcentaje anual. Los campos omitidos de serie usan abierta=true, solo_apv=false y requiere_mandato=false. No se inventan TAC ni mínimos ausentes.

El resultado incluye contexto copiado, clasificación por posición, costos, pesos, alternativas con reglas y evidencia, selección elegible, empates, ahorro en CLP/bps y oportunidad condicional adicional. Los montos decimales se serializan como cadenas.

## Criterios de aceptación

- Ejemplo: 230.000.000 CLP computables y 5.000.000 sin identificar.
- Costo anual 5.180.000; TAC 2,2522 %.
- Ahorro elegible 1.650.000; costo posterior 3.530.000; TAC posterior 1,5348 %.
- Ahorro condicional adicional 615.000, separado del escenario elegible.
- Con condiciones cumplidas y acceso reevaluado: ahorro total posible 2.265.000; costo 2.915.000; TAC 1,2674 %. La tabla adicional compara desde la serie elegible o la actual si se conserva.
- Gamma conserva diagnóstico y ahorro cero al no existir acuerdo vigente.
- Modificar comisiones no modifica decisiones. Modificar acceso o TAC recalcula resultados.
- Una carga inválida no presenta cifras anteriores como vigentes.
- Uso por teclado, foco visible, tablas con encabezados y regiones desplazables en móvil.

## Cierre de presentación — 2026-10-24

Alcance aceptado por el usuario: gráfico de costo actual, elegible y con condiciones cumplidas; tablas separadas de ahorro elegible y condicional adicional; resumen textual y bases de TAC explícitas sin columnas nuevas. En el caso de referencia, las bases son 230.000.000 CLP en el gráfico, 210.000.000 en la tabla elegible y 105.000.000 en la condicional. Las TAC de los subconjuntos no se presentan como TAC de toda la cartera.

Diagnóstico de costos conserva todas las posiciones. Estado de cada serie solo incluye posiciones con series evaluables; ser computable no implica tener series. Los productos sin series no aparecen en comparación de series, y los no identificados permanecen pendientes en diagnóstico. Gamma conserva costo y ahorro cero por falta de acuerdo; cambiar de AGF pertenece al Nivel 2.

El cierre no acredita una revisión visual nueva ni la navegación contextual de evidencia. El estado y las comprobaciones se registran en `docs/acceptance-audit.md`.

## Decisiones

La política numérica, límites de entrada y recuperación de errores se documentan en README.md. La vigencia usa corte, no reloj del equipo. Se conserva el monto declarado y se advierte una discrepancia superior a 1 CLP. No se consolidan tickets. Si no hay reducción estricta se mantiene actual; los empates más baratos se resuelven por código de serie.

Actualización implementada el 2026-10-24: R04 contrasta la fecha del patrimonio agregado únicamente cuando el ticket no alcanza el mínimo y ninguna regla 0 a 3 ha determinado estado. La agregación requiere monto suficiente y fecha anterior o igual al corte; un dato posterior no acredita el mínimo. Si no hay agregado válido suficiente, corresponde regla 5 con motivo de monto o fecha, sin invalidar el acuerdo ni bloquear las otras series de la AGF. Se conserva regla 3 cuando falta mandato y se exige reevaluar después de cumplir sus tareas. La evidencia incluye el corte y los resultados usan `nivel-1.1`. Los escenarios y criterios están en FR-012, FR-013 y SC-010 de la especificación detallada.

## Exclusiones y evolución

Niveles 2 y 3 son posteriores. No se anuncia documento inmutable, controles completos, firma, historia ni retorno. La pureza del motor, entradas explícitas, contexto y evidencia preparan esa evolución. Seguros se reconocen y excluyen de la TAC; no se implementa su desglose documental completo.

## Entrega

Aplicación estática sin marca gráfica. El flujo de Pages publica solo `dist`. La publicación en un repositorio público propio y su sitio de GitHub Pages siguen pendientes. El despliegue desde `main` es manual mediante GitHub Actions. El enunciado y los anexos internos no forman parte de la distribución pública.

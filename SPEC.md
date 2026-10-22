# Especificación de entrega — Varenne

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
- Gamma conserva diagnóstico y ahorro cero al no existir acuerdo vigente.
- Modificar comisiones no modifica decisiones. Modificar acceso o TAC recalcula resultados.
- Una carga inválida no presenta cifras anteriores como vigentes.
- Uso por teclado, foco visible, tablas con encabezados y regiones desplazables en móvil.

## Decisiones

La política numérica, límites de entrada y recuperación de errores se documentan en README.md. La vigencia usa corte, no reloj del equipo. Se conserva el monto declarado y se advierte una discrepancia superior a 1 CLP. No se consolidan tickets. Si no hay reducción estricta se mantiene actual; los empates más baratos se resuelven por código de serie.

## Exclusiones y evolución

Niveles 2 y 3 son posteriores. No se anuncia documento inmutable, controles completos, firma, historia ni retorno. La pureza del motor, entradas explícitas, contexto y evidencia preparan esa evolución. Seguros se reconocen y excluyen de la TAC; no se implementa su desglose documental completo.

## Entrega

Aplicación estática con marca propia Varenne. El flujo de Pages publica solo `dist`. La creación de repositorio remoto y publicación quedan pendientes; no se incluyen en esta construcción local. El enunciado y anexos internos no forman parte de la distribución pública.

# Investigación: patrimonio agregado al corte

Fecha: 2026-10-24. Alcance: decisiones necesarias para FR-012/013 y SC-010 sobre
la aplicación existente. Investigación local de código y revisión independiente acotada;
no se requiere seleccionar tecnologías nuevas ni consultar información financiera externa.

## 1. Ubicación de la validación temporal

- **Decisión**: Comprobar fecha en `evaluarAcceso`, solo tras reglas 0–3 y con ticket
  inferior al mínimo. Fechas AAAA-MM-DD ya validadas admiten comparación inclusiva directa.
- **Razón**: `eligibility.ts` ya resuelve R04. `validation.ts` valida fechas existentes,
  pero no compara patrimonio/corte; añadir allí una restricción global rompería el caso B/F.
- **Alternativas descartadas**: Rechazar todo el archivo/acuerdo; insertar una regla previa;
  usar el reloj del equipo; retrotraer la fecha; imponer antigüedad máxima no solicitada.

## 2. Evidencia y contratos

- **Decisión**: Añadir solo `corte: string` a `Acceso.evidencia`; conservar agregado,
  patrimonioAl, ticket y mínimo. `regla` y `motivo` existentes explican uso o descarte.
- **Razón**: El corte ya está disponible en `Cartola`. El resultado llega a UI y tareas;
  no hacen falta parámetros nuevos ni estados duplicados de validación temporal.
- **Alternativas descartadas**: Convertir patrimonio futuro a cero, borrarlo, agregar
  banderas/enumeraciones redundantes o cambiar JSON de entrada para adjuntar acreditaciones.

## 3. Mandato y tareas

- **Decisión**: Conservar regla 3 si falta mandato. Con ticket insuficiente, las tareas
  deben pedir patrimonio suficiente al corte o alcanzar el mínimo con el ticket, además
  de formalizar mandato, obtener confirmación escrita y reevaluar.
- **Razón**: `tareasCondicionales` hoy solo revisa monto. Preparar tareas no autoriza
  saltar la primera coincidencia ni acreditar el patrimonio futuro.
- **Alternativas descartadas**: Bloquear anticipadamente la regla 3 o afirmar que formalizar
  el mandato basta para cumplir el mínimo. La decisión final corresponde a una nueva evaluación.

## 4. Ahorros y regresión

- **Decisión**: Conservar filtros y fórmulas de `diagnosis.ts` y totales de aplicación.
  Verificar que F bloqueada desaparezca de oportunidades sin eliminar otras condicionales.
- **Razón**: R05 ya filtra elegibles y condicionales por estado. Con patrimonio Alfa futuro,
  M de Deuda UF sigue regla 3 y produce 270.000 adicionales frente a B; no exigir total cero.
- **Alternativas descartadas**: Anular todas las oportunidades de una AGF o alterar la TAC diagnosticada.

## 5. Presentación y versión

- **Decisión**: Añadir el corte al detalle existente, mantener motivo desde el motor y
  actualizar la descripción R04. Identificar el resultado corregido como `nivel-1.1`.
- **Razón**: `PositionDetail.tsx` ya muestra monto/fecha; una fila más hace auditable
  el descarte. La marca diferencia resultados bajo la regla anterior sin crear historial.
- **Alternativas descartadas**: Recalcular acceso en React, nuevas pantallas o un sistema de migraciones.

## Resultado

Sin decisiones abiertas. Se conservan stack, archivos de entrada y arquitectura.
La revisión independiente confirma la evidencia mínima y la matriz de fechas/prioridades.
El diseño no acredita implementación, pruebas nuevas ni cierre de SC-005/SC-009.

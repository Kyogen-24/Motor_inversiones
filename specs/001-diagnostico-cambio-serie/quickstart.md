# Guía de validación — patrimonio agregado al corte

Estado: escenarios esperados para la implementación; no son resultados de pruebas
ejecutadas por `$speckit-plan`. Contrato en [contracts/entrada-y-acceso.md](contracts/entrada-y-acceso.md),
reglas y datos en [data-model.md](data-model.md).

## Preparación

Desde la raíz del repositorio, con Node compatible con la instalación actual y npm:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

Usar la dirección que imprima Vite. Seleccionar manualmente los tres JSON de `data/`.
Para variantes, trabajar con copias locales; no modificar los originales ni guardar
datos reales de clientes. Para verificar la compilación, usar `npm run preview` después
de `build` y repetir la carga desde la dirección indicada.

## Caso original y cambio solo de fecha

1. Original: corte y patrimonio Alfa `2026-09-30`. En Deuda UF, B es regla 6,
   F regla 4, M regla 3 y APV regla 2. Totales: costo 5.180.000 CLP, ahorro elegible
   1.650.000, costo posterior 3.530.000 y condicional 615.000; TAC 2,2522 % y 1,5348 %.
2. Cambiar solo `acuerdos[0].patrimonio_al` a `2026-10-01` y cargar esa copia de acuerdos.
   La carga sigue siendo válida. B continúa elegible, las F de Deuda UF y RV Global
   pasan a regla 5 con motivo temporal; M conserva regla 3. No se bloquea todo Alfa.
3. Costos y ahorro elegible permanecen. El adicional total pasa a 270.000 CLP por M de
   Deuda UF: (1,45 % de B − 1,00 % de M) × 60.000.000 / 100. No atribuir ahorro a F.
4. Abrir evidencia de F: comprobar 180 M declarados, fecha `2026-10-01`, corte
   `2026-09-30`, ticket 60 M y mínimo 100 M, con motivo que explique el descarte temporal.
5. Restaurar fecha al corte y después al día anterior: F vuelve a regla 4 en ambos casos.
   Restaurar los originales reproduce todos los totales iniciales.

## Matriz automatizada requerida

| Variación | Resultado esperado | Referencia |
| --- | --- | --- |
| Ticket bajo, agregado suficiente anterior/igual al corte | conditional / 4 en ambos límites | US2/AC6 |
| Agregado suficiente un día posterior | blocked / 5 y motivo temporal | US2/AC7 |
| Ticket igual/superior al mínimo con fecha posterior | eligible / 6 | US2/AC9 |
| Sin acuerdo/habilitación, cierre, APV o mandato ausente con fecha posterior | Preservar 0/0/1/2/3 | US2/AC8 |
| Agregado inferior al mínimo con fecha aceptada | blocked / 5 y motivo monetario | US2/AC10 |
| Ticket bajo, agregado exactamente igual al mínimo y fecha aceptada | conditional / 4 | FR-012 |
| Misma AGF, B suficiente y F necesita agregado futuro | B regla 6; F regla 5 | SC-010 |
| Mandato ausente, ticket bajo y agregado futuro | Regla 3 y tareas de acreditación al corte o ticket suficiente | FR-013 |
| Formalizar mandato sin corregir agregado futuro | Reevaluar a regla 5 | US3/AC6 |
| Fecha futura bien formada / fecha ausente o imposible | Analizar / rechazar entrada respectivamente | FR-003/012 |
| Repetir entradas, cambiar solo comisiones | Estados/cifras estables y comisiones independientes | FR-018/021 |

Ampliar las pruebas existentes en aplicación, importación y presentación; evitar
pruebas que solo repliquen expresiones internas. Confirmar que el resultado conserva
fecha/monto originales, el corte y `versionReglas = nivel-1.1`.

## Interfaz y cierre

Revisar escritorio y móvil de 390 px: motivo visible y fechas en evidencia; foco
visible y desplazamiento con flechas; tareas de mandato comprensibles. Alternar
acuerdos original/futuro y comprobar que no se muestran resultados de la carga anterior.
Revisar consola y registrar resultados/capturas en documentación de validación.

Ejecutar suite completa, tipos y compilación tras implementar. SC-005 requiere
medición con asesores; SC-009 es entrega pública pendiente. No confundir estas
condiciones con la aprobación local de los casos temporales.

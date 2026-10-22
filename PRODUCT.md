# Varenne

## Plataforma

Aplicación web estática, en español, para escritorio y móvil. Todo el análisis se ejecuta en el navegador.

## Usuarios y propósito

El asesor distribuidor necesita explicar costos, identificar restricciones de acceso y comparar series del mismo fondo con evidencia. El evaluador necesita cambiar los datos ficticios y revisar que el motor calcula conforme a las reglas.

## Alcance confirmado

Nivel 1: importar JSON, diagnosticar, evaluar acceso y comparar series dentro del mismo fondo y AGF. La evolución prevista alcanza nivel 3 mediante entregas sucesivas. La aplicación prepara evidencia; una persona revisa y decide. No ejecuta operaciones.

## Stack

TypeScript estricto, React, Vite, Tailwind, Zod y decimal.js, conforme a ARCHITECTURE.md. Los componentes nativos cubren las interacciones actuales. Se utiliza Lucide para iconos e Inter local. No se añaden backend, base de datos, cuentas ni servicios de pago.

## Restricciones

Datos ficticios. Sin promesas de rentabilidad. Las comisiones no intervienen en selección ni desempates. La aplicación empieza vacía; cartola, catálogo y acuerdos se seleccionan manualmente y son reemplazables. El sitio público utiliza identidad propia y no incluye el enunciado.

## Diseño

DESIGN.md contiene la referencia visual suministrada por el usuario. docs/frontend-direction.md documenta su aplicación a la superficie de trabajo. No se sustituye esa referencia por una nueva identidad visual.

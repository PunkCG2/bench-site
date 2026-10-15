---
id: 011
estado: pendiente
ejecuta: local
depende: [005, 008, 009]
rondas: 0
---
# Construir las tres columnas de modos

## Objetivo
La sección "Tres modos" muestra tres columnas (local solo, pareja, Claude solo) del modelo
activo. Cada una tiene cuatro tarjetas (precisión, velocidad, tokens de Claude, costo) con la
diferencia frente a Claude solo, su color y su etiqueta.

## Archivos en alcance
- src/components/columnas.js (crear)
- src/styles/columnas.css (crear)
- src/i18n/sections/columnas.js (crear)
- tests/columnas.test.js (crear)

## No tocar
- data/raw/
- src/lib/metrics.js (solo se usa)

## Detalles
Aplica docs/diseno.md §Columnas comparativas (solo la parte de escritorio; el carrusel
móvil es la tarea 012) y §Color, y docs/spec.md §Secciones 3 y §Decisiones 4.
- `renderColumnas(contenedor, datos)`: lee el modelo activo de `getState()` y dibuja tres
  columnas en el orden local, pareja, Claude. Se actualiza al cambiar el modelo o el idioma.
- Cada columna: `<section>` con un encabezado con la etiqueta de texto del modo
  (`t('modo.local' | 'modo.pareja' | 'modo.claude')`) y cuatro tarjetas, en el mismo orden en las
  tres columnas: **precisión** (nota con un decimal), **velocidad** (`{n} s` por tarea),
  **tokens de Claude por tarea** (separador de miles con `Intl.NumberFormat` del idioma) y
  **costo API equivalente** (`0.005 $`, tres decimales; el modo sin costo, `null`, se muestra
  "—"). Los valores salen de `modelo.resumen.local|pareja|claude`.
- Diferencia frente a Claude solo (el foco del sitio): en las columnas local y pareja, cada
  tarjeta lleva una línea pequeña calculada con `diferenciaNota` (precisión) y `diferencia`
  (velocidad, tokens, costo) de `src/lib/metrics.js`, con la referencia en `resumen.claude`.
  Texto: `{n} pts menos|más que Claude solo`, `{n} % menos|más que Claude solo` o
  `sin diferencia`. Si `valor` es `null` (referencia 0) o hay un `null` en la comparación, no se
  muestra porcentaje: la línea queda en blanco con un guion. En la columna Claude solo la línea
  dice "referencia". Una diferencia de 0 se muestra como "sin diferencia": nunca se oculta la línea.
- Nota bajo la sección (una vez, no por tarjeta): el costo es un equivalente por API y no un
  gasto real (con suscripción cuentan contra los límites de uso).
- Color: cada columna usa su token (`--c-local`, `--c-pareja`, `--c-claude`) en el texto del
  encabezado y en un borde superior de 3 px de sus tarjetas. Tarjetas: `--surface`, `--r-card`.
  Atributos `data-modo="local|pareja|claude"` en cada columna (los usará la tarea 012).
- Cifras en `--font-mono`; etiquetas de tarjeta `--fs-14` en `--muted`.
- Aparición con `revealStagger` de `animate.js`; al cambiar de modelo los números cambian con
  `animateNumber` (sin volver a ocultar las tarjetas).
- Escritorio (≥ 900 px): `display: grid; grid-template-columns: repeat(3, 1fr)` con separación
  `--sp-24`. Por debajo de 900 px, de momento las columnas se apilan en una sola columna (la
  tarea 012 las reemplaza por un carrusel).
- Los textos (`columnas.precision`, `.velocidad`, `.tokens`, `.costo`, las variantes de
  diferencia, la nota de costo y el título de la sección) van en
  `src/i18n/sections/columnas.js` con `{ es, en }`.
- Pruebas (jsdom): hay 3 columnas con `data-modo` en el orden esperado; cada una tiene 4
  tarjetas; el encabezado de cada columna es texto; los valores coinciden con `modelo.resumen`
  del modelo activo (se leen del JSON en la prueba, sin literales); la columna local de Gemma
  muestra costo "—"; las diferencias coinciden con las de `metrics.js`; con datos mínimos
  inventados donde los tres modos tienen notas iguales, la tarjeta de precisión dice "sin
  diferencia"; al llamar `setModelo` con otro modelo, los valores cambian; la nota de costo
  aparece una sola vez.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `columnas.css` solo usa colores vía `var(--c-local|pareja|claude)` y demás tokens, sin hexadecimales
- [ ] `columnas.js` no contiene cifras de benchmark literales

## Notas de revisión
(las escribe Claude al aprobar)

---
id: 038
status: pending
runner: local
depends: [037]
milestone: M7
rounds: 0
---
# Header con más presencia y footer con más margen

## Objetivo
El título del header se ve más grande y el footer tiene más aire arriba y abajo.

## Archivos en alcance
- src/styles/header.css (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/components/header.js

## Detalles
Solo `var(--...)` de `tokens.css`.
- `.header__titulo-nombre`: `font-size: var(--fs-28)`. `.header__titulo-sub`: `font-size: var(--fs-16)`.
- `.header__grid`: `padding: var(--sp-24) var(--sp-16)` (más alto, mismo lateral).
- `.footer`: `margin-top: var(--sp-64); padding-bottom: var(--sp-48);`.
- En el bloque `@media (max-width: 899px)` el título debe seguir cabiendo junto a los botones ES/tema a 360 px: si no cabe, bajar a `var(--fs-20)` solo en ese bloque.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] verificado en Edge a 1440 y a 360 px: título más grande sin desbordar; footer con aire (lo ejecuta Claude con Playwright y llama `browser_close`)

## Notas de revision
(las escribe Claude al aprobar)

---
id: 039
estado: pendiente
ejecuta: local
depende: [038]
hito: M7
rondas: 0
---
# El título del header nunca se parte en varias líneas

## Objetivo
Entre 900 y 1300 px el título y su subtítulo van en una sola línea cada uno; el selector de modelos cede el espacio y hace scroll.

## Archivos en alcance
- src/styles/header.css (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/components/header.js

## Detalles
Causa: `.header__grid` usa `grid-template-columns: 1fr auto 1fr` y el selector (676 px con 5 modelos) deja solo ~50-170 px al título entre 930 y 1100 px.
- En `.header__grid` (escritorio, fuera de los `@media`): `grid-template-columns: auto minmax(0, 1fr) auto;`.
- `.header__titulo-nombre` y `.header__titulo-sub`: `white-space: nowrap;`.
- `.header__selector` ya tiene `max-width: 100%`, `overflow-x: auto` y `justify-content: safe center`: no tocarlos. Añadir `min-width: 0;` si hace falta para que ceda.
- No tocar el bloque `@media (max-width: 899px)` ni el de `479px`.
- Solo `var(--...)` de `tokens.css`.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] verificado en Edge a 900, 930, 1000, 1100, 1200 y 1440 px: el título ocupa 1 línea, el selector hace scroll si no cabe y no hay desborde horizontal de la página (lo ejecuta Claude con Playwright y llama `browser_close`)

## Notas de revision
(las escribe Claude al aprobar)

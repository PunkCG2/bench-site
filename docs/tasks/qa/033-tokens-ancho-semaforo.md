---
id: 033
estado: hecha
ejecuta: local
depende: [032]
hito: M7
rondas: 0
---
# Ancho máximo 1280 px y colores de semáforo

## Objetivo
El contenido llega a 1280 px y existen tres tokens de color de estado (bien, reservas, mal) en ambos temas, con contraste comprobado.

## Archivos en alcance
- src/styles/tokens.css (modificar)
- tests/contraste.test.js (modificar)
- docs/diseno.md (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json

## Detalles
- `tokens.css`: `--maxw: 1280px;`.
- Tres tokens nuevos en los tres bloques de tema (oscuro, claro y el `@media (prefers-color-scheme: light)`), con estos valores:
  - oscuro: `--c-ok: #4ADE80;` `--c-aviso: #F5B83D;` `--c-mal: #F2665E;`
  - claro: `--c-ok: #15803D;` `--c-aviso: #A16207;` `--c-mal: #B42318;`
- `tests/contraste.test.js`: agregar los pares `['--c-ok','--bg']`, `['--c-ok','--surface']`, y lo mismo con `--c-aviso` y `--c-mal`, en la misma lista y con el mismo umbral que ya usan los tres colores de modo (`--c-local`...). Seguir el estilo del archivo.
- `docs/diseno.md`: cambiar "1100 px" por "1280 px" en el ancho máximo y añadir una línea: "Colores de estado (semáforo): `--c-ok`, `--c-aviso`, `--c-mal`; nunca solos: siempre con texto."
- No tocar `@media (max-width: 1100px)` de `hero.css`.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] `tokens.css` define `--maxw: 1280px` y los tres tokens de estado en los 3 bloques
- [ ] `contraste.test.js` incluye los 6 pares nuevos

## Notas de revision
Worker local, 1 intento (105 s). Diff revisado; contraste de los 6 pares nuevos pasa.

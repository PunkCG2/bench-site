---
id: 035
status: pending
runner: local
depends: [033]
milestone: M7
rounds: 0
---
# Estilos de la sección de veredicto

## Objetivo
La hoja de estilos de la sección: cuatro tarjetas de semáforo (2×2) a la izquierda y la conclusión a un lado, apiladas en móvil.

## Archivos en alcance
- src/styles/veredicto.css (crear)

## No tocar
- data/raw/
- src/data/benchmarks.json

## Detalles
Solo `var(--...)` de `tokens.css`. Nombres de clase (los usará el componente de la tarea 036):
- `.veredicto` (sección): `max-width: var(--maxw); margin: 0 auto;` y el mismo ritmo vertical que `.hero` (mirar `hero.css`).
- `.veredicto__grid`: dos columnas en escritorio (`grid-template-columns: 3fr 2fr; gap: var(--sp-24)`); una columna con `@media (max-width: 899px)`.
- `.veredicto__semaforos`: cuatro tarjetas en 2×2 (`display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-16)`), una por columna con `@media (max-width: 599px)`.
- `.veredicto__tarjeta`: `background: var(--surface); border-radius: var(--r-card); padding: var(--sp-16)`.
- `.veredicto__eje` (nombre, `--fs-14`, `var(--muted)`), `.veredicto__valor` (`var(--font-mono)`, `--fs-20`), `.veredicto__nivel` (texto del nivel, `--fs-14`) con un punto `::before` (ancho y alto `var(--sp-8)`, `border-radius: 50%`, `background: currentColor`).
- Modificadores de color del nivel: `.veredicto__nivel--bien { color: var(--c-ok) }`, `--reservas { color: var(--c-aviso) }`, `--mal { color: var(--c-mal) }`.
- `.veredicto__conclusion`: tarjeta igual que la de semáforo pero con más aire; `.veredicto__respuesta` (Sí / Depende / No) con `font-size: var(--fs-44)` y `font-family: var(--font-title)`; modificadores `--si`, `--depende`, `--no` con los mismos tres colores; `.veredicto__frase` en `--fs-16`.
- Transición de color con `var(--dur-theme)`. Sin animaciones nuevas.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] `veredicto.css` solo usa `var(--...)` para colores, fuentes y espaciados

## Notas de revision
(las escribe Claude al aprobar)

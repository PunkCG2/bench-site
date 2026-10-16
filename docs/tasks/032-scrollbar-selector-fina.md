---
id: 032
estado: pendiente
ejecuta: local
depende: [031]
hito: M6
rondas: 0
---
# Scrollbar del selector: delgada como la de móvil en escritorio

## Objetivo
En escritorio la barra del selector debe ser una línea fina redondeada sin flechas (como la barra overlay del móvil), visible solo al pasar el puntero.

## Archivos en alcance
- src/styles/header.css (modificar)

## No tocar
- data/raw/
- src/components/header.js

## Detalles
Problema: en Chromium, `scrollbar-width`/`scrollbar-color` desactivan `::-webkit-scrollbar` y dibujan la barra estándar con flechas.
En `.header__selector` quitar `scrollbar-width`, `scrollbar-color` y la `transition` de `scrollbar-color`, y quitar la regla `.header__selector:hover { scrollbar-color ... }`. Agregar:
- `.header__selector::-webkit-scrollbar { height: var(--sp-4); }`
- `.header__selector::-webkit-scrollbar-track { background: transparent; }`
- `.header__selector::-webkit-scrollbar-thumb { background: transparent; border-radius: var(--r-btn); transition: background-color var(--dur-theme); }`
- `.header__selector:hover::-webkit-scrollbar-thumb { background: var(--muted); }`
- `.header__selector::-webkit-scrollbar-button { display: none; }`
- Para Firefox: `@supports not selector(::-webkit-scrollbar) { .header__selector { scrollbar-width: thin; scrollbar-color: transparent transparent; } .header__selector:hover { scrollbar-color: var(--muted) transparent; } }`
Solo `var(--...)` de `tokens.css`. Mantener `padding-bottom: var(--sp-4)` y el resto de la regla. Un solo archivo, una edición por bloque.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] `header.css` ya no tiene `scrollbar-color` fuera del bloque `@supports`

## Notas de revision
(las escribe Claude al aprobar)

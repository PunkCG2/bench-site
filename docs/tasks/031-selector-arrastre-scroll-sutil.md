---
id: 031
estado: pendiente
ejecuta: local
depende: [030]
hito: M6
rondas: 0
---
# Selector de modelo: arrastrable con mouse y scrollbar sutil

## Objetivo
En escritorio la tira de modelos se arrastra con el mouse y su scrollbar es discreta.

## Archivos en alcance
- src/components/header.js (modificar)
- src/styles/header.css (modificar)

## No tocar
- data/raw/
- src/lib/arrastre.js

## Detalles
- `header.js`: importar `habilitarArrastre` de `../lib/arrastre.js` y llamarlo una vez sobre `selector` con `{ claseActiva: 'header__selector--arrastrando' }` (despues de crear `selector`).
- `header.css`, en `.header__selector`: `scrollbar-width: thin; scrollbar-color: transparent transparent;` y `transition: scrollbar-color var(--dur-theme);`. Regla `.header__selector:hover` con `scrollbar-color: var(--muted) transparent;`. Solo `var(--...)` de `tokens.css`, sin colores literales.
- Regla nueva `.header__selector--arrastrando { cursor: grabbing; user-select: none; }`. Nada mas de cursor.
- No tocar la logica de scroll del boton activo en `actualizar()`.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] `header.js` llama a `habilitarArrastre(selector, ...)`
- [ ] `header.css` no usa colores ni medidas literales nuevas

## Notas de revision
(las escribe Claude al aprobar)

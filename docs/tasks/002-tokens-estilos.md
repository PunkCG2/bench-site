---
id: 002
estado: en-curso
ejecuta: local
depende: [001]
rondas: 0
---
# Definir tokens de diseño y estilos base

## Objetivo
Existen `tokens.css` con todos los tokens de color (tema oscuro y claro), tipografía, espaciado,
forma y animación de docs/diseno.md, y `base.css` con el reset y los estilos globales.

## Archivos en alcance
- src/styles/tokens.css (crear)
- src/styles/base.css (crear)
- tests/tokens.test.js (crear)
- src/main.js (modificar: importar los dos CSS)

## No tocar
- data/raw/

## Detalles
Aplica docs/diseno.md §Color, §Tipografía, §Espaciado y forma, §Animación.

`tokens.css`:
- El tema oscuro va en `:root, :root[data-theme="dark"]`. El claro, en `:root[data-theme="light"]`.
  Además, para evitar un destello antes de que el JS fije el tema, incluye
  `@media (prefers-color-scheme: light) { :root:not([data-theme]) { ...valores claros... } }`.
- Colores (oscuro / claro), con estos nombres exactos: `--c-local` `#3DD68C` / `#1E9E63`,
  `--c-pareja` `#4DA3FF` / `#1F6FD1`, `--c-claude` `#E5534B` / `#C0392B`, `--bg` `#14161A` /
  `#F4F2EE`, `--surface` `#1C1F24` / `#FFFFFF`, `--text` `#E8E6E1` / `#1C1F24`, `--muted`
  `#8A8F98` / `#5C626B`. No hay token de borde: el diseño no usa bordes de separación.
  Además `--z-header: 100` (el header queda por encima de todo el contenido).
- Tipografía: `--font-title` (Space Grotesk), `--font-text` (Inter), `--font-mono` (JetBrains Mono),
  cada una con fallback genérico. Tamaños `--fs-14`, `--fs-16`, `--fs-20`, `--fs-28`, `--fs-44`, `--fs-72`.
- Espaciado: `--sp-4`, `--sp-8`, `--sp-12`, `--sp-16`, `--sp-24`, `--sp-32`, `--sp-48`, `--sp-64`
  (el número es el valor en px).
- Forma: `--r-card: 10px`, `--r-btn: 6px`, `--maxw: 1100px`.
- Animación: `--dur-counter: 900ms`, `--dur-bar: 700ms`, `--dur-theme: 200ms`,
  `--dur-reveal: 400ms`, `--stagger-bar: 80ms`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.

`base.css`: reset mínimo (`box-sizing`, márgenes), `body` con `background: var(--bg)`,
`color: var(--text)`, `font-family: var(--font-text)`, `font-size: var(--fs-16)`. Títulos con
`--font-title` y peso 600. Transición de `background-color` y `color` en `body` con `--dur-theme`.
Clase `.contenedor` (ancho máximo `--maxw`, centrada, padding lateral `--sp-16`). Clase `.sr-only`.
`@media (prefers-reduced-motion: reduce)` que ponga `transition-duration: 0ms` y
`animation-duration: 0ms` en `*`. Fondo liso: sin cuadrícula ni texturas. En estos dos archivos
los colores, fuentes y espaciados solo se usan vía `var(--...)` (los valores hexadecimales
viven únicamente en `tokens.css`).

`tests/tokens.test.js`: lee `tokens.css` como texto y comprueba que los 7 tokens de color
(`--c-local`, `--c-pareja`, `--c-claude`, `--bg`, `--surface`, `--text`, `--muted`)
aparecen tanto en el bloque oscuro como en el claro, y que los tokens `--sp-*`, `--fs-*` y
`--dur-*` listados existen.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `base.css` no contiene ningún valor hexadecimal ni `rgb(`

## Notas de revisión
(las escribe Claude al aprobar)

---
id: 001
estado: en-curso
ejecuta: local
depende: []
rondas: 0
---
# Crear el proyecto Vite vanilla con Vitest

## Objetivo
Existe un proyecto Vite con JavaScript vanilla, Vitest con entorno jsdom, y los scripts npm
`dev`, `build`, `preview` y `test`. Esta tarea es la que instala las dependencias del proyecto.

## Archivos en alcance
- package.json (crear)
- vite.config.js (crear)
- index.html (crear)
- src/main.js (crear)
- tests/smoke.test.js (crear)

## No tocar
- data/raw/
- CLAUDE.md, docs/

## Detalles
- Dependencias permitidas en esta tarea (todas en `devDependencies`): `vite`, `vitest`, `jsdom`.
  Ninguna más.
- `package.json`: `"type": "module"`, `"private": true`, scripts:
  `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`, `"test": "vitest run"`.
  El script `data` lo agrega la tarea 004.
- `vite.config.js`: `test: { environment: 'jsdom' }`. Sin `base` (el sitio solo corre en local).
- `index.html`: `<html lang="es">`, `<title>Local + Claude</title>`, un `<div id="app"></div>`,
  `<script type="module" src="/src/main.js">`. Incluye los `<link>` de Google Fonts para
  Space Grotesk (600), Inter (400) y JetBrains Mono (400, 500), con `preconnect`.
- `src/main.js`: solo un comentario o un `console.log` mínimo. La página se arma en la tarea 017.
- `tests/smoke.test.js`: una prueba que verifica que `document` existe (confirma que jsdom
  está activo). Vitest falla si no hay ninguna prueba, por eso este archivo.
- El `.gitignore` ya ignora `node_modules/` y `dist/`.

## Criterios de aceptación
- [ ] `npm install` termina sin errores y `package.json` lista solo `vite`, `vitest` y `jsdom`
- [ ] `npm test` pasa
- [ ] `npm run build` termina sin errores y crea `dist/index.html`

## Notas de revisión
(las escribe Claude al aprobar)

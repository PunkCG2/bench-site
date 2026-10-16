---
id: 036
estado: pendiente
ejecuta: local
depende: [034, 035]
hito: M7
rondas: 0
---
# Componente de veredicto con textos es/en

## Objetivo
Sección que muestra, para el modelo activo, los tres semáforos y la conclusión de si vale la pena delegar, en español e inglés.

## Archivos en alcance
- src/components/veredicto.js (crear)
- src/i18n/sections/veredicto.js (crear)
- tests/veredicto-componente.test.js (crear)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/lib/veredicto.js
- src/components/hero.js

## Detalles
Seguir la estructura de `src/components/hero.js` (`renderVeredicto(contenedor, datos)` devuelve `{ cancelar }`, se actualiza con `subscribe` y `onLangChange`, importa `'../styles/veredicto.css'`). Usar `veredicto(modelo)` de `../lib/veredicto.js` y las clases de `veredicto.css` (`.veredicto`, `__grid`, `__semaforos`, `__tarjeta`, `__eje`, `__valor`, `__nivel` + `--bien|--reservas|--mal`, `__conclusion`, `__respuesta` + `--si|--depende|--no`, `__frase`).
- Estructura: `<section class="veredicto">` → `.veredicto__grid` → [ `.veredicto__semaforos` con 3 `.veredicto__tarjeta`, `.veredicto__conclusion` ].
- Tarjeta: eje (calidad / ahorro de Claude / tiempo), valor (`dif` en puntos con signo, `pct` en %, `factor` en ×; las cifras salen de `veredicto()`) y nivel con texto ("Bien", "Con reservas", "Mal"); el nivel nunca se comunica solo con color.
- Conclusión: `__respuesta` (Sí / Depende / No) y una frase corta por caso.
- Textos solo en `src/i18n/sections/veredicto.js` (`export default { es: {...}, en: {...} }`, claves `veredicto.*`; ver `src/i18n/sections/hero.js`). Mismas claves en es y en.
- Test (vitest, jsdom): con `src/data/benchmarks.json`, renderiza y comprueba 3 tarjetas, que `__respuesta` tenga una de las tres clases, que cambiar de modelo con `setModelo` actualice la respuesta, y que cambiar el idioma cambie el texto. Mirar `tests/hero.test.js` para el montaje.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] las claves `veredicto.*` existen en es y en
- [ ] el test cubre tarjetas, conclusión, cambio de modelo e idioma

## Notas de revision
(las escribe Claude al aprobar)

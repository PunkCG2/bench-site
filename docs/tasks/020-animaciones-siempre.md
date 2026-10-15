---
id: 020
estado: hecha
ejecuta: claude
depende: [019]
rondas: 0
---
# Animaciones que no dependen de prefers-reduced-motion

## Objetivo
El autor tiene desactivados los efectos de animación del sistema y no veía ninguna animación. Decisión
del autor (2026-10-15): las animaciones se muestran siempre, sin depender de esa preferencia. Se
mantienen cortas y sin bucles.

## Archivos en alcance
- src/lib/animate.js, src/components/carrusel.js, src/styles/{animate,base,columnas,grafico}.css
- tests/animate.test.js, tests/reglas.test.js
- CLAUDE.md, docs/diseno.md (la regla anterior cambia)

## Criterios de aceptación
- [ ] Ninguna parte de `src/` consulta ni reacciona a `prefers-reduced-motion`
- [ ] `npm test` y `npm run build` pasan
- [ ] El autor ve contadores, barras y aparición escalonada con los efectos del sistema desactivados

## Notas de revisión
Hecho por Claude. 142 tests y build verificados. Falta la verificacion visual del autor en el navegador.

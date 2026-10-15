---
id: 015
estado: en-curso
ejecuta: local
depende: [014]
rondas: 0
---
# Filas expandibles con revisiones del revisor y vista móvil

## Objetivo
Cada fila de la tabla se expande para mostrar las revisiones del revisor (Haiku en los
reportes actuales) y los fallos; en móvil la tabla pasa a tarjetas apiladas.

## Archivos en alcance
- src/components/tabla.js (modificar)
- src/styles/tabla.css (modificar)
- src/i18n/sections/tabla.js (modificar)
- tests/tabla-expandible.test.js (crear)

## No tocar
- data/raw/

## Detalles
Aplica docs/spec.md §Secciones 5 y docs/diseno.md §Responsive. El costo API ya se muestra en
las columnas (tarea 011); esta tarea no lo muestra.
- Cada fila de tarea con revisiones o fallos es un botón de expansión (`aria-expanded`,
  `aria-controls`), operable con Enter y Espacio. La tarea sin revisiones ni fallos no es
  expandible.
- Panel expandido: lista de revisiones (`Ronda {n} · {archivo}` en `--font-mono` y el `texto`)
  y lista de fallos con `✗`, indicando quién falló (`quien`: local, pareja o Claude solo,
  traducido).
- El estado de expansión se conserva al cambiar de idioma; al cambiar de modelo se contraen todas.
- Móvil (< 900 px): cada tarea es una tarjeta apilada (`--surface`, `--r-card`) con sus datos
  en pares etiqueta-valor; la tabla se oculta o se reestructura con CSS (`display: block` en
  las filas), conservando el mismo botón de expansión.
- Con reduced-motion, la expansión no anima la altura; si no, transición de 200 ms o ninguna.
- Pruebas (jsdom): `T-103` en Gemma se puede expandir y muestra 2 revisiones; `FB-601` muestra 5
  revisiones y su fallo; `T-101` (0 rondas) no es expandible; `aria-expanded` cambia; expandir y
  cambiar de modelo contrae todo. Las pruebas no suponen que el modelo activo sea Gemma: usan
  el primer modelo de los datos o buscan la tarea por id en cualquiera.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] El panel expandido no declara `z-index`

## Notas de revisión
(las escribe Claude al aprobar)

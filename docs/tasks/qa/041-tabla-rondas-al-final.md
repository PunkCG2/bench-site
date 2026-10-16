---
id: 041
estado: pendiente
ejecuta: local
depende: [039]
hito: M8
rondas: 0
---
# Detalle por tarea: la columna Rondas va al final

## Objetivo
En la tabla de detalle por tarea la columna Rondas es la última (más a la derecha), en cabecera y en cada fila.

## Archivos en alcance
- src/components/tabla.js (modificar)
- tests/tabla.test.js (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/styles/tabla.css

## Detalles
- `tabla.js`: el arreglo `COLS` pasa a este orden: id, local, pareja, tokens pareja (`tabla.col.tokens.pareja`), claude, tokens claude (`tabla.col.tokens.claude`), rondas (`tabla.col.rondas`). Actualizar el comentario de arriba que lista el orden.
- En la creación de cada fila, mover `fila.appendChild(celdaNum(tarea.rondas, ...))` para que sea la última de las celdas de datos (después de la celda de tokens de Claude). El resto del orden no cambia. `colSpan = 7` se mantiene.
- `tests/tabla.test.js`: añadir un test: el último `th[scope="col"]` del `thead` tiene el texto de `tabla.col.rondas` en español, y la última celda de la fila `T-103` contiene el número de rondas de esa tarea en los datos (`tareaDe`/datos como hacen los otros tests). Ajustar cualquier test existente que asuma el orden de columnas (por ejemplo `children[n]`).

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] verificado en Edge a 1440 y 360 px: Rondas es la última columna y la tabla se ve bien (lo ejecuta Claude con Playwright y llama `browser_close`)

## Notas de revision
(las escribe Claude al aprobar)

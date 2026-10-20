---
id: 023
status: done
runner: claude
depends: [022]
rounds: 0
---
# Ids de la tabla sin superposición (hallado al revisar en Edge)

## Detalles
La regla `.tabla th` (padding 12 px) anulaba el relleno de `.tabla__id`, así que el chevron de apertura se dibujaba sobre el id y
`FB-601 ✗` se partía en dos líneas. Ahora `.tabla th.tabla__id` reserva 32 px a la izquierda y no parte la línea.

## Notas de revisión
Verificado en Edge a 1280 px (Playwright MCP `playwright-edge`). 143 tests y build verificados. Firefox pendiente de instalar.

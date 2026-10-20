---
id: 029
status: done
runner: claude
depends: [028]
milestone: M5
rounds: 0
---
# Agregar los tres benchmarks nuevos y pulir el selector con 5 modelos

## Hecho
- Reportes nuevos en `data/raw/` (gemma-4-e4b, rnj-1-instruct, rnj-1.5-instruct); `npm run data` los procesa sin cambios de código: 5 modelos, 13 tareas cada uno.
- Hallazgos: la lista de tareas empatadas usa `Intl.ListFormat` ("T-103 y UE-302" / "T-103 and UE-302").
- Header: con varios modelos el botón activo se mantiene a la vista dentro del selector con scroll.
- `npm run check:layout` (Edge y Firefox, 7 anchos): 14 OK con 5 modelos.

## Notas de revisión
146 tests y build verificados. Los textos del hero y de los hallazgos se revisaron para los 5 modelos (suben, bajan o casi no cambian).

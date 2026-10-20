---
id: 025
status: done
runner: claude
depends: [024]
rounds: 0
---
# Pruebas que no suponen exactamente dos modelos

## Detalles
Antes de añadir más benchmarks: `build-data.test.js` ya no exige "2 modelos con 13 tareas" (compara con el número de reportes
de `data/raw` y comprueba etiquetas únicas); las pruebas que localizaban Gemma/Qwen por `etiqueta` ahora lo hacen por `id`, que no
cambia cuando dos etiquetas chocan y se reemplazan por el nombre completo.

## Notas de revisión
143+1 tests y build verificados.

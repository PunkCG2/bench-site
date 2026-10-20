---
id: 004
status: done
runner: local
depends: [003]
rounds: 0
---
# Generar benchmarks.json con `npm run data`

## Objetivo
`npm run data` lee todos los `data/raw/*.txt`, los pasa por `parseReport` y escribe
`src/data/benchmarks.json`. Agregar un reporte nuevo a `data/raw/` basta para que aparezca.

## Archivos en alcance
- scripts/build-data.js (crear)
- package.json (modificar: script `data`)
- tests/build-data.test.js (crear)
- src/data/benchmarks.json (se genera; hay que dejarlo versionado)

## No tocar
- data/raw/
- scripts/parse-report.js

## Detalles
- `scripts/build-data.js` exporta `buildData(rawDir)`, que devuelve `{ version: 1, modelos: [...] }`
  con un elemento por archivo `.txt` de `rawDir`, ordenados por `id` del modelo. Cuando se
  ejecuta como script (`node scripts/build-data.js`) llama a `buildData('data/raw')` y escribe
  `src/data/benchmarks.json` con indentación de 2 espacios y salto de línea final.
- Etiquetas únicas: si dos modelos terminan con la misma `etiqueta` (por ejemplo dos de la
  familia Qwen), `buildData` reemplaza la etiqueta de los que chocan por su `nombre` completo
  (el selector del header las muestra y no pueden repetirse). Se esperan de 2 a 5 modelos.
- Salida determinista: sin fecha de generación ni nada que cambie entre ejecuciones.
- Si dos reportes tienen el mismo `id` de modelo, falla con un error que nombre los dos archivos.
- Script npm: `"data": "node scripts/build-data.js"`.
- Pruebas: (1) `buildData('data/raw')` devuelve 2 modelos con 13 tareas cada uno;
  (2) copia un reporte a un directorio temporal con otro nombre de archivo y comprueba que
  `buildData` devuelve ese modelo sin cambios de código; (3) dos archivos con el mismo modelo
  lanzan error; (3b) dos reportes con etiquetas iguales terminan con etiquetas distintas
  (copia un reporte cambiando la línea `Modelo local:` a otro nombre de la misma familia); (4) el JSON del repo coincide con `buildData('data/raw')`
  (así la prueba falla si alguien edita el JSON a mano o lo deja desactualizado).

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run data` termina sin errores y `src/data/benchmarks.json` tiene 2 modelos con 13 tareas cada uno
- [ ] Ejecutar `npm run data` por segunda vez no cambia el archivo (`git diff --stat` vacío tras `git add`)
- [ ] `npm run build` pasa

## Notas de revisión
Worker llegó al límite de 40 turnos pero dejó todo correcto. Tests, data idempotente y build verificados.

---
id: 005
estado: hecha
ejecuta: local
depende: [004]
rondas: 0
---
# Calcular las métricas derivadas del benchmark

## Objetivo
Existe `src/lib/metrics.js` con funciones puras que calculan, para un modelo, las diferencias
entre modos que usan el hero, las columnas y los hallazgos. Ninguna cifra se escribe a mano y
ninguna función oculta un resultado sin diferencia.

## Archivos en alcance
- src/lib/metrics.js (crear)
- tests/metrics.test.js (crear)

## No tocar
- data/raw/
- src/data/benchmarks.json

## Detalles
Todas las funciones reciben un **modelo** (la forma de las tareas 003 y 004) y trabajan sobre
ese modelo; no comparan modelos entre sí (docs/spec.md §Decisiones 8).
- `diferencia(valor, referencia)`: devuelve `{ tipo, valor }` para mostrar la diferencia de un
  modo frente a otro. Con `valor` o `referencia` `null`, devuelve `null`. `tipo` es
  `'igual'` si ambos son iguales (diferencia 0), `'menos'` si `valor < referencia` o `'mas'` si
  es mayor. `valor` es la diferencia relativa en porcentaje entero
  `Math.round(Math.abs(valor - referencia) / referencia * 100)`; si `referencia` es 0, devuelve
  `{ tipo, valor: null }` (no se puede dar porcentaje).
- `diferenciaNota(valor, referencia)`: lo mismo pero en puntos: `{ tipo, valor }` con
  `valor = Number(Math.abs(valor - referencia).toFixed(1))`.
- `reduccionTokens(modelo)`: `Math.round((1 - pareja.tokens_claude / claude.tokens_claude) * 100)`
  con `modelo.resumen`. Entero. Puede ser negativo si la pareja usa más tokens; no se recorta.
- `factorTiempo(modelo)`: `Math.round(pareja.tiempo_s / claude.tiempo_s)`. Entero. Puede dar 1
  o menos; no se recorta.
- `notaMasBaja(modelo)`: `{ nota, ids }` con la menor `tarea.local` del modelo y los ids de
  todas las tareas que la tienen. `{ nota, ids, uniforme: true }` cuando todas las tareas
  tienen la misma nota local (por ejemplo, todas 10): en ese caso `ids` es todas las tareas.
- `cambioPorRevision(modelo)`: `{ de: resumen.local.nota, a: resumen.pareja.nota, tipo }` donde
  `tipo` es `'mejora' | 'empeora' | 'igual'` según `a` frente a `de`.
Los valores salen del argumento; las funciones no importan el JSON.

Pruebas con `benchmarks.json` real (las cifras son válidas en tests): `reduccionTokens` da 73
para Gemma y 78 para Qwen; `factorTiempo` da 9 y 7; `notaMasBaja` de Qwen da nota 4.2 con `ids`
`['NET-501']`; `cambioPorRevision` de Gemma da `tipo: 'mejora'` y de Qwen `'empeora'`.
Pruebas con datos mínimos inventados: modelo con todas las notas 10 en los tres modos →
`notaMasBaja.uniforme` es `true`, `cambioPorRevision.tipo` es `'igual'`, `diferenciaNota` da
`'igual'`; `diferencia` con referencia 0 devuelve `valor: null`; empate en la nota más baja
devuelve todos los ids; `diferencia(0, 88790)` da `{ tipo: 'menos', valor: 100 }`.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `src/lib/metrics.js` no contiene números de benchmark escritos a mano (solo `0`, `1`, `100` y `.toFixed(1)` en las fórmulas)
- [ ] `npm run build` pasa

## Notas de revisión
Worker local cumplió a la primera. Tests y build verificados; sin cifras literales en metrics.js.

---
id: 034
estado: hecha
ejecuta: local
depende: [033]
hito: M7
rondas: 0
---
# Lógica del veredicto: cuatro semáforos y conclusión

## Objetivo
Una función pura calcula, para un modelo, el nivel de calidad, ahorro de tokens, costo de API y tiempo de la pareja frente a Claude solo y una conclusión global, con tests.

## Archivos en alcance
- src/lib/veredicto.js (crear)
- tests/veredicto.test.js (crear)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/lib/metrics.js

## Detalles
`export const UMBRALES` y `export function veredicto(modelo)`. Reutiliza `reduccionTokens` y `factorTiempo` de `./metrics.js`. Niveles: `'bien' | 'reservas' | 'mal'`.
- calidad: `dif = claude.nota - pareja.nota` (redondeada a 1 decimal; puede ser negativa). `dif <= 0.5` bien; `dif <= 2` reservas; si no, mal.
- ahorro: `pct = reduccionTokens(modelo)`. `pct >= 50` bien; `pct >= 20` reservas; si no, mal.
- costo de API: `pct = Math.round((1 - pareja.costo_usd / claude.costo_usd) * 100)` (ahorro de la pareja frente a Claude solo; puede ser negativo). `pct >= 30` bien; `pct >= 15` reservas; si no, mal. Si `pareja.costo_usd` o `claude.costo_usd` es `null` o `claude.costo_usd` es 0: `{ nivel: null, pct: null }`.
- tiempo: `factor = factorTiempo(modelo)`. `factor <= 6` bien; `factor <= 15` reservas; si no, mal.
- conclusión `'si' | 'depende' | 'no'`: `'no'` si calidad o ahorro son `mal`; `'si'` si calidad y ahorro son `bien` y ni tiempo ni costo son `mal` (un nivel `null` no cuenta como `mal`); si no, `'depende'`.
- Devuelve `{ calidad: { nivel, dif }, ahorro: { nivel, pct }, costo: { nivel, pct }, tiempo: { nivel, factor }, conclusion }`.
- Los umbrales viven en `UMBRALES` con nombre y comentario (`calidad: { bien: 0.5, reservas: 2 }`, etc.); ninguna cifra suelta en la función.
- Tests: modelos de prueba mínimos (`resumen.pareja` y `resumen.claude` con `nota`, `tiempo_s`, `tokens_claude`); un caso por nivel de cada eje, los límites exactos (0.5, 2, 50, 20, 30, 15, 6, 15), el costo con `null` y las tres conclusiones. Además, con `src/data/benchmarks.json`, la conclusión es una de las tres para todos los modelos.

## Criterios de aceptacion
- [ ] `npm test` pasa
- [ ] `veredicto(modelo)` devuelve la forma indicada
- [ ] los tests cubren los límites de los cuatro ejes, el costo `null` y las tres conclusiones

## Notas de revision
Worker local, 2 intentos (el primero agoto el tiempo de 441 s; el segundo 150 s). 25 tests, 188 en total.

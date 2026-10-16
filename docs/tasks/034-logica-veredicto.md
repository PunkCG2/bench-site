---
id: 034
estado: pendiente
ejecuta: local
depende: [033]
hito: M7
rondas: 0
---
# Lógica del veredicto: tres semáforos y conclusión

## Objetivo
Una función pura calcula, para un modelo, el nivel de calidad, ahorro y tiempo de la pareja frente a Claude solo y una conclusión global, con tests.

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
- tiempo: `factor = factorTiempo(modelo)`. `factor <= 4` bien; `factor <= 10` reservas; si no, mal.
- conclusión `'si' | 'depende' | 'no'`: `'no'` si calidad o ahorro son `mal`; `'si'` si calidad y ahorro son `bien` y tiempo no es `mal`; si no, `'depende'`.
- Devuelve `{ calidad: { nivel, dif }, ahorro: { nivel, pct }, tiempo: { nivel, factor }, conclusion }`.
- Los umbrales viven en `UMBRALES` con nombre y comentario (`calidad: { bien: 0.5, reservas: 2 }`, etc.); ninguna cifra suelta en la función.
- Tests: modelos de prueba mínimos (`resumen.pareja` y `resumen.claude` con `nota`, `tiempo_s`, `tokens_claude`); un caso por nivel de cada eje, los límites exactos (0.5, 2, 50, 20, 4, 10) y las tres conclusiones. Además, con `src/data/benchmarks.json`, la conclusión es una de las tres para todos los modelos.

## Criterios de aceptacion
- [ ] `npm test` pasa
- [ ] `veredicto(modelo)` devuelve la forma indicada
- [ ] los tests cubren los límites de los tres ejes y las tres conclusiones

## Notas de revision
(las escribe Claude al aprobar)

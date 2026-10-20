---
id: 042
status: pending
runner: local
depends: [039]
milestone: M8
rounds: 0
---
# Hero: la frase nombra el modelo usado

## Objetivo
La frase del hero dice "La pareja de Claude con <modelo> usa ..." (y su equivalente en inglés) en todas sus variantes.

## Archivos en alcance
- src/components/hero.js (modificar)
- src/i18n/sections/hero.js (modificar)
- tests/hero.test.js (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json

## Detalles
- `hero.js`: añadir `modelo: modelo.etiqueta` al objeto `params` que se pasa a `t(...)` para la frase.
- `src/i18n/sections/hero.js`: en TODAS las variantes `hero.frase*`:
  - es: cambiar el comienzo `La pareja usa` / `La pareja usa la misma cantidad` por `La pareja de Claude con {modelo} usa` / `La pareja de Claude con {modelo} usa la misma cantidad`. Ejemplo: `La pareja de Claude con {modelo} usa {reduccion} % menos tokens de Claude que Claude solo, es {factor}× más lenta y sube la nota del modelo local de {de} a {a}.`
  - en: cambiar `The pair uses` por `The Claude + {modelo} pair uses` (también `The pair uses the same amount...`). Ejemplo: `The Claude + {modelo} pair uses {reduccion} % fewer Claude tokens than Claude only, ...`
  - El resto de cada frase no cambia. Mismas variantes y claves en es y en.
- `tests/hero.test.js`: actualizar las expectativas de texto de la frase para incluir el nombre del modelo (sale de `modelo.etiqueta` de los datos, no escrito a mano) y añadir un test: la frase contiene `etiqueta` del modelo activo y, tras `setModelo` a otro modelo, contiene la del nuevo.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] la frase del hero contiene la etiqueta del modelo activo en es y en y cambia al cambiar de modelo

## Notas de revision
(las escribe Claude al aprobar)

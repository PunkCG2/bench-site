---
id: 037
estado: hecha
ejecuta: local
depende: [036]
hito: M7
rondas: 0
---
# Montar el veredicto bajo el hero

## Objetivo
La sección de veredicto aparece justo debajo del hero y la página mantiene sus anclas.

## Archivos en alcance
- src/main.js (modificar)
- tests/app.test.js (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/components/veredicto.js

## Detalles
- `main.js`: importar `renderVeredicto` de `./components/veredicto.js` y llamarlo justo después de `renderHero`, con `canceladores.push(renderVeredicto(main, datos).cancelar)`.
- `IDS` pasa a `['hero', 'veredicto', 'modos', 'grafico', 'detalle', 'hallazgos', 'metodologia']`.
- `tests/app.test.js` (línea ~35): actualizar la lista de ids esperados con `'veredicto'` en segundo lugar. Comprobar que ningún otro test asume el número de secciones (`grep` en `tests/`).

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] el segundo hijo de `main` tiene `id="veredicto"`

## Notas de revision
Worker local, 2 intentos (el primero fallo npm test; el segundo OK en 90 s). Diff revisado.

---
id: 040
status: pending
runner: local
depends: [039]
milestone: M8
rounds: 0
---
# Aviso en Metodología: las notas no son un desempeño real

## Objetivo
La sección Metodología incluye un aviso, en español e inglés, de que los resultados no reflejan necesariamente el desempeño real ni una comparativa precisa del modelo híbrido.

## Archivos en alcance
- src/components/hallazgos.js (modificar)
- src/i18n/sections/hallazgos.js (modificar)
- tests/hallazgos.test.js (modificar)

## No tocar
- data/raw/
- src/data/benchmarks.json
- src/styles/hallazgos.css

## Detalles
- `src/i18n/sections/hallazgos.js`: nueva clave `metodologia.aviso` en es y en (misma clave en los dos).
  - es: `Aviso: estas calificaciones no reflejan necesariamente el desempeño real de los modelos, ni son una comparativa precisa del uso del modelo híbrido en el desarrollo. Se siguen descubriendo configuraciones nuevas y, idealmente, los datos se actualizarán con mediciones mejores.`
  - en: `Notice: these scores do not necessarily reflect the real performance of the models, nor are they a precise comparison of using the hybrid model in development. New configurations are still being discovered and, ideally, the data will be updated with better measurements.`
- `src/components/hallazgos.js`: justo después del párrafo `pMetodologia` (clase `metodologia__texto`) crear un segundo `<p>` con clases `metodologia__texto metodologia__aviso`, dentro de la misma sección, con `t('metodologia.aviso')`; actualizarlo en la misma función que ya actualiza `pMetodologia` (cambio de idioma y de modelo). Sin CSS nuevo.
- `tests/hallazgos.test.js`: un test que compruebe que `.metodologia__aviso` existe, tiene el texto de `diccionarios.es['metodologia.aviso']` y que tras `setIdioma('en')` tiene el de `diccionarios.en['metodologia.aviso']`. Mirar cómo el archivo monta la sección y reiniciar el idioma a `es` antes de cada test.

## Criterios de aceptacion
- [ ] `npm test` y `npm run build` pasan
- [ ] existe `.metodologia__aviso` con el texto es/en

## Notas de revision
(las escribe Claude al aprobar)

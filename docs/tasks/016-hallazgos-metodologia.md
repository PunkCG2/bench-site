---
id: 016
estado: en-curso
ejecuta: local
depende: [005, 009]
rondas: 0
---
# Construir las secciones de hallazgos y metodología

## Objetivo
Las secciones "Hallazgos" y "Metodología" existen para el modelo activo, con textos en español e
inglés. Todas las cifras se calculan desde los datos y cada hallazgo dice la verdad también cuando
no hay diferencia o el resultado es adverso.

## Archivos en alcance
- src/components/hallazgos.js (crear)
- src/styles/hallazgos.css (crear)
- src/i18n/sections/hallazgos.js (crear)
- tests/hallazgos.test.js (crear)

## No tocar
- data/raw/
- src/lib/metrics.js (solo se usa)

## Detalles
Aplica docs/spec.md §Secciones 6 y 7, §Hallazgos y §Decisiones 6 y 8.
- `renderHallazgos(contenedor, datos)`: lee el modelo activo de `getState()` y muestra cuatro
  hallazgos y la metodología de ese modelo. Se actualiza al cambiar de modelo o de idioma.
  No compara modelos entre sí.
- Cada hallazgo es una plantilla con parámetros y **variantes** (claves distintas) según el
  resultado. Se elige la variante con `src/lib/metrics.js`:
  1. **Tokens** (`reduccionTokens`): `menos` ("La pareja usa {n} % menos tokens de Claude que
     Claude solo."), `mas` ("…{n} % más…") si el valor es negativo, e `igual`.
  2. **Tiempo** (`factorTiempo`): `mas_lenta` ("La pareja es {n} veces más lenta que Claude
     solo."), `igual` si el factor es 1, y `mas_rapida` si es menor que 1 (con el factor
     inverso `Math.round(claude.tiempo_s / pareja.tiempo_s)`).
  3. **Revisión** (`cambioPorRevision`): `mejora` ("La revisión sube la nota del modelo local de
     {de} a {a}."), `empeora` ("…baja la nota de {de} a {a}.") e `igual` ("La revisión no cambia
     la nota: {de}.").
  4. **Nota más baja** (`notaMasBaja`): `una` ("La tarea con menor nota del modelo local solo es
     {ids}, con {nota}."), `varias` (lista de ids) y `uniforme` ("Todas las tareas del modelo
     local solo obtuvieron {nota}.", sin tarea débil). Si `nota` es 10, la variante `una` o
     `varias` no aplica (sería uniforme).
- Los cuatro hallazgos se muestran siempre, aunque la variante sea `igual` o `uniforme`.
- Metodología: un párrafo traducido con parámetros del modelo activo: número de tareas
  (`modelo.tareas.length`), revisor (`modelo.revisor` con inicial mayúscula) y la mención de
  que las notas salen de los mismos tests reales del benchmark. Ninguna cifra literal.
- Textos en `src/i18n/sections/hallazgos.js` con `{ es, en }`.
- Pruebas (jsdom): para cada modelo de los datos, los 4 hallazgos aparecen y sus parámetros
  coinciden con los de `metrics.js` (se comparan con las funciones, no con literales); cada
  variante se cubre con datos mínimos inventados (tokens más, tiempo igual y más rápida,
  revisión igual y empeora, nota uniforme y varias tareas empatadas); cambiar el modelo cambia
  el texto; el texto cambia a inglés; la metodología usa el revisor y el número de tareas del
  modelo activo.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] Ni `hallazgos.js` ni `sections/hallazgos.js` contienen cifras de benchmark literales (73, 78, 8.8, 217, 13…)
- [ ] Las claves de `sections/hallazgos.js` tienen paridad es-en

## Notas de revisión
(las escribe Claude al aprobar)

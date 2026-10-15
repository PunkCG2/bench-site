# Correcciones 011 - ronda 2

Ya existen `src/components/columnas.js`, `src/styles/columnas.css` y `src/i18n/sections/columnas.js`
(no los modifiques). Falta solo `tests/columnas.test.js`, de máximo 80 líneas, creado con UNA
llamada Write, sin razonar de más. Usa `tests/hero.test.js` como patrón (mismo `vi.mock` de
`../src/lib/animate.js`: `animateNumber(el,v,o){el.textContent=o.formato?o.formato(v):String(v)}`,
`onEnterViewport(el,cb){cb()}`, `revealStagger(){}`). Importa `src/data/benchmarks.json` y llama
`initState(datos)` en `beforeEach` (con `localStorage.clear()`); `afterEach` llama `cancelar()`.
Comprobaciones (sin cifras de benchmark literales: lee `modelo.resumen` del JSON):
1. Hay 3 `.columna` con `data-modo` = local, pareja, claude, en ese orden; cada una tiene 4 `.tarjeta`.
2. El `.tarjeta__valor` de precisión (primera tarjeta) de cada columna es `resumen[modo].nota.toFixed(1)`
   para el modelo activo.
3. La columna local de Gemma (`datos.modelos.find(m => m.etiqueta === 'Gemma')`, activo con `setModelo`)
   muestra costo `—` (cuarta tarjeta).
4. La diferencia de precisión de la columna pareja coincide con `diferenciaNota(pareja.nota, claude.nota)`:
   si `tipo==='igual'` el texto es `t('columnas.sin_diferencia')`; si no, contiene `String(valor)`.
5. Con un `datos` inventado de un modelo (`id:'x'`, `etiqueta:'X'`, `resumen` con nota 10 en los tres modos,
   tiempos y tokens cualesquiera, costos `null`) y `initState(datosInventados)`, la primera tarjeta de la
   columna pareja dice `sin diferencia` (usa `t('columnas.sin_diferencia')`).
6. Tras `setModelo` al segundo modelo del JSON, el valor de precisión de la columna claude cambia a la
   nota del segundo modelo (`toFixed(1)`).
7. Hay exactamente un `.columnas__nota`.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

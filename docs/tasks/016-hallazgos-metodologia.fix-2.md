# Correcciones 016 - ronda 2

Ya existen `src/components/hallazgos.js`, `src/styles/hallazgos.css` y `src/i18n/sections/hallazgos.js`
(no los modifiques). Falta solo `tests/hallazgos.test.js`, de máximo 80 líneas, con UNA llamada Write,
sin razonar de más. Patrón: `tests/tabla.test.js` (sin `vi.mock`). `beforeEach`: `localStorage.clear()`,
contenedor nuevo, `initState(datos)`; `afterEach`: `cancelar()`. Datos: `src/data/benchmarks.json`.
`elegirVariantes(modelo)` (exportada por el componente) devuelve las CLAVES COMPLETAS i18n
(`{ tokens, tiempo, revision, nota }`, p. ej. `hallazgos.tokens.mas`). Pruebas, sin cifras literales:
1. Para cada modelo de los datos: se activa con `setModelo` y hay 4 `.hallazgo` con texto no vacío
   que no contiene `{` (parámetros sustituidos); el primero contiene `String(Math.abs(reduccionTokens(modelo)))`.
2. Variantes con modelos inventados (función `mk(local, pareja, claude, tareas)` que arma
   `{ id:'x', etiqueta:'X', revisor:'haiku', resumen:{ local:{nota,tiempo_s,tokens_claude,costo_usd:null}, ... }, tareas }`
   con tareas `{ id, local }` mínimas) y `elegirVariantes`: tokens `mas` (pareja con más tokens que claude);
   tiempo `igual` (tiempos iguales) y `mas_rapida` (pareja más rápida); revisión `igual` y `empeora`;
   nota `uniforme` (todas las tareas con la misma nota local) y `varias` (dos tareas empatadas con la nota
   más baja). Comprueba la clave devuelta.
3. Cambiar de modelo cambia el texto de algún hallazgo (compara los textos de los 4 `.hallazgo` entre los dos
   modelos reales: al menos uno difiere).
4. Tras `setIdioma('en')` el texto del hallazgo de tokens cambia (`not.toBe` el español) y `.metodologia__texto`
   contiene el revisor con inicial mayúscula (`'Haiku'`) y `String(modelo.tareas.length)`.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

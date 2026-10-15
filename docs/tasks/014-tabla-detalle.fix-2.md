# Correcciones 014 - ronda 2

Ya existen `src/components/tabla.js`, `src/styles/tabla.css` y `src/i18n/sections/tabla.js`
(no los modifiques). Falta solo `tests/tabla.test.js`, de máximo 80 líneas, con UNA llamada Write,
sin razonar de más. Usa `tests/columnas.test.js` como patrón (sin `vi.mock` de animate: la tabla no
anima). `beforeEach`: `localStorage.clear()`, contenedor nuevo, `initState(datos)`; `afterEach`: `cancelar()`.
Datos: `src/data/benchmarks.json`. Se activa Gemma con
`setModelo(datos.modelos.find((m) => m.etiqueta === 'Gemma').id)`. Pruebas (sin cifras literales salvo
las del enunciado):
1. Para Gemma hay 13 filas de tarea (`tbody tr:not(.tabla__grupo)`) y 7 filas de grupo (`.tabla__grupo`).
2. El texto del primer grupo es `t('tabla.ambito.' + modelo.tareas[0].ambito)`; tras `setIdioma('en')` el texto
   de ese grupo cambia a `t(...)` en inglés y es distinto del español.
3. La fila de `NET-501` (modelo Qwen, `etiqueta === 'Qwen'`, activar con `setModelo`) tiene la nota local
   igual a `tarea.local.toFixed(1)` (segunda celda) y esa celda tiene la clase `nota--baja`.
4. La fila de `FB-601` (Gemma) contiene un `.tabla__fallo` con `aria-label` igual a `t('tabla.fallo')`;
   la fila de `T-101` (Gemma) no lo contiene.
5. Hay un `<th scope="col">` por columna (7) en el `thead`.
Para encontrar una fila: `[...contenedor.querySelectorAll('tbody tr')].find((tr) => tr.querySelector('th')?.textContent.startsWith('NET-501'))`.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

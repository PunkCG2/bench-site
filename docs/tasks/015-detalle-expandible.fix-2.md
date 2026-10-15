# Correcciones 015 - ronda 2

Ya está implementado el componente (`src/components/tabla.js`, CSS e i18n; no los modifiques). Falta solo
`tests/tabla-expandible.test.js`, máximo 70 líneas, con UNA llamada Write, sin razonar de más. Patrón:
`tests/tabla.test.js` (`beforeEach`: `localStorage.clear()`, contenedor nuevo, `initState(datos)`;
`afterEach`: `cancelar()`; helper `filaDe(id)` busca la `tr` cuyo `th` empieza por el id). No supongas que
el modelo activo es Gemma: busca con `datos.modelos.find((m) => m.tareas.some((x) => x.id === 'T-103'))`
y actívalo con `setModelo`. Cada fila expandible tiene un `button.tabla__toggle` y una fila siguiente
`tr.tabla__detalle` (atributo `hidden` cuando está contraída). Pruebas (sin cifras literales salvo ids):
1. `T-103` tiene botón; clic → `aria-expanded` pasa a `"true"`, el panel `#detalle-T-103` ya no está `hidden`
   y tiene tantos `li` en `.tabla__revisiones` como `tarea.revisiones.length` (2 en los datos reales).
2. `FB-601`: el panel tiene `tarea.revisiones.length` revisiones y `tarea.fallos.length` fallos
   (`.tabla__fallos li`).
3. `T-101` no tiene `.tabla__toggle` ni panel `#detalle-T-101`.
4. Segundo clic contrae: `aria-expanded` `"false"` y el panel vuelve a `hidden`.
5. Expandir `T-103`, `setIdioma('en')`: sigue expandida. Luego `setModelo` al otro modelo: ningún
   `.tabla__detalle` visible (todos con `hidden`).
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

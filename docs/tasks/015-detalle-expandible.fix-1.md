# Correcciones 015 - ronda 1 (reparto en partes)

El intento anterior se quedó sin tokens de salida y solo dejó un archivo de prueba (ya borrado; no crees
carpetas ni archivos fuera de alcance). Trabaja por partes, una llamada por archivo, sin razonar de más.
Esta ronda: modificar 3 archivos existentes (NO crees tests ahora). Lee antes `docs/tasks/015-detalle-expandible.md`
y `src/components/tabla.js` (141 líneas). Para tabla.js usa Edit con cambios pequeños, no reescribas el archivo.

1. `src/i18n/sections/tabla.js`: añade claves `{ es, en }`: `tabla.expandir` ("Ver detalle de la tarea" / "Show
   task detail"), `tabla.contraer` ("Ocultar detalle" / "Hide detail"), `tabla.ronda` ("Ronda {n} · {archivo}" /
   "Round {n} · {archivo}"), `tabla.revisiones` ("Revisiones" / "Reviews"), `tabla.fallos` ("Fallos" / "Failures"),
   `tabla.quien.local` ("Modelo local" / "Local model"), `tabla.quien.pareja` ("Pareja" / "Pair"),
   `tabla.quien.claude` ("Claude solo" / "Claude only"), y para la vista móvil `tabla.col.local`, etc. NO hace falta:
   en móvil se reutilizan los encabezados con `data-label` (ver punto 2).
2. `src/components/tabla.js` (Edit): (a) en `actualizar()`, antes de reconstruir `tbody`, guarda el id del
   modelo mostrado; si cambió respecto al anterior, vacía un `Set` `abiertas` (todas contraídas); el `Set`
   (`abiertas`, ids de tarea) vive fuera de `actualizar` y NO se vacía al cambiar de idioma. (b) Cada celda de
   las 6 `<td>` recibe `data-label` con el texto del encabezado correspondiente (`t('modo.local')`, etc.).
   (c) Si `tarea.revisiones.length + tarea.fallos.length > 0`: dentro del `<th class="tabla__id">` el id va en un
   `<button type="button" class="tabla__toggle" aria-expanded="false|true" aria-controls="detalle-{id}">` (los
   `<button>` se activan con Enter y Espacio); y tras la fila se añade `<tr class="tabla__detalle" id="detalle-{id}"
   hidden>` con un `<td colspan="7">` que contiene dos listas: `<ul class="tabla__revisiones">` (por revisión
   `<li><span class="tabla__ronda">${t('tabla.ronda',{n,archivo})}</span> ${texto}</li>`) y `<ul class="tabla__fallos">` (por
   fallo `<li>✗ ${t('tabla.quien.'+quien)}: ${texto}</li>`), cada lista con su `<h4>` (`tabla.revisiones`/`tabla.fallos`) solo si
   no está vacía. Clic en el botón: alterna `hidden`, `aria-expanded` y el `Set`. Al renderizar, las tareas en el `Set`
   salen abiertas. La tarea sin revisiones ni fallos no lleva botón (solo el id como texto, y la marca ✗ ya existente).
3. `src/styles/tabla.css` (Edit, añade al final): `.tabla__toggle` botón sin fondo ni borde (`background: none; border: 0;`
   `font: inherit; color: inherit; cursor: pointer`) con `--font-mono`; `.tabla__detalle td` fondo `var(--surface)`;
   `.tabla__ronda` `--font-mono` `--fs-14`; listas sin viñetas. Móvil `@media (max-width: 899px)`: `.tabla`, `.tabla tbody`,
   `.tabla tr`, `.tabla td`, `.tabla th[scope="row"]` en `display: block`; `.tabla thead` oculto con la técnica
   `position: absolute; width: 1px; height: 1px; overflow: hidden` (no `display:none`, para accesibilidad);
   `.tabla tr:not(.tabla__grupo):not(.tabla__detalle)` como tarjeta (`background: var(--surface)`, `border-radius: var(--r-card)`,
   `margin-bottom: var(--sp-12)`, `padding: var(--sp-12)`); `.tabla td::before { content: attr(data-label); color: var(--muted);
   margin-right: var(--sp-8) }`. Sin hex, sin `z-index`; la expansión no anima la altura.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

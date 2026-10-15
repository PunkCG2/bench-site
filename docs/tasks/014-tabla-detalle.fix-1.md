# Correcciones 014 - ronda 1

El intento anterior se quedó sin tokens de salida y no creó nada. Trabaja por partes, UN archivo por
llamada Write, sin razonar de más ni explicar. Esta ronda: solo 3 archivos (NO crees tests/tabla.test.js
ahora). Lee antes `docs/tasks/014-tabla-detalle.md` y, como patrón, `src/components/columnas.js`.

1. `src/i18n/sections/tabla.js` `{ es, en }`, claves exactas: `tabla.titulo`, `tabla.col.id`,
   `tabla.col.rondas`, `tabla.col.tokens` ("Tokens de Claude"), `tabla.fallo` (aria-label de la marca ✗:
   "La tarea tuvo fallos" / "The task had failures"), y `tabla.ambito.unity`, `.web`, `.cpp`, `.unreal`,
   `.rust`, `.dotnet`, `.firebase`, `.otro` (Unity, Web, C++, Unreal, Rust, .NET, Firebase, Otro/Other).
2. `src/styles/tabla.css`: `.tabla` ancho 100 %, `border-collapse: collapse`; `th`/`td` con padding
   `var(--sp-8) var(--sp-12)`, `text-align: left`; `.tabla__id` `--font-mono`; celdas numéricas
   `--font-mono`; `.tabla__grupo th` fondo `var(--surface)`, texto `var(--muted)`, `--fs-14`;
   `.tabla__modo` indicador: `th` con `border-top: 3px solid var(--modo-color)` y
   `[data-modo="local"] { --modo-color: var(--c-local) }` (igual pareja/claude);
   `.nota--baja { font-weight: 700; border-bottom: 2px solid var(--c-claude) }`; `.tabla__fallo` color
   `var(--c-claude)`. Solo `var(--...)`, sin hex y sin `z-index`.
3. `src/components/tabla.js`: `renderTabla(contenedor, datos)` según la tarea. Estructura:
   `<section class="tabla-detalle">` con `<h2>` y `<table class="tabla">`; `<thead>` con `<th scope="col">`:
   id, nota local (`data-modo="local"`, texto `t('modo.local')`), nota pareja, rondas, tokens pareja, nota
   Claude, tokens Claude (los tres de modo con clase `tabla__modo`). `<tbody>` regenerado en
   `actualizar()`: agrupa `modelo.tareas` por `ambito` (orden de primera aparición); por grupo una
   `<tr class="tabla__grupo"><th scope="colgroup" colspan="7">` con `t('tabla.ambito.'+ambito)` y luego una
   `<tr>` por tarea con `<th scope="row" class="tabla__id">` (id) y 6 `<td>`. Notas `toFixed(1)`, tokens con
   `new Intl.NumberFormat(getLang())`. `td` de nota con clase `nota--baja` si nota < 5 (usa una constante
   `UMBRAL_NOTA_BAJA = 5`). Si `fallos.length > 0`, añade en la celda del id un `<span class="tabla__fallo"
   role="img" aria-label="...">✗</span>`. Se llama al renderizar, con `subscribe` y con `onLangChange`.
   Devuelve `{ cancelar }`. Sin cifras de benchmark escritas.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

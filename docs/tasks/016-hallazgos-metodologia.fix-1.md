# Correcciones 016 - ronda 1 (reparto en partes)

Trabaja por partes, UN archivo por llamada Write, sin razonar de más ni explicar. Esta ronda: solo 3
archivos (NO crees tests/hallazgos.test.js ahora). Lee antes `docs/tasks/016-hallazgos-metodologia.md`
(detalles completos) y, como patrón, `src/components/columnas.js`.

1. `src/i18n/sections/hallazgos.js` `{ es, en }`, claves exactas: `hallazgos.titulo`, `metodologia.titulo`,
   `hallazgos.tokens.menos|mas|igual`, `hallazgos.tiempo.mas_lenta|igual|mas_rapida`,
   `hallazgos.revision.mejora|empeora|igual`, `hallazgos.nota.una|varias|uniforme`, `metodologia.texto`.
   Parámetros: `{n}`, `{de}`, `{a}`, `{ids}`, `{nota}`, `{tareas}`, `{revisor}`. Textos como en la tarea;
   `hallazgos.tokens.igual`: "La pareja usa los mismos tokens de Claude que Claude solo."; `mas_rapida` con
   `{n}` "veces más rápida". `metodologia.texto`: n.º de tareas `{tareas}`, revisor `{revisor}`, notas de los
   tests reales del benchmark. Sin cifras literales. Inglés equivalente.
2. `src/styles/hallazgos.css`: `.hallazgos`, `.metodologia` con padding vertical `var(--sp-32)`;
   `.hallazgos__lista` lista sin viñetas con `gap: var(--sp-16)`; `.hallazgo` fondo `var(--surface)`,
   `border-radius: var(--r-card)`, padding `var(--sp-16)`; `.metodologia__texto` `--muted`. Solo
   `var(--...)`, sin hex y sin `z-index`.
3. `src/components/hallazgos.js`: `renderHallazgos(contenedor, datos)` devuelve `{ cancelar }`. Crea
   `<section class="hallazgos">` (`<h2>` + `<ul class="hallazgos__lista">` con 4 `<li class="hallazgo">`) y
   `<section class="metodologia">` (`<h2>` + `<p class="metodologia__texto">`). `actualizar()` toma el modelo
   activo de `getState()` y elige la variante con `reduccionTokens`, `factorTiempo`, `cambioPorRevision`,
   `notaMasBaja` de `../lib/metrics.js`:
   tokens: `<0` → mas con `n = Math.abs(valor)`, `0` → igual, si no menos. tiempo: factor `>1` → mas_lenta
   (n = factor), `1` → igual, `<=0`/menor que 1 → mas_rapida con `n = Math.round(claude.tiempo_s / pareja.tiempo_s)`.
   revisión: por `cambio.tipo` (`de`/`a` con `toFixed(1)`). nota: `uniforme` si `r.uniforme`, `una` si
   `r.ids.length === 1`, si no `varias` (`ids` unidos con ", "; `nota` con `toFixed(1)`).
   Metodología: `tareas = modelo.tareas.length`, `revisor` con inicial mayúscula. Se llama al renderizar,
   con `subscribe` y con `onLangChange`. Exporta además `elegirVariantes(modelo)` que devuelve las 4 claves
   elegidas (la usarán los tests). Sin cifras de benchmark escritas.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

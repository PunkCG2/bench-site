# Correcciones 010 - ronda 1

El intento anterior se quedó sin tokens de salida. Ya existe `src/i18n/sections/hero.js`
(claves `hero.frase`, `hero.frase.reduccion.mas|igual`, `hero.frase.tiempo.igual|mas_rapida`,
`hero.frase.nota.empeora|igual`, `hero.cifra.tokens|tiempo|nota`; parámetros `{reduccion}`
`{factor}` `{de}` `{a}`). NO lo modifiques. Faltan 3 archivos. Créalos UNO POR UNO con Write,
sin pensar de más ni explicar: código corto y directo. Cada archivo menos de 80 líneas.

1. `src/components/hero.js` (crear). Exporta `renderHero(contenedor, datos)`.
   - Crea `<section class="hero">` con: `<p class="hero__frase">` y tres `<div class="hero__cifra">`
     (cada una con `<span class="hero__etiqueta">` y `<span class="hero__valor">`).
   - `actualizar()`: toma `modelo = datos.modelos.find(m => m.id === getState().modelo)`; calcula
     `reduccion = reduccionTokens(modelo)`, `factor = factorTiempo(modelo)`, `cambio = cambioPorRevision(modelo)`
     (de `../lib/metrics.js`). Textos con `t()` de `../i18n/index.js`.
   - Clave de la frase por prioridad: si `cambio.tipo==='igual'` → `hero.frase.nota.igual`; si `'empeora'` →
     `hero.frase.nota.empeora`; si `factor<=0` → `hero.frase.tiempo.mas_rapida` (parámetro `factor` =
     `Math.round(claude.tiempo_s / pareja.tiempo_s)` de `modelo.resumen`); si `factor===1` →
     `hero.frase.tiempo.igual`; si `reduccion<0` → `hero.frase.reduccion.mas` (con `Math.abs`); si
     `reduccion===0` → `hero.frase.reduccion.igual`; si no → `hero.frase`.
   - Cifras (valor con `animateNumber(el, n, {formato})` de `../lib/animate.js`): 1) `−{n} %` (usa `+` si
     reduccion<0 → `+{abs} %`; `−` es el carácter U+2212); 2) `{n}×` ; 3) `{de} → {a}` texto fijo
     con `cambio.de.toFixed(1)` y `cambio.a.toFixed(1)` (sin animar).
   - La primera vez, anima al entrar en pantalla con `onEnterViewport`; después, al cambiar de modelo,
     anima directo. Se re-actualiza con `subscribe` (state.js) y `onLangChange` (i18n).
   - Sin cifras de benchmark escritas en el código.
2. `src/styles/hero.css` (crear): `.hero` con padding `var(--sp-48)` arriba/abajo; `.hero__frase` en
   `--fs-28`; `.hero__cifras` rejilla de 3 columnas (1 columna bajo 900px); `.hero__valor` en
   `--font-mono`, `--fs-72` (`--fs-44` bajo 900px); `.hero__etiqueta` en `--font-mono`, `--fs-14`,
   `--muted`. Solo `var(--...)`; sin hex.
3. `tests/hero.test.js` (crear), máximo 60 líneas: con `vi.mock('../src/lib/animate.js')` donde
   `animateNumber(el, v, o) { el.textContent = o.formato ? o.formato(v) : String(v) }` y
   `onEnterViewport(el, cb) { cb() }`. Usa `src/data/benchmarks.json` real, `initState(datos)`.
   Comprueba: el valor de la primera cifra contiene `String(reduccionTokens(modelo))` para el primer modelo y
   cambia tras `setModelo` al segundo; la frase está en español, y tras `setIdioma('en')` contiene "The pair".
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

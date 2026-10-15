# Correcciones 011 - ronda 1

El intento anterior se quedó sin tokens de salida y no creó nada. Trabaja por partes, UN archivo
por llamada Write, sin razonar de más ni explicar. Esta ronda: solo los 3 primeros archivos
(las pruebas van en otra ronda; NO crees tests/columnas.test.js ahora). Lee antes
`docs/tasks/011-columnas-modos.md` (detalles) y `src/components/hero.js` (patrón de componente).

1. `src/i18n/sections/columnas.js` `{ es, en }` con claves exactas: `columnas.titulo`,
   `columnas.precision`, `columnas.velocidad`, `columnas.tokens`, `columnas.costo`,
   `columnas.unidad.s` ("{n} s" / "{n} s"), `columnas.referencia` ("referencia" / "reference"),
   `columnas.sin_diferencia` ("sin diferencia" / "no difference"), `columnas.pts.menos`
   ("{n} pts menos que Claude solo"), `columnas.pts.mas`, `columnas.pct.menos`
   ("{n} % menos que Claude solo"), `columnas.pct.mas`, `columnas.nota_costo` (el costo es un
   equivalente por API y no un gasto real; con suscripción cuentan contra los límites de uso).
   Versión en inglés equivalente.
2. `src/styles/columnas.css`: `.columnas__rejilla` grid 3 columnas con gap `var(--sp-24)` (1 columna
   bajo 899px); `.columna` con `--modo-color` definido por `[data-modo="local"] { --modo-color: var(--c-local) }`
   (igual para pareja y claude); `.columna__titulo` color `var(--modo-color)`; `.tarjeta` fondo `var(--surface)`,
   `border-radius: var(--r-card)`, `border-top: 3px solid var(--modo-color)`, padding `var(--sp-16)`;
   `.tarjeta__etiqueta` `--fs-14` `--muted`; `.tarjeta__valor` `--font-mono`; `.tarjeta__diff`
   `--fs-14` `--muted`; `.columnas__nota` `--fs-14` `--muted`. Solo `var(--...)`, sin hex.
3. `src/components/columnas.js`: `renderColumnas(contenedor, datos)` según la tarea. Estructura:
   `<section class="columnas">` con `<h2>`, `<div class="columnas__rejilla">` con 3 `<section class="columna" data-modo>`
   (cada una con `<h3 class="columna__titulo">` y 4 `<div class="tarjeta">` con `.tarjeta__etiqueta`,
   `.tarjeta__valor`, `.tarjeta__diff`) y `<p class="columnas__nota">` al final (una sola vez).
   Mantén las referencias a los elementos y deja una función `actualizar()` que recalcule textos desde
   `getState()`; se llama al renderizar, con `subscribe` y con `onLangChange`. Usa `diferenciaNota` y
   `diferencia` de `../lib/metrics.js` con referencia `resumen.claude`; helper local
   `lineaDiff(d, claveMenos, claveMas)` devuelve `sin_diferencia` si `d.tipo==='igual'`, `'—'` si `d===null` o
   `d.valor===null`, y si no la clave con `{n}`. Costo `null` se muestra `—`; si no `${v.toFixed(3)} $`.
   Tokens con `new Intl.NumberFormat(getLang())`. `revealStagger` sobre las columnas la primera vez;
   `animateNumber` solo para velocidad y tokens al cambiar de modelo (precisión y costo van como texto).
   Sin cifras de benchmark escritas. Devuelve `{ cancelar }` como los demás componentes.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

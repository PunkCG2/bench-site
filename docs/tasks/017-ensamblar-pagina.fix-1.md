# Correcciones 017 - ronda 1 (reparto en partes)

Trabaja por partes, una llamada por archivo, sin razonar de más. Esta ronda: 2 archivos (NO crees tests ahora).
Lee antes `docs/tasks/017-ensamblar-pagina.md`. Patrón de API de los componentes: todos se llaman
`renderX(contenedor, datos)` y devuelven `{ cancelar }`; cada uno añade sus propios elementos a `contenedor`.

1. `src/i18n/sections/comun.js` (Edit): añade la clave `app.vacio` en es ("No hay resultados de benchmark
   para mostrar.") y en en ("There are no benchmark results to show.").
2. `src/main.js` (reescribir, menos de 70 líneas). Importa: `benchmarks.json` (`./data/benchmarks.json`),
   los CSS `tokens`, `base`, `animate` (`./styles/...`; los demás CSS los importa cada componente), `initState,
   getState` de `./state.js`, `t, onLangChange` de `./i18n/index.js`, y los componentes `renderHeader` (header.js),
   `renderHero`, `renderColumnas`, `renderGrafico`, `renderTabla`, `renderHallazgos`, `renderFooter` (de
   `./components/*.js`). Exporta `montar(raiz, datos)`:
   - `raiz.textContent = ''`; `initState(datos)`; `document.title = t('titulo')` y de nuevo en cada `onLangChange`.
   - Orden del DOM: `renderHeader(raiz, datos)` (añade el `<header>`); luego `<main class="contenedor">` en `raiz`;
     luego `renderFooter(raiz)`.
   - Dentro de `<main>`: si `datos.modelos.length === 0`, un `<p class="vacio">` con `t('app.vacio')` (y se vuelve
     a escribir al cambiar el idioma) y nada más; si no, llama en este orden a `renderHero`, `renderColumnas`,
     `renderGrafico`, `renderTabla`, `renderHallazgos`, todos con `main` como contenedor. Tras cada llamada, el
     nuevo `<section>` hijo de `main` recibe un `id`: `hero`, `modos`, `grafico`, `detalle`, `hallazgos`, `metodologia`
     (`renderHallazgos` añade DOS secciones: hallazgos y metodología). Hazlo recorriendo `main.children` con una lista
     de ids en ese orden.
   - Devuelve `{ cancelar }` que cancela todos los `cancelar` de los componentes.
   - Al final del archivo: `montar(document.getElementById('app'), benchmarks)` solo si existe ese elemento.
   Sin cifras ni textos fijos en el código.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

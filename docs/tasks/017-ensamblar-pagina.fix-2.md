# Correcciones 017 - ronda 2

Ya está `src/main.js` con `montar(raiz, datos)` (no lo modifiques). Falta solo `tests/app.test.js`, máximo 80
líneas, con UNA llamada Write, sin razonar de más. Patrón: `tests/hero.test.js` pero SIN `vi.mock` de animate;
en su lugar, antes de importar, simula en `beforeEach` `window.matchMedia` (devuelve
`{ matches: false, addEventListener(){}, removeEventListener(){} }`) y `IntersectionObserver` global
(clase con `observe(el){ this.cb([{ isIntersecting: true }]) }`, `disconnect(){}`, constructor que guarda el cb).
`montar` se importa de `../src/main.js` (no hay `#app` en el DOM, así que no se monta solo).
`beforeEach`: `localStorage.clear()`, `document.body.innerHTML = ''`, raíz nueva en el body; `afterEach`: `cancelar()`.
Pruebas (datos de `src/data/benchmarks.json`):
1. Zonas en orden: el `<header>` es el primer hijo de la raíz y `<footer>` el último; `<main>` tiene hijos con ids
   `hero, modos, grafico, detalle, hallazgos, metodologia` en ese orden (8 zonas contando header y footer).
2. Cambiar el modelo (`setModelo`, de `../src/state.js`) cambia el texto de `#modos` (`.tarjeta__valor`).
3. `setIdioma('en')` cambia el texto del `<h1>` del header, el del footer y el `document.title` queda igual
   ("Local + Claude" en ambos idiomas: comprueba solo header/footer/hero frase).
4. `setTema('light')` pone `document.documentElement.dataset.theme === 'light'`.
5. Con `{ modelos: [] }` aparece `.vacio` con `t('app.vacio')` y no hay `#hero`.
6. Con 3 modelos inventados (copias de los datos reales con `id` y `etiqueta` distintos: `{ ...m, id: 'a', etiqueta: 'A' }`
   etc.) se monta sin lanzar y el header tiene 3 botones de modelo.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas.

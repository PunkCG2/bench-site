---
id: 009
estado: en-curso
ejecuta: local
depende: [002, 006, 007]
rondas: 0
---
# Construir el header estático y el footer

## Objetivo
El sitio tiene un header fijo con título, selector de modelo centrado y botones de idioma y
tema a la derecha, y un footer discreto, todos conectados al estado.

## Archivos en alcance
- src/components/header.js (crear)
- src/components/footer.js (crear)
- src/styles/header.css (crear)
- tests/header.test.js (crear)

## No tocar
- data/raw/
- src/state.js, src/i18n/index.js (solo se usa su API)

## Detalles
Aplica docs/diseno.md §Header y §Footer.
- `renderHeader(contenedor, datos)` y `renderFooter(contenedor)` insertan el DOM y se
  re-renderizan o actualizan solos al cambiar el idioma (`onLangChange`) o el estado
  (`subscribe` de `src/state.js`).
- Header: `<header>` con `position: sticky; top: 0`, `z-index: var(--z-header)`, fondo opaco
  `--bg`, **sin borde ni sombra**. Ningún contenido de la página debe dibujarse encima del
  header (los demás componentes no usan `z-index` mayor ni igual a `--z-header`). Tres zonas en una rejilla (`grid-template-columns: 1fr auto 1fr`): izquierda
  título `t('titulo')` (y debajo `t('subtitulo')` en `--muted`, tamaño `--fs-14`); centro el
  selector de modelo; derecha los botones de idioma y tema, alineados a la derecha.
- Selector de modelo: grupo de botones (uno por modelo en `datos.modelos`, con texto
  `modelo.etiqueta`), `role="group"` con `aria-label`; el activo lleva `aria-pressed="true"`
  y un estilo distinto. Clic llama `setModelo(id)`. Radio `--r-btn`. Se prevén de 2 a 5
  modelos: el grupo tiene `max-width: 100%` y `overflow-x: auto` para no desbordar el header.
  No asumas ningún modelo concreto; los botones salen solo de `datos.modelos`.
- Botón de idioma: muestra el idioma al que cambiaría (`EN` si está en español, `ES` si está en
  inglés), con `aria-label` traducido. Clic alterna con `setIdioma`.
- Botón de tema: texto visible (no solo icono) "Claro" / "Oscuro" según el tema al que cambiaría,
  traducido; `aria-label` traducido. Clic alterna con `setTema`. Las claves de texto van en
  `src/i18n/sections/header.js` (`{ es, en }`, claves `header.*`).
- Móvil (< 900 px): dos filas. Arriba título y a la derecha los botones de idioma y tema; abajo
  el selector de modelo centrado. Usa `@media (max-width: 899px)`.
- Footer: `<footer>` con una línea centrada `t('footer.leyenda')`, `--fs-14`, color `--muted`,
  sin enlaces ni iconos, margen superior `--sp-48`.
- Estilos solo con variables de `tokens.css`.
- Pruebas (jsdom): hay un botón por modelo; el activo tiene `aria-pressed="true"`; clic cambia
  el modelo en el estado; clic en el botón de idioma cambia el texto del título a inglés
  (el subtítulo cambia); clic en el botón de tema cambia `data-theme`; el footer muestra la
  leyenda en español y en inglés.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `header.css` no contiene valores hexadecimales ni `border` ni `box-shadow` en el header
- [ ] `header.css` usa `z-index: var(--z-header)` y ningún otro `.css` declara un `z-index` igual o mayor

## Notas de revisión
(las escribe Claude al aprobar)

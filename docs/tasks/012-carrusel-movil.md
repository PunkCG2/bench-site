---
id: 012
estado: pendiente
ejecuta: claude
depende: [011]
rondas: 0
---
# Convertir las columnas en carrusel en pantallas estrechas

## Objetivo
Por debajo de 900 px las tres columnas forman un carrusel horizontal de una columna visible, que se
cambia con swipe, con arrastre de mouse, con indicador de puntos y con el teclado.

## Archivos en alcance
- src/components/carrusel.js (crear)
- src/styles/columnas.css (modificar)
- src/components/columnas.js (modificar: conectar el carrusel)
- src/i18n/sections/columnas.js (modificar: etiquetas de los puntos)
- tests/carrusel.test.js (crear)

## No tocar
- data/raw/

## Detalles
Aplica docs/diseno.md §Columnas comparativas. Va a Claude porque depende de la sensación del
gesto (umbrales de arrastre, snap, foco), difícil de dar como especificación cerrada.
- Implementación: `scroll-snap-type: x mandatory` en un contenedor con `overflow-x: auto`, cada
  columna con `scroll-snap-align: center` y ancho del 100 % del contenedor, solo con
  `max-width: 899px`. Sin librerías.
- Swipe táctil: lo da el scroll nativo.
- Arrastre con mouse (PC con ventana estrecha): eventos de puntero (`pointerdown/move/up`
  con `pointerType === 'mouse'`) que desplazan `scrollLeft`; al soltar, ajustar a la columna
  más cercana. Un arrastre real no debe disparar un `click` en lo que se arrastró.
- Indicador: tres puntos, cada uno un `<button>` con `aria-label` con la etiqueta de su modo
  (`t('modo.*')`) y `aria-current` en el activo; clic desplaza a esa columna.
- Teclado: con el foco en el carrusel, ← y → cambian de columna.
- La columna visible se mantiene al cambiar de modelo (no reiniciar el scroll al re-renderizar).
- Con `prefers-reduced-motion` el cambio de columna es inmediato (`scroll-behavior: auto`,
  `behavior: 'auto'`); si no, `smooth`.
- Pruebas (jsdom): funciones puras del módulo (columna más cercana dado `scrollLeft` y ancho;
  siguiente/anterior con límites), el punto activo cambia, ← y → mueven el índice, el índice se
  conserva tras un re-render. Los gestos reales se verifican a mano.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] A 800 px de ancho solo se ve una columna a la vez y a 1000 px se ven las tres (verificado
      con el navegador)
- [ ] Arrastrar con el mouse a 800 px cambia de columna; ← y → también
- [ ] Al hacer scroll vertical, el carrusel pasa por debajo del header y nunca por encima
      (verificado en el navegador; el carrusel no declara `z-index`)

## Notas de revisión
(las escribe Claude al aprobar)

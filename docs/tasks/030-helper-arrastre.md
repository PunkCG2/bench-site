---
id: 030
estado: pendiente
ejecuta: local
depende: [029]
hito: M6
rondas: 0
---
# Helper de arrastre con mouse para tiras con scroll horizontal

## Objetivo
Un modulo reutilizable que permite arrastrar con el mouse una tira con `overflow-x: auto`, con tests.

## Archivos en alcance
- src/lib/arrastre.js (crear)
- tests/arrastre.test.js (crear)

## No tocar
- data/raw/
- src/components/carrusel.js (no refactorizar)

## Detalles
Misma logica que el arrastre de `src/components/carrusel.js` (lineas 84-135), sin el ajuste a columnas.
- `export function habilitarArrastre(el, { umbral = 5, claseActiva = 'arrastrando' } = {})` devuelve una funcion `destruir()` que quita los listeners.
- Solo cuenta `pointerType === 'mouse'` y `button === 0`. El tactil lo resuelve el scroll nativo.
- `pointerdown`: guarda `clientX` y `el.scrollLeft`. `pointermove`: si el desplazamiento supera `umbral`, marca arrastre, agrega `claseActiva` y hace `el.setPointerCapture?.(e.pointerId)` dentro de `try/catch`. Mientras arrastra: `el.scrollLeft = inicioScroll - dx`.
- `pointerup` y `pointercancel`: quita la clase; el estado de arrastre se apaga con `setTimeout(..., 0)` para que el clic que genera el navegador aun lo vea.
- Listener `click` en fase de captura (`addEventListener('click', fn, true)`): si hay arrastre, `stopPropagation()` y `preventDefault()`.
- Codigo compacto, comentarios en espanol, sin dependencias. Un archivo por llamada Write.
- Tests (vitest, jsdom): arrastre mayor que el umbral cambia `scrollLeft` y agrega la clase; movimiento menor no cambia nada y deja pasar el clic; un arrastre bloquea el clic siguiente; `pointerType: 'touch'` se ignora; `destruir()` deja de reaccionar. Crear eventos con `new MouseEvent('pointerdown', { clientX, button: 0, bubbles: true })` y asignar `pointerType` con `Object.defineProperty` si jsdom no lo soporta.

## Criterios de aceptacion
- [ ] `npm test` pasa
- [ ] `src/lib/arrastre.js` exporta `habilitarArrastre`
- [ ] `tests/arrastre.test.js` cubre los 5 casos de arriba

## Notas de revision
(las escribe Claude al aprobar)

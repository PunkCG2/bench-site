---
id: 008
estado: hecha
ejecuta: local
depende: [002]
rondas: 0
---
# Crear utilidades de animación (contador y aparición)

## Objetivo
Existen helpers para animar contadores y la aparición escalonada de elementos, que respetan
`prefers-reduced-motion`, sin librerías.

## Archivos en alcance
- src/lib/animate.js (crear)
- src/styles/animate.css (crear)
- tests/animate.test.js (crear)

## No tocar
- data/raw/

## Detalles
Aplica docs/diseno.md §Animación.
- `prefersReducedMotion()`: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`;
  `false` si `matchMedia` no existe.
- `animateNumber(el, valor, { duracion = 900, decimales = 0, formato } = {})`: anima el texto de `el`
  de su valor actual (0 la primera vez) a `valor` con `requestAnimationFrame` y ease-out
  (`1 - (1 - t) ** 3`). `formato(n)` opcional devuelve el texto; por defecto `n.toFixed(decimales)`.
  Con reduced-motion o `duracion <= 0` fija el valor final de inmediato. Si se llama de nuevo
  sobre el mismo `el`, cancela la animación anterior. Es lo que usa el cambio de modelo.
- `onEnterViewport(el, callback)`: ejecuta `callback` una sola vez cuando `el` entra en pantalla
  con `IntersectionObserver` (umbral 0.2). Sin `IntersectionObserver`, ejecuta de inmediato.
- `revealStagger(elementos, { paso = 80 } = {})`: agrega la clase `revelar` a cada elemento y
  después `revelar--visible` con retraso `i * paso` ms (vía `style.transitionDelay`). Con
  reduced-motion agrega `revelar--visible` sin retraso.
- `animate.css`: `.revelar { opacity: 0; transform: translateY(12px); transition: opacity
  var(--dur-reveal) var(--ease-out), transform var(--dur-reveal) var(--ease-out); }`,
  `.revelar--visible { opacity: 1; transform: none; }` y, bajo `prefers-reduced-motion: reduce`,
  ambas clases con `opacity: 1; transform: none; transition: none`. Sin animaciones en bucle.
- Pruebas (jsdom, con `vi.useFakeTimers` y un `requestAnimationFrame` simulado o
  `vi.stubGlobal`): valor final correcto tras la duración; reduced-motion fija el valor final al
  instante; llamar dos veces cancela la primera; `revealStagger` aplica clases y retrasos
  `0, 80, 160 ms`; `onEnterViewport` llama una sola vez.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `animate.css` solo usa valores vía `var(--...)` salvo `12px`, `0` y `1` del desplazamiento y la opacidad

## Notas de revisión
Worker local cumplió a la primera. 72 tests y build verificados; animate.css solo con var(--...) salvo 12px, 0 y 1.

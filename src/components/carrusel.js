// Carrusel de las tres columnas en pantallas estrechas (< 900 px).
// El scroll horizontal con scroll-snap lo hace el CSS (y el swipe táctil el
// navegador); aquí van el arrastre con mouse, los puntos y las flechas.
// Sin librerías. En escritorio la rejilla no desborda y los puntos se ocultan.

import { prefersReducedMotion } from '../lib/animate.js'

// Pixeles que debe moverse el puntero para contar como arrastre (y no como clic).
const UMBRAL_ARRASTRE = 5

export function limitar(indice, total) {
  return Math.max(0, Math.min(total - 1, indice))
}

export function siguiente(indice, total) {
  return limitar(indice + 1, total)
}

export function anterior(indice, total) {
  return limitar(indice - 1, total)
}

// Índice de la columna más cercana a `scrollLeft`, dado el paso entre columnas.
export function columnaMasCercana(scrollLeft, paso, total) {
  if (!(paso > 0)) return 0
  return limitar(Math.round(scrollLeft / paso), total)
}

// `columnas`: elementos del carrusel. `etiquetas()`: textos de los puntos
// (se vuelve a llamar con `actualizarEtiquetas` al cambiar el idioma).
export function crearCarrusel(rejilla, columnas, etiquetas) {
  const total = columnas.length
  let indice = 0

  rejilla.tabIndex = 0
  rejilla.classList.add('carrusel')

  const puntos = document.createElement('div')
  puntos.className = 'carrusel__puntos'
  const botones = columnas.map((_, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'carrusel__punto'
    b.addEventListener('click', () => ir(i))
    puntos.appendChild(b)
    return b
  })

  function paso() {
    if (total < 2) return rejilla.clientWidth
    const d = columnas[1].offsetLeft - columnas[0].offsetLeft
    return d > 0 ? d : rejilla.clientWidth
  }

  function marcar() {
    botones.forEach((b, i) => {
      if (i === indice) b.setAttribute('aria-current', 'true')
      else b.removeAttribute('aria-current')
    })
  }

  function ir(i) {
    indice = limitar(i, total)
    marcar()
    rejilla.scrollTo({
      left: indice * paso(),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  // El índice sigue al scroll (swipe, arrastre o teclado).
  let pendiente = false
  function alScroll() {
    if (pendiente) return
    pendiente = true
    requestAnimationFrame(() => {
      pendiente = false
      const nuevo = columnaMasCercana(rejilla.scrollLeft, paso(), total)
      if (nuevo !== indice) {
        indice = nuevo
        marcar()
      }
    })
  }

  // Arrastre con mouse; el táctil lo resuelve el scroll nativo.
  let inicioX = null
  let inicioScroll = 0
  let arrastrando = false

  function alPulsar(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    inicioX = e.clientX
    inicioScroll = rejilla.scrollLeft
    arrastrando = false
  }

  function alMover(e) {
    if (inicioX === null) return
    const dx = e.clientX - inicioX
    if (!arrastrando && Math.abs(dx) > UMBRAL_ARRASTRE) {
      arrastrando = true
      rejilla.classList.add('carrusel--arrastrando')
      rejilla.setPointerCapture?.(e.pointerId)
    }
    if (arrastrando) rejilla.scrollLeft = inicioScroll - dx
  }

  function alSoltar() {
    if (inicioX === null) return
    inicioX = null
    if (!arrastrando) return
    rejilla.classList.remove('carrusel--arrastrando')
    // Se deja `arrastrando` activo hasta después del clic que genera el navegador.
    setTimeout(() => { arrastrando = false }, 0)
    ir(columnaMasCercana(rejilla.scrollLeft, paso(), total))
  }

  // Un arrastre real no debe disparar un clic sobre lo arrastrado.
  function alClic(e) {
    if (arrastrando) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  function alTeclear(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      ir(siguiente(indice, total))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      ir(anterior(indice, total))
    }
  }

  rejilla.addEventListener('scroll', alScroll, { passive: true })
  rejilla.addEventListener('pointerdown', alPulsar)
  rejilla.addEventListener('pointermove', alMover)
  rejilla.addEventListener('pointerup', alSoltar)
  rejilla.addEventListener('pointercancel', alSoltar)
  rejilla.addEventListener('click', alClic, true)
  rejilla.addEventListener('keydown', alTeclear)

  function actualizarEtiquetas() {
    etiquetas().forEach((texto, i) => {
      botones[i].setAttribute('aria-label', texto)
    })
  }

  actualizarEtiquetas()
  marcar()

  return {
    puntos,
    ir,
    getIndice: () => indice,
    actualizarEtiquetas,
    destruir() {
      rejilla.removeEventListener('scroll', alScroll)
      rejilla.removeEventListener('pointerdown', alPulsar)
      rejilla.removeEventListener('pointermove', alMover)
      rejilla.removeEventListener('pointerup', alSoltar)
      rejilla.removeEventListener('pointercancel', alSoltar)
      rejilla.removeEventListener('click', alClic, true)
      rejilla.removeEventListener('keydown', alTeclear)
    },
  }
}

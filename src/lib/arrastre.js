// Arrastre con mouse para tiras con scroll horizontal (overflow-x: auto).
// El táctil lo resuelve el scroll nativo; aquí solo el puntero de mouse.

export function habilitarArrastre(el, { umbral = 5, claseActiva = 'arrastrando' } = {}) {
  let inicioX = null
  let inicioScroll = 0
  let arrastrando = false

  function alPulsar(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    inicioX = e.clientX
    inicioScroll = el.scrollLeft
    arrastrando = false
  }

  function alMover(e) {
    if (inicioX === null) return
    const dx = e.clientX - inicioX
    if (!arrastrando && Math.abs(dx) > umbral) {
      arrastrando = true
      el.classList.add(claseActiva)
      try {
        // Sigue el arrastre aunque el puntero salga de la tira.
        el.setPointerCapture?.(e.pointerId)
      } catch {
        // Un puntero sin captura posible no debe romper el arrastre.
      }
    }
    if (arrastrando) el.scrollLeft = inicioScroll - dx
  }

  function alSoltar() {
    if (inicioX === null) return
    inicioX = null
    if (!arrastrando) return
    el.classList.remove(claseActiva)
    // Se deja `arrastrando` activo hasta después del clic que genera el navegador.
    setTimeout(() => { arrastrando = false }, 0)
  }

  // Un arrastre real no debe disparar un clic sobre lo arrastrado.
  function alClic(e) {
    if (arrastrando) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  el.addEventListener('pointerdown', alPulsar)
  el.addEventListener('pointermove', alMover)
  el.addEventListener('pointerup', alSoltar)
  el.addEventListener('pointercancel', alSoltar)
  el.addEventListener('click', alClic, true)

  return function destruir() {
    el.removeEventListener('pointerdown', alPulsar)
    el.removeEventListener('pointermove', alMover)
    el.removeEventListener('pointerup', alSoltar)
    el.removeEventListener('pointercancel', alSoltar)
    el.removeEventListener('click', alClic, true)
  }
}

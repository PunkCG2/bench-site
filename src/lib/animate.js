// Utilidades de animación: contadores y aparición escalonada.
// Sin librerías: requestAnimationFrame + IntersectionObserver + CSS transitions.
// Todo respeta prefers-reduced-motion: con reduce, todo queda en su estado final.

// Estado por elemento: el valor mostrado y el id del requestAnimationFrame
// activo, para poder cancelar la animación anterior al llamar de nuevo.
const estado = new WeakMap()

// true si el usuario prefiere menos movimiento; false si matchMedia no existe.
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Anima el texto de `el` desde su valor actual (0 la primera vez) hasta `valor`
// en `duracion` ms con ease-out. `formato(n)` devuelve el texto; por defecto
// `n.toFixed(decimales)`. Con reduced-motion o `duracion <= 0` fija el valor
// final de inmediato. Llamar de nuevo sobre el mismo `el` cancela la
// animación anterior. Es lo que usa el cambio de modelo.
export function animateNumber(el, valor, { duracion = 900, decimales = 0, formato } = {}) {
  const texto = formato ?? ((n) => n.toFixed(decimales))
  const prev = estado.get(el)
  if (prev?.raf) cancelAnimationFrame(prev.raf)

  const desde = prev?.valor ?? 0

  if (prefersReducedMotion() || duracion <= 0) {
    el.textContent = texto(valor)
    estado.set(el, { valor, raf: 0 })
    return
  }

  let inicio = null
  const paso = (ahora) => {
    if (inicio === null) inicio = ahora
    const t = Math.min((ahora - inicio) / duracion, 1)
    const e = 1 - (1 - t) ** 3
    const n = desde + (valor - desde) * e
    el.textContent = texto(n)
    if (t < 1) {
      const raf = requestAnimationFrame(paso)
      estado.set(el, { valor: n, raf })
    } else {
      estado.set(el, { valor, raf: 0 })
    }
  }

  const raf = requestAnimationFrame(paso)
  estado.set(el, { valor: desde, raf })
}

// Ejecuta `callback` una sola vez cuando `el` entra en pantalla (umbral 0.2).
// Sin IntersectionObserver, ejecuta de inmediato.
export function onEnterViewport(el, callback) {
  if (typeof IntersectionObserver !== 'undefined') {
    let hecho = false
    const observer = new IntersectionObserver((entradas) => {
      if (hecho) return
      if (entradas.some((e) => e.isIntersecting)) {
        hecho = true
        observer.disconnect()
        callback()
      }
    }, { threshold: 0.2 })
    observer.observe(el)
    return
  }
  callback()
}

// Agrega `revelar` a cada elemento y después `revelar--visible` con retraso
// `i * paso` ms vía `style.transitionDelay`. Con reduced-motion agrega
// `revelar--visible` sin retraso.
export function revealStagger(elementos, { paso = 80 } = {}) {
  const reduce = prefersReducedMotion()
  for (const [i, el] of elementos.entries()) {
    el.classList.add('revelar')
    if (reduce) {
      el.classList.add('revelar--visible')
      continue
    }
    el.style.transitionDelay = `${i * paso}ms`
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('revelar--visible')
    }))
  }
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../src/lib/animate.js', () => ({
  animateNumber(el, v, o) {
    el.textContent = o.formato ? o.formato(v) : String(v)
  },
  onEnterViewport(el, cb) {
    cb()
  },
}))

import { initState, setModelo, setIdioma } from '../src/state.js'
import { reduccionTokens } from '../src/lib/metrics.js'
import { renderHero, formatoReduccion, formatoFactor } from '../src/components/hero.js'
import datos from '../src/data/benchmarks.json'

let contenedor
let handle

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  initState(datos)
})

afterEach(() => {
  handle?.cancelar()
  contenedor.remove()
})

describe('hero', () => {
  it('la primera cifra muestra la reducción del modelo activo y cambia al cambiar de modelo', () => {
    handle = renderHero(contenedor, datos)
    const [m1, m2] = datos.modelos
    const valor = contenedor.querySelector('.hero__cifra .hero__valor')
    expect(valor.textContent).toContain(String(reduccionTokens(m1)))
    setModelo(m2.id)
    expect(valor.textContent).toContain(String(reduccionTokens(m2)))
  })

  it('la frase está en español y pasa a inglés con setIdioma', () => {
    handle = renderHero(contenedor, datos)
    const frase = contenedor.querySelector('.hero__frase')
    expect(frase.textContent).toContain('La pareja')
    setIdioma('en')
    expect(frase.textContent).toContain('The pair')
  })
})

describe('formatos de las cifras animadas', () => {
  it('durante la animación nunca muestran decimales', () => {
    expect(formatoReduccion(77.29244550840329)).toBe('−77 %')
    expect(formatoReduccion(-3.4)).toBe('+3 %')
    expect(formatoFactor(6.936501)).toBe('7×')
  })
})

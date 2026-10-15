import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { montar } from '../src/main.js'
import { setModelo, setIdioma, setTema } from '../src/state.js'
import { t } from '../src/i18n/index.js'
import datos from '../src/data/benchmarks.json'

let raiz
let handle

beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  class IO {
    constructor(cb) { this.cb = cb }
    observe() { this.cb([{ isIntersecting: true }]) }
    disconnect() {}
  }
  globalThis.IntersectionObserver = IO
  localStorage.clear()
  document.body.innerHTML = ''
  raiz = document.createElement('div')
  document.body.appendChild(raiz)
})

afterEach(() => {
  handle?.cancelar()
})

describe('app', () => {
  it('monta las 8 zonas en orden', () => {
    handle = montar(raiz, datos)
    expect(raiz.firstElementChild.tagName).toBe('HEADER')
    expect(raiz.lastElementChild.tagName).toBe('FOOTER')
    const ids = [...raiz.querySelector('main').children].map((el) => el.id)
    expect(ids).toEqual(['hero', 'modos', 'grafico', 'detalle', 'hallazgos', 'metodologia'])
  })

  it('setModelo cambia el texto de #modos', () => {
    handle = montar(raiz, datos)
    const antes = raiz.querySelector('#modos').textContent
    setModelo(datos.modelos[1].id)
    expect(raiz.querySelector('#modos').textContent).not.toBe(antes)
  })

  it('setIdioma cambia header, footer y hero; el título queda igual', () => {
    handle = montar(raiz, datos)
    const header = raiz.querySelector('header')
    const footer = raiz.querySelector('footer')
    const frase = raiz.querySelector('.hero__frase')
    const antes = [header.textContent, footer.textContent, frase.textContent]
    setIdioma('en')
    expect([header.textContent, footer.textContent, frase.textContent]).not.toEqual(antes)
    expect(document.title).toBe('Local + Claude')
  })

  it('setTema pone el tema en el documento', () => {
    handle = montar(raiz, datos)
    setTema('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('sin modelos muestra .vacio y no hay #hero', () => {
    handle = montar(raiz, { modelos: [] })
    expect(raiz.querySelector('.vacio').textContent).toBe(t('app.vacio'))
    expect(raiz.querySelector('#hero')).toBeNull()
  })

  it('monta con 3 modelos inventados y 3 botones de modelo', () => {
    const [m1, m2] = datos.modelos
    const modelos = [
      { ...m1, id: 'a', etiqueta: 'A' },
      { ...m2, id: 'b', etiqueta: 'B' },
      { ...m1, id: 'c', etiqueta: 'C' },
    ]
    handle = montar(raiz, { ...datos, modelos })
    expect(raiz.querySelectorAll('.header__modelo').length).toBe(3)
  })
})

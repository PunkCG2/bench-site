import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initState, setModelo, setIdioma } from '../src/state.js'
import { veredicto } from '../src/lib/veredicto.js'
import { diccionarios } from '../src/i18n/index.js'
import { renderVeredicto } from '../src/components/veredicto.js'
import datos from '../src/data/benchmarks.json'

let contenedor
let handle

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  initState(datos)
  setIdioma('es')
  handle = renderVeredicto(contenedor, datos)
})

afterEach(() => {
  handle?.cancelar()
  contenedor.remove()
})

describe('veredicto', () => {
  it('muestra cuatro tarjetas y la conclusión con una de las tres clases', () => {
    expect(contenedor.querySelectorAll('.veredicto__tarjeta')).toHaveLength(4)
    const respuesta = contenedor.querySelector('.veredicto__respuesta')
    const clases = ['--si', '--depende', '--no'].map((s) => `veredicto__respuesta${s}`)
    expect(clases.some((c) => respuesta.classList.contains(c))).toBe(true)
  })

  it('al cambiar de modelo actualiza la conclusión', () => {
    const [, m2] = datos.modelos
    setModelo(m2.id)
    const respuesta = contenedor.querySelector('.veredicto__respuesta')
    expect(respuesta.classList.contains(`veredicto__respuesta--${veredicto(m2).conclusion}`)).toBe(true)
  })

  it('al cambiar de idioma cambia la frase de conclusión', () => {
    const m1 = datos.modelos[0]
    const frase = contenedor.querySelector('.veredicto__frase')
    const caso = veredicto(m1).conclusion
    expect(frase.textContent).toBe(diccionarios.es[`veredicto.frase.${caso}`])
    setIdioma('en')
    expect(frase.textContent).toBe(diccionarios.en[`veredicto.frase.${caso}`])
  })
})

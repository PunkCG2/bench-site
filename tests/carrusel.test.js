import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  columnaMasCercana,
  siguiente,
  anterior,
  limitar,
  crearCarrusel,
} from '../src/components/carrusel.js'

describe('funciones puras', () => {
  it('columnaMasCercana redondea al paso más cercano y respeta los límites', () => {
    expect(columnaMasCercana(0, 300, 3)).toBe(0)
    expect(columnaMasCercana(149, 300, 3)).toBe(0)
    expect(columnaMasCercana(151, 300, 3)).toBe(1)
    expect(columnaMasCercana(900, 300, 3)).toBe(2)
    expect(columnaMasCercana(100, 0, 3)).toBe(0)
  })

  it('siguiente y anterior no pasan de los extremos', () => {
    expect(siguiente(0, 3)).toBe(1)
    expect(siguiente(2, 3)).toBe(2)
    expect(anterior(2, 3)).toBe(1)
    expect(anterior(0, 3)).toBe(0)
    expect(limitar(-4, 3)).toBe(0)
    expect(limitar(9, 3)).toBe(2)
  })
})

describe('crearCarrusel', () => {
  let rejilla, columnas, carrusel

  beforeEach(() => {
    document.body.innerHTML = ''
    rejilla = document.createElement('div')
    columnas = ['a', 'b', 'c'].map(() => {
      const c = document.createElement('section')
      rejilla.appendChild(c)
      return c
    })
    rejilla.scrollTo = vi.fn()
    document.body.append(rejilla)
    carrusel = crearCarrusel(rejilla, columnas, () => ['Uno', 'Dos', 'Tres'])
    document.body.append(carrusel.puntos)
  })

  afterEach(() => carrusel.destruir())

  const activo = () =>
    [...carrusel.puntos.children].findIndex((b) => b.getAttribute('aria-current') === 'true')

  it('crea un botón por columna con la etiqueta de su modo', () => {
    const botones = [...carrusel.puntos.querySelectorAll('button')]
    expect(botones.map((b) => b.getAttribute('aria-label'))).toEqual(['Uno', 'Dos', 'Tres'])
    expect(activo()).toBe(0)
  })

  it('clic en un punto cambia la columna activa y desplaza', () => {
    carrusel.puntos.children[2].click()
    expect(activo()).toBe(2)
    expect(rejilla.scrollTo).toHaveBeenCalled()
  })

  it('← y → mueven el índice sin pasar de los extremos', () => {
    const tecla = (key) => rejilla.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    tecla('ArrowRight')
    tecla('ArrowRight')
    tecla('ArrowRight')
    expect(carrusel.getIndice()).toBe(2)
    tecla('ArrowLeft')
    expect(carrusel.getIndice()).toBe(1)
  })

  it('el índice se conserva al actualizar las etiquetas (re-render)', () => {
    carrusel.ir(1)
    carrusel.actualizarEtiquetas()
    expect(carrusel.getIndice()).toBe(1)
    expect(activo()).toBe(1)
  })
})

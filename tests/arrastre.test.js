import { describe, it, expect, beforeEach } from 'vitest'
import { habilitarArrastre } from '../src/lib/arrastre.js'

// jsdom no implementa PointerEvent; se usa MouseEvent y se añade `pointerType`.
function puntero(tipo, { clientX = 0, button = 0, pointerType = 'mouse' } = {}) {
  const e = new MouseEvent(tipo, { clientX, button, bubbles: true })
  Object.defineProperty(e, 'pointerType', { value: pointerType })
  return e
}

describe('habilitarArrastre', () => {
  let el, destruir

  beforeEach(() => {
    document.body.innerHTML = ''
    el = document.createElement('div')
    document.body.append(el)
    destruir = habilitarArrastre(el)
  })

  it('un arrastre mayor que el umbral cambia scrollLeft y agrega la clase', () => {
    el.scrollLeft = 100
    el.dispatchEvent(puntero('pointerdown', { clientX: 0 }))
    el.dispatchEvent(puntero('pointermove', { clientX: 30 }))
    expect(el.scrollLeft).toBe(70)
    expect(el.classList.contains('arrastrando')).toBe(true)
  })

  it('un movimiento menor que el umbral no cambia nada y deja pasar el clic', () => {
    el.scrollLeft = 100
    el.dispatchEvent(puntero('pointerdown', { clientX: 0 }))
    el.dispatchEvent(puntero('pointermove', { clientX: 3 }))
    el.dispatchEvent(puntero('pointerup', { clientX: 3 }))
    expect(el.scrollLeft).toBe(100)
    expect(el.classList.contains('arrastrando')).toBe(false)
    let clic = false
    el.addEventListener('click', () => { clic = true })
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(clic).toBe(true)
  })

  it('un arrastre bloquea el clic siguiente', () => {
    const hijo = document.createElement('div')
    el.appendChild(hijo)
    let clicEnHijo = false
    hijo.addEventListener('click', () => { clicEnHijo = true })
    el.dispatchEvent(puntero('pointerdown', { clientX: 0 }))
    el.dispatchEvent(puntero('pointermove', { clientX: 30 }))
    el.dispatchEvent(puntero('pointerup', { clientX: 30 }))
    // El clic que genera el navegador, sobre lo arrastrado.
    hijo.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(clicEnHijo).toBe(false)
  })

  it('ignora el puntero táctil (lo resuelve el scroll nativo)', () => {
    el.scrollLeft = 100
    el.dispatchEvent(puntero('pointerdown', { clientX: 0, pointerType: 'touch' }))
    el.dispatchEvent(puntero('pointermove', { clientX: 30, pointerType: 'touch' }))
    expect(el.scrollLeft).toBe(100)
    expect(el.classList.contains('arrastrando')).toBe(false)
  })

  it('destruir() deja de reaccionar', () => {
    el.scrollLeft = 100
    destruir()
    el.dispatchEvent(puntero('pointerdown', { clientX: 0 }))
    el.dispatchEvent(puntero('pointermove', { clientX: 30 }))
    expect(el.scrollLeft).toBe(100)
    expect(el.classList.contains('arrastrando')).toBe(false)
  })
})

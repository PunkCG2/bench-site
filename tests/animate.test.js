import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  prefersReducedMotion,
  animateNumber,
  onEnterViewport,
  revealStagger,
} from '../src/lib/animate.js'

// rAF simulado sobre fake timers: cada "frame" pasa a los 16 ms.
function montarRaf() {
  vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(() => cb(Date.now()), 16))
  vi.stubGlobal('cancelAnimationFrame', (id) => clearTimeout(id))
}

function matchMediaReduce(reduce) {
  vi.stubGlobal(
    'matchMedia',
    (query) => ({ matches: reduce && query === '(prefers-reduced-motion: reduce)' }),
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  montarRaf()
  matchMediaReduce(false)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('prefersReducedMotion', () => {
  it('false si matchMedia no existe', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })

  it('sigue matchMedia', () => {
    matchMediaReduce(true)
    expect(prefersReducedMotion()).toBe(true)
    matchMediaReduce(false)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('animateNumber', () => {
  it('valor final correcto tras la duración', () => {
    const el = document.createElement('div')
    animateNumber(el, 1234)
    vi.advanceTimersByTime(16)
    expect(el.textContent).toBe('0')
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('1234')
  })

  it('respeta decimales y formato', () => {
    const el = document.createElement('div')
    animateNumber(el, 12.5, { duracion: 0, decimales: 1 })
    expect(el.textContent).toBe('12.5')
    const el2 = document.createElement('div')
    animateNumber(el2, 1234, { duracion: 0, formato: (n) => `${n} pts` })
    expect(el2.textContent).toBe('1234 pts')
  })

  it('reduced-motion fija el valor final al instante', () => {
    matchMediaReduce(true)
    const el = document.createElement('div')
    animateNumber(el, 42)
    expect(el.textContent).toBe('42')
  })

  it('duracion <= 0 fija el valor final al instante', () => {
    const el = document.createElement('div')
    animateNumber(el, 42, { duracion: 0 })
    expect(el.textContent).toBe('42')
  })

  it('llamar dos veces cancela la primera animación', () => {
    const cancel = vi.fn((id) => clearTimeout(id))
    vi.stubGlobal('cancelAnimationFrame', cancel)
    const el = document.createElement('div')
    animateNumber(el, 100)
    vi.advanceTimersByTime(100)
    animateNumber(el, 200)
    expect(cancel).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('200')
  })

  it('la segunda animación parte del valor mostrado', () => {
    const el = document.createElement('div')
    animateNumber(el, 100)
    vi.advanceTimersByTime(450)
    const mostrado = Number(el.textContent)
    expect(mostrado).toBeGreaterThan(0)
    animateNumber(el, 200)
    vi.advanceTimersByTime(16)
    expect(Number(el.textContent)).toBe(mostrado)
    vi.advanceTimersByTime(1000)
    expect(el.textContent).toBe('200')
  })
})

describe('onEnterViewport', () => {
  it('llama una sola vez al entrar en pantalla', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const spy = vi.fn()
    let observer
    vi.stubGlobal(
      'IntersectionObserver',
      function (cb) {
        observer = {
          disconnect: vi.fn(),
          observe: vi.fn(),
        }
        observer._cb = cb
        return observer
      },
    )
    onEnterViewport(el, spy)
    expect(observer).toBeDefined()
    expect(spy).not.toHaveBeenCalled()
    // Entra en pantalla
    observer._cb([{ isIntersecting: true }], observer)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(observer.disconnect).toHaveBeenCalled()
    // Seguir intersectando no vuelve a llamar
    observer._cb([{ isIntersecting: true }], observer)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('sin IntersectionObserver ejecuta de inmediato', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const el = document.createElement('div')
    const spy = vi.fn()
    onEnterViewport(el, spy)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('revealStagger', () => {
  it('aplica revelar y revelar--visible con retrasos 0, 80, 160 ms', () => {
    const els = [1, 2, 3].map(() => document.createElement('div'))
    revealStagger(els)
    for (const el of els) {
      expect(el.classList.contains('revelar')).toBe(true)
      expect(el.classList.contains('revelar--visible')).toBe(false)
    }
    expect(els[0].style.transitionDelay).toBe('0ms')
    expect(els[1].style.transitionDelay).toBe('80ms')
    expect(els[2].style.transitionDelay).toBe('160ms')
    vi.advanceTimersByTime(32)
    for (const el of els) {
      expect(el.classList.contains('revelar--visible')).toBe(true)
    }
  })

  it('con reduced-motion agrega revelar--visible sin retraso', () => {
    matchMediaReduce(true)
    const els = [1, 2].map(() => document.createElement('div'))
    revealStagger(els)
    for (const el of els) {
      expect(el.classList.contains('revelar')).toBe(true)
      expect(el.classList.contains('revelar--visible')).toBe(true)
      expect(el.style.transitionDelay).toBe('')
    }
  })
})

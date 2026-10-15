import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  initState,
  getState,
  setModelo,
  setTema,
  setIdioma,
  subscribe,
} from '../src/state.js'
import { getLang } from '../src/i18n/index.js'
import datos from '../src/data/benchmarks.json'

const PRIMER_ID = datos.modelos[0].id
const SEGUNDO_ID = datos.modelos[1].id

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('state', () => {
  it('valores por defecto: primer modelo, tema oscuro, idioma es', () => {
    const s = initState(datos)
    expect(s.modelo).toBe(PRIMER_ID)
    expect(s.tema).toBe('dark')
    expect(s.lang).toBe('es')
    expect(getLang()).toBe('es')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('sin valor guardado, el tema sigue prefers-color-scheme', () => {
    const original = window.matchMedia
    window.matchMedia = () => ({ matches: true })
    expect(initState(datos).tema).toBe('light')
    window.matchMedia = () => ({ matches: false })
    expect(initState(datos).tema).toBe('dark')
    window.matchMedia = original
  })

  it('sin matchMedia el tema por defecto es oscuro', () => {
    expect(typeof window.matchMedia).not.toBe('function')
    expect(initState(datos).tema).toBe('dark')
  })

  it('restaura modelo, tema e idioma desde localStorage', () => {
    localStorage.setItem('bench.modelo', SEGUNDO_ID)
    localStorage.setItem('bench.tema', 'light')
    localStorage.setItem('bench.lang', 'en')
    const s = initState(datos)
    expect(s.modelo).toBe(SEGUNDO_ID)
    expect(s.tema).toBe('light')
    expect(s.lang).toBe('en')
    expect(getLang()).toBe('en')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('id de modelo guardado que ya no existe vuelve al primero', () => {
    localStorage.setItem('bench.modelo', 'modelo-antiguo')
    expect(initState(datos).modelo).toBe(PRIMER_ID)
  })

  it('tema y lang guardados inválidos vuelven al defecto', () => {
    localStorage.setItem('bench.tema', 'neon')
    localStorage.setItem('bench.lang', 'fr')
    const s = initState(datos)
    expect(s.tema).toBe('dark')
    expect(s.lang).toBe('es')
  })

  it('initState no escribe en localStorage', () => {
    initState(datos)
    expect(localStorage.getItem('bench.modelo')).toBeNull()
    expect(localStorage.getItem('bench.tema')).toBeNull()
    expect(localStorage.getItem('bench.lang')).toBeNull()
  })

  it('setModelo cambia, guarda y notifica con que=modelo', () => {
    initState(datos)
    const eventos = []
    const cancelar = subscribe((estado, que) => eventos.push([estado, que]))
    setModelo(SEGUNDO_ID)
    expect(getState().modelo).toBe(SEGUNDO_ID)
    expect(localStorage.getItem('bench.modelo')).toBe(SEGUNDO_ID)
    expect(eventos.length).toBe(1)
    expect(eventos[0][1]).toBe('modelo')
    expect(eventos[0][0].modelo).toBe(SEGUNDO_ID)
    cancelar()
  })

  it('setTema cambia, guarda, actualiza data-theme y notifica con que=tema', () => {
    initState(datos)
    const que = []
    const cancelar = subscribe((estado, q) => que.push(q))
    setTema('light')
    expect(getState().tema).toBe('light')
    expect(localStorage.getItem('bench.tema')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(que).toEqual(['tema'])
    setTema('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(que).toEqual(['tema', 'tema'])
    cancelar()
  })

  it('setIdioma cambia, guarda, llama a setLang y notifica con que=lang', () => {
    initState(datos)
    const que = []
    const cancelar = subscribe((estado, q) => que.push(q))
    setIdioma('en')
    expect(getState().lang).toBe('en')
    expect(getLang()).toBe('en')
    expect(localStorage.getItem('bench.lang')).toBe('en')
    expect(que).toEqual(['lang'])
    cancelar()
  })

  it('valores inválidos se ignoran: sin cambio, sin guardar, sin notificar', () => {
    initState(datos)
    const eventos = []
    const cancelar = subscribe((estado, que) => eventos.push(que))
    setModelo('no-existe')
    setModelo(null)
    setTema('blue')
    setTema('')
    setIdioma('fr')
    setIdioma(undefined)
    expect(getState()).toEqual({
      modelo: PRIMER_ID,
      tema: 'dark',
      lang: 'es',
    })
    expect(localStorage.getItem('bench.modelo')).toBeNull()
    expect(localStorage.getItem('bench.tema')).toBeNull()
    expect(localStorage.getItem('bench.lang')).toBeNull()
    expect(eventos).toEqual([])
    cancelar()
  })

  it('subscribe devuelve la función para cancelar', () => {
    initState(datos)
    let llamados = 0
    const cancelar = subscribe(() => llamados++)
    setModelo(SEGUNDO_ID)
    expect(llamados).toBe(1)
    cancelar()
    setModelo(PRIMER_ID)
    expect(llamados).toBe(1)
  })

  it('getState devuelve una copia', () => {
    initState(datos)
    const copia = getState()
    copia.modelo = 'otro'
    copia.tema = 'light'
    copia.lang = 'en'
    expect(getState()).toEqual({
      modelo: PRIMER_ID,
      tema: 'dark',
      lang: 'es',
    })
  })

  it('funciona cuando localStorage.getItem lanza', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('seguridad')
    })
    const s = initState(datos)
    expect(s.modelo).toBe(PRIMER_ID)
    expect(s.tema).toBe('dark')
    expect(s.lang).toBe('es')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('funciona cuando localStorage.setItem lanza', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('seguridad')
    })
    initState(datos)
    setTema('light')
    setModelo(SEGUNDO_ID)
    setIdioma('en')
    expect(getState()).toEqual({
      modelo: SEGUNDO_ID,
      tema: 'light',
      lang: 'en',
    })
  })
})

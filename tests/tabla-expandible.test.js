import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initState, setModelo, setIdioma } from '../src/state.js'
import { renderTabla } from '../src/components/tabla.js'
import datos from '../src/data/benchmarks.json'

let contenedor, handle
beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  initState(datos)
})

afterEach(() => { handle?.cancelar(); contenedor.remove() })

function filaDe(id) {
  return [...contenedor.querySelectorAll('tbody tr')].find(
    (tr) => tr.querySelector('th')?.textContent.startsWith(id)
  )
}

const modelo = datos.modelos.find((m) => m.tareas.some((x) => x.id === 'T-103'))
const otro = datos.modelos.find((m) => m.id !== modelo.id)
const tareaDe = (id) => modelo.tareas.find((x) => x.id === id)
function setup() { handle = renderTabla(contenedor, datos); setModelo(modelo.id) }

describe('tabla expandible', () => {
  it('T-103: clic expande y muestra sus revisiones', () => {
    setup()
    const boton = filaDe('T-103').querySelector('.tabla__toggle')
    boton.click()
    expect(boton.getAttribute('aria-expanded')).toBe('true')
    const panel = document.getElementById('detalle-T-103')
    expect(panel.hidden).toBe(false)
    expect(panel.querySelectorAll('.tabla__revisiones li').length).toBe(tareaDe('T-103').revisiones.length)
  })

  it('FB-601: panel muestra sus revisiones y fallos', () => {
    setup()
    filaDe('FB-601').querySelector('.tabla__toggle').click()
    const panel = document.getElementById('detalle-FB-601')
    expect(panel.querySelectorAll('.tabla__revisiones li').length).toBe(tareaDe('FB-601').revisiones.length)
    expect(panel.querySelectorAll('.tabla__fallos li').length).toBe(tareaDe('FB-601').fallos.length)
  })

  it('T-101: sin boton ni panel', () => {
    setup()
    expect(filaDe('T-101').querySelector('.tabla__toggle')).toBeNull()
    expect(document.getElementById('detalle-T-101')).toBeNull()
  })

  it('segundo clic contrae', () => {
    setup()
    const boton = filaDe('T-103').querySelector('.tabla__toggle')
    boton.click()
    boton.click()
    expect(boton.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById('detalle-T-103').hidden).toBe(true)
  })

  it('sobrevive al idioma; al cambiar de modelo todo queda contraido', () => {
    setup()
    filaDe('T-103').querySelector('.tabla__toggle').click()
    setIdioma('en')
    expect(document.getElementById('detalle-T-103').hidden).toBe(false)
    setModelo(otro.id)
    for (const d of contenedor.querySelectorAll('.tabla__detalle')) expect(d.hidden).toBe(true)
  })
})

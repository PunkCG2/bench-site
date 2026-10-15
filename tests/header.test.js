import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initState, getState, setIdioma } from '../src/state.js'
import { getLang } from '../src/i18n/index.js'
import { renderHeader } from '../src/components/header.js'
import { renderFooter } from '../src/components/footer.js'
import datos from '../src/data/benchmarks.json'

const SEGUNDO_ID = datos.modelos[1].id

let contenedor
let cancelaciones = []

function montarHeader() {
  const handle = renderHeader(contenedor, datos)
  cancelaciones.push(handle.cancelar)
  return handle
}

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  initState(datos)
})

afterEach(() => {
  for (const cancelar of cancelaciones) cancelar()
  cancelaciones = []
  contenedor.remove()
})

describe('header', () => {
  it('hay un botón por modelo, con la etiqueta de los datos', () => {
    montarHeader()
    const grupo = contenedor.querySelector('.header__selector')
    expect(grupo.getAttribute('role')).toBe('group')
    expect(grupo.getAttribute('aria-label')).toBe('Elegir modelo')

    const botones = contenedor.querySelectorAll('.header__modelo')
    expect(botones.length).toBe(datos.modelos.length)
    expect([...botones].map((b) => b.textContent)).toEqual(
      datos.modelos.map((m) => m.etiqueta)
    )
  })

  it('el modelo activo lleva aria-pressed="true" y los demás "false"', () => {
    montarHeader()
    const [primero, segundo] = contenedor.querySelectorAll('.header__modelo')
    expect(primero.getAttribute('aria-pressed')).toBe('true')
    expect(segundo.getAttribute('aria-pressed')).toBe('false')
  })

  it('clic en un botón de modelo cambia el modelo en el estado', () => {
    montarHeader()
    const [primero, segundo] = contenedor.querySelectorAll('.header__modelo')
    segundo.click()
    expect(getState().modelo).toBe(SEGUNDO_ID)
    expect(primero.getAttribute('aria-pressed')).toBe('false')
    expect(segundo.getAttribute('aria-pressed')).toBe('true')
  })

  it('muestra el título y el subtítulo del idioma activo', () => {
    montarHeader()
    expect(contenedor.querySelector('.header__titulo-nombre').textContent).toBe(
      'Local + Claude'
    )
    expect(contenedor.querySelector('.header__titulo-sub').textContent).toBe(
      '¿Vale la pena delegar?'
    )
  })

  it('clic en el botón de idioma cambia el subtítulo a inglés', () => {
    montarHeader()
    const btn = contenedor.querySelector('.header__idioma')
    expect(btn.textContent).toBe('EN')
    expect(btn.getAttribute('aria-label')).toBe('Cambiar a inglés')

    btn.click()
    expect(getLang()).toBe('en')
    expect(contenedor.querySelector('.header__titulo-nombre').textContent).toBe(
      'Local + Claude'
    )
    expect(contenedor.querySelector('.header__titulo-sub').textContent).toBe(
      'Is delegating worth it?'
    )
    expect(btn.textContent).toBe('ES')
    expect(btn.getAttribute('aria-label')).toBe('Switch to Spanish')
  })

  it('clic en el botón de tema cambia data-theme', () => {
    montarHeader()
    const btn = contenedor.querySelector('.header__tema')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(btn.textContent).toBe('Claro')
    expect(btn.getAttribute('aria-label')).toBe('Cambiar a tema claro')

    btn.click()
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(btn.textContent).toBe('Oscuro')
    expect(btn.getAttribute('aria-label')).toBe('Cambiar a tema oscuro')
  })
})

describe('footer', () => {
  it('muestra la leyenda en español y en inglés', () => {
    const handle = renderFooter(contenedor)
    cancelaciones.push(handle.cancelar)
    const leyenda = contenedor.querySelector('.footer__leyenda')
    expect(leyenda.textContent).toBe('Hecho con Claude Code y SDD')

    setIdioma('en')
    expect(leyenda.textContent).toBe('Made with Claude Code and SDD')
  })
})

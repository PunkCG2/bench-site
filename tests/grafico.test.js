import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../src/lib/animate.js', () => ({
  onEnterViewport(el, cb) { cb() },
}))

import { initState, setModelo, setIdioma } from '../src/state.js'
import { t } from '../src/i18n/index.js'
import { renderGrafico } from '../src/components/grafico.js'
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

const MODOS = ['local', 'pareja', 'claude']
const items = () => [...contenedor.querySelectorAll('.grafico__item')]
const barras = (item) => [...item.querySelectorAll('.barra')]
const ancho = (barra) => parseFloat(barra.querySelector('.barra__relleno').style.width)

describe('grafico', () => {
  it('4 gráficos con 3 barras, cada una con su etiqueta de modo en texto', () => {
    handle = renderGrafico(contenedor, datos)
    expect(items().length).toBe(4)
    for (const item of items()) {
      expect(barras(item).length).toBe(3)
      expect(barras(item).map((b) => b.querySelector('.barra__etiqueta').textContent))
        .toEqual(MODOS.map((m) => t(`modo.${m}`)))
      expect(item.getAttribute('role')).toBe('img')
      expect(item.getAttribute('aria-label')).not.toBe('')
    }
  })

  it('la longitud de cada barra es proporcional al valor de los datos', () => {
    handle = renderGrafico(contenedor, datos)
    const r = datos.modelos[0].resumen
    // Velocidad: proporcional al máximo de los tres modos.
    const tiempos = MODOS.map((m) => r[m].tiempo_s)
    const max = Math.max(...tiempos)
    barras(items()[1]).forEach((b, i) => {
      expect(ancho(b)).toBeCloseTo((tiempos[i] / max) * 100, 5)
    })
    // Precisión: escala fija de 0 a 10.
    barras(items()[0]).forEach((b, i) => {
      expect(ancho(b)).toBeCloseTo((r[MODOS[i]].nota / 10) * 100, 5)
    })
  })

  it('costo null no dibuja barra y muestra —', () => {
    handle = renderGrafico(contenedor, datos)
    const local = barras(items()[3])[0]
    expect(local.classList.contains('barra--vacia')).toBe(true)
    expect(ancho(local)).toBe(0)
    expect(local.querySelector('.barra__valor').textContent).toContain('—')
    expect(local.querySelector('.barra__valor').textContent).toContain(t('grafico.sin_costo'))
  })

  it('valores iguales dan barras iguales (datos inventados)', () => {
    const modo = { nota: 10, tiempo_s: 5, tokens_claude: 7, costo_usd: 0.01 }
    const inventado = { modelos: [{ id: 'x', etiqueta: 'X', resumen: { local: modo, pareja: modo, claude: modo } }] }
    initState(inventado)
    handle = renderGrafico(contenedor, inventado)
    for (const item of items()) {
      const anchos = barras(item).map(ancho)
      expect(new Set(anchos).size).toBe(1)
      expect(anchos[0]).toBe(100)
    }
  })

  it('cambia con el modelo y con el idioma', () => {
    handle = renderGrafico(contenedor, datos)
    const antes = barras(items()[1]).map((b) => b.querySelector('.barra__valor').textContent)
    setModelo(datos.modelos[1].id)
    const despues = barras(items()[1]).map((b) => b.querySelector('.barra__valor').textContent)
    expect(despues).not.toEqual(antes)
    const titulo = contenedor.querySelector('h2').textContent
    setIdioma('en')
    expect(contenedor.querySelector('h2').textContent).not.toBe(titulo)
  })
})

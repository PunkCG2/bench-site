import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initState, setModelo, setIdioma } from '../src/state.js'
import { renderHallazgos, elegirVariantes } from '../src/components/hallazgos.js'
import { reduccionTokens } from '../src/lib/metrics.js'
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

const r = (x) => ({ ...x, costo_usd: null })
const mk = (local, pareja, claude, tareas) => ({
  id: 'x', etiqueta: 'X', revisor: 'haiku',
  resumen: { local: r(local), pareja: r(pareja), claude: r(claude) },
  tareas,
})

describe('hallazgos', () => {
  it('cada modelo: 4 hallazgos sin { y el primero con |reduccionTokens|', () => {
    handle = renderHallazgos(contenedor, datos)
    for (const modelo of datos.modelos) {
      setModelo(modelo.id)
      const items = [...contenedor.querySelectorAll('.hallazgo')]
      expect(items.length).toBe(4)
      for (const li of items) {
        expect(li.textContent.trim()).not.toBe('')
        expect(li.textContent).not.toContain('{')
      }
      expect(items[0].textContent).toContain(String(Math.abs(reduccionTokens(modelo))))
    }
  })

  it('elegirVariantes elige la clave por los datos', () => {
    const b = { nota: 8, tiempo_s: 100, tokens_claude: 100 }
    const t = [{ id: 'A', local: 5 }, { id: 'B', local: 5 }]
    expect(elegirVariantes(mk(b, { ...b, tokens_claude: 200 }, b, t)).tokens).toBe('hallazgos.tokens.mas')
    expect(elegirVariantes(mk(b, { ...b, tiempo_s: 100 }, b, t)).tiempo).toBe('hallazgos.tiempo.igual')
    expect(elegirVariantes(mk(b, { ...b, tiempo_s: 40 }, b, t)).tiempo).toBe('hallazgos.tiempo.mas_rapida')
    expect(elegirVariantes(mk(b, { ...b, nota: 8 }, b, t)).revision).toBe('hallazgos.revision.igual')
    expect(elegirVariantes(mk(b, { ...b, nota: 7 }, b, t)).revision).toBe('hallazgos.revision.empeora')
    expect(elegirVariantes(mk(b, b, b, t)).nota).toBe('hallazgos.nota.uniforme')
    expect(elegirVariantes(mk(b, b, b, [{ id: 'A', local: 5 }, { id: 'B', local: 5 }, { id: 'C', local: 9 }])).nota).toBe('hallazgos.nota.varias')
  })

  it('cambiar de modelo cambia el texto de algún hallazgo', () => {
    handle = renderHallazgos(contenedor, datos)
    const [a, b] = datos.modelos
    setModelo(a.id)
    const antes = [...contenedor.querySelectorAll('.hallazgo')].map((li) => li.textContent)
    setModelo(b.id)
    const despues = [...contenedor.querySelectorAll('.hallazgo')].map((li) => li.textContent)
    expect(despues.some((txt, i) => txt !== antes[i])).toBe(true)
  })

  it('en inglés el hallazgo de tokens cambia y la metodología usa revisor y nº de tareas', () => {
    handle = renderHallazgos(contenedor, datos)
    const modelo = datos.modelos[0]
    setModelo(modelo.id)
    const es = contenedor.querySelectorAll('.hallazgo')[0].textContent
    setIdioma('en')
    const en = contenedor.querySelectorAll('.hallazgo')[0].textContent
    expect(en).not.toBe(es)
    const metodo = contenedor.querySelector('.metodologia__texto').textContent
    expect(metodo).toContain('Haiku')
    expect(metodo).toContain(String(modelo.tareas.length))
  })
})

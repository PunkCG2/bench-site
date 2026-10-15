import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../src/lib/animate.js', () => ({
  animateNumber(el, v, o) { el.textContent = o.formato ? o.formato(v) : String(v) },
  onEnterViewport(el, cb) { cb() },
  revealStagger() {},
}))

import { initState, setModelo } from '../src/state.js'
import { t } from '../src/i18n/index.js'
import { diferenciaNota } from '../src/lib/metrics.js'
import { renderColumnas } from '../src/components/columnas.js'
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

describe('columnas', () => {
  it('tres columnas en orden, cada una con 4 tarjetas', () => {
    handle = renderColumnas(contenedor, datos)
    const cols = [...contenedor.querySelectorAll('.columna')]
    expect(cols.map((c) => c.dataset.modo)).toEqual(['local', 'pareja', 'claude'])
    for (const col of cols) expect(col.querySelectorAll('.tarjeta').length).toBe(4)
  })
  it('el valor de precisión es la nota del modelo activo con toFixed(1)', () => {
    handle = renderColumnas(contenedor, datos)
    const m = datos.modelos[0]
    for (const modo of ['local', 'pareja', 'claude']) {
      const valor = contenedor.querySelector(`.columna[data-modo="${modo}"] .tarjeta .tarjeta__valor`)
      expect(valor.textContent).toBe(m.resumen[modo].nota.toFixed(1))
    }
  })
  it('la columna local de Gemma muestra costo —', () => {
    handle = renderColumnas(contenedor, datos)
    setModelo(datos.modelos.find((m) => m.id === 'google/gemma-4-26b-a4b-qat@Q4_0').id)
    const costo = contenedor.querySelector('.columna[data-modo="local"]').querySelectorAll('.tarjeta')[3].querySelector('.tarjeta__valor')
    expect(costo.textContent).toBe('—')
  })
  it('la diferencia de precisión de pareja coincide con diferenciaNota', () => {
    handle = renderColumnas(contenedor, datos)
    const m = datos.modelos[0]
    const d = diferenciaNota(m.resumen.pareja.nota, m.resumen.claude.nota)
    const diff = contenedor.querySelector('.columna[data-modo="pareja"] .tarjeta .tarjeta__diff')
    if (d.tipo === 'igual') expect(diff.textContent).toBe(t('columnas.sin_diferencia'))
    else expect(diff.textContent).toContain(String(d.valor))
  })
  it('con un modelo inventado de nota 10 en los tres modos, pareja dice sin diferencia', () => {
    const r = {
      local: { nota: 10, tiempo_s: 1, tokens_claude: 1, costo_usd: null },
      pareja: { nota: 10, tiempo_s: 2, tokens_claude: 2, costo_usd: null },
      claude: { nota: 10, tiempo_s: 3, tokens_claude: 3, costo_usd: null },
    }
    const datosInventados = { modelos: [{ id: 'x', etiqueta: 'X', resumen: r }] }
    initState(datosInventados)
    handle = renderColumnas(contenedor, datosInventados)
    const diff = contenedor.querySelector('.columna[data-modo="pareja"] .tarjeta .tarjeta__diff')
    expect(diff.textContent).toBe(t('columnas.sin_diferencia'))
  })
  it('setModelo al segundo modelo cambia la precisión de la columna claude', () => {
    handle = renderColumnas(contenedor, datos)
    const [m1, m2] = datos.modelos
    const valor = contenedor.querySelector('.columna[data-modo="claude"] .tarjeta .tarjeta__valor')
    expect(valor.textContent).toBe(m1.resumen.claude.nota.toFixed(1))
    setModelo(m2.id)
    expect(valor.textContent).toBe(m2.resumen.claude.nota.toFixed(1))
  })
  it('hay exactamente un .columnas__nota', () => {
    handle = renderColumnas(contenedor, datos)
    expect(contenedor.querySelectorAll('.columnas__nota').length).toBe(1)
  })
})

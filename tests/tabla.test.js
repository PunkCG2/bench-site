import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { initState, setModelo, setIdioma } from '../src/state.js'
import { t } from '../src/i18n/index.js'
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

describe('tabla', () => {
  it('Gemma: 13 filas de tarea y 7 filas de grupo', () => {
    handle = renderTabla(contenedor, datos)
    setModelo(datos.modelos.find((m) => m.id === 'gemma-4-26b-a4b-qat').id)
    expect(contenedor.querySelectorAll('tbody tr:not(.tabla__grupo):not(.tabla__detalle)').length).toBe(13)
    expect(contenedor.querySelectorAll('.tabla__grupo').length).toBe(7)
  })

  it('el primer grupo usa el ambito de la primera tarea y cambia con el idioma', () => {
    handle = renderTabla(contenedor, datos)
    const modelo = datos.modelos.find((m) => m.id === 'gemma-4-26b-a4b-qat')
    const grupo = contenedor.querySelector('.tabla__grupo th')
    expect(grupo.textContent).toBe(t('tabla.ambito.' + modelo.tareas[0].ambito))
    setIdioma('en')
    expect(grupo.textContent).toBe(t('tabla.ambito.' + modelo.tareas[0].ambito))
  })

  it('la fila de NET-501 (Qwen) muestra la nota local con nota--baja', () => {
    handle = renderTabla(contenedor, datos)
    const qwen = datos.modelos.find((m) => m.id === 'qwen3.8-27b')
    setModelo(qwen.id)
    const tarea = qwen.tareas.find((ta) => ta.id === 'NET-501')
    const celda = filaDe('NET-501').children[1]
    expect(celda.textContent).toBe(tarea.local.toFixed(1))
    expect(celda.classList.contains('nota--baja')).toBe(true)
  })

  it('FB-601 (Gemma) tiene .tabla__fallo y T-101 no', () => {
    handle = renderTabla(contenedor, datos)
    setModelo(datos.modelos.find((m) => m.id === 'gemma-4-26b-a4b-qat').id)
    const fallo = filaDe('FB-601').querySelector('.tabla__fallo')
    expect(fallo.getAttribute('aria-label')).toBe(t('tabla.fallo'))
    expect(filaDe('T-101').querySelector('.tabla__fallo')).toBeNull()
  })

  it('el thead tiene un th scope="col" por columna (7)', () => {
    handle = renderTabla(contenedor, datos)
    expect(contenedor.querySelectorAll('thead th[scope="col"]').length).toBe(7)
  })
})

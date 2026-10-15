import { describe, it, expect } from 'vitest'
import data from '../src/data/benchmarks.json'
import {
  diferencia,
  diferenciaNota,
  reduccionTokens,
  factorTiempo,
  notaMasBaja,
  cambioPorRevision,
} from '../src/lib/metrics.js'

const gemma = data.modelos.find((m) => m.etiqueta === 'Gemma')
const qwen = data.modelos.find((m) => m.etiqueta === 'Qwen')

function modeloTodoDiez() {
  return {
    resumen: {
      local: { nota: 10, tiempo_s: 100, tokens_claude: 0, costo_usd: null },
      pareja: { nota: 10, tiempo_s: 100, tokens_claude: 100, costo_usd: 0 },
      claude: { nota: 10, tiempo_s: 100, tokens_claude: 100, costo_usd: 0 },
    },
    tareas: [
      { id: 'A-1', local: 10, pareja: 10, claude: 10 },
      { id: 'B-2', local: 10, pareja: 10, claude: 10 },
    ],
  }
}

describe('con benchmarks.json real', () => {
  it('reduccionTokens: 73 para Gemma y 78 para Qwen', () => {
    expect(reduccionTokens(gemma)).toBe(73)
    expect(reduccionTokens(qwen)).toBe(78)
  })

  it('factorTiempo: 9 para Gemma y 7 para Qwen', () => {
    expect(factorTiempo(gemma)).toBe(9)
    expect(factorTiempo(qwen)).toBe(7)
  })

  it('notaMasBaja de Qwen: nota 4.2 con ids [NET-501]', () => {
    expect(notaMasBaja(qwen)).toEqual({ nota: 4.2, ids: ['NET-501'] })
  })

  it('cambioPorRevision: mejora para Gemma, empeora para Qwen', () => {
    expect(cambioPorRevision(gemma).tipo).toBe('mejora')
    expect(cambioPorRevision(qwen).tipo).toBe('empeora')
  })
})

describe('con datos mínimos inventados', () => {
  it('todas las notas 10: uniforme, igual y diferenciaNota igual', () => {
    const m = modeloTodoDiez()
    expect(notaMasBaja(m)).toEqual({ nota: 10, ids: ['A-1', 'B-2'], uniforme: true })
    expect(cambioPorRevision(m).tipo).toBe('igual')
    expect(diferenciaNota(10, 10)).toEqual({ tipo: 'igual', valor: 0 })
  })

  it('diferencia con referencia 0 devuelve valor null', () => {
    expect(diferencia(5, 0)).toEqual({ tipo: 'mas', valor: null })
  })

  it('diferencia con valor o referencia null devuelve null', () => {
    expect(diferencia(null, 10)).toBeNull()
    expect(diferencia(10, null)).toBeNull()
    expect(diferenciaNota(null, 10)).toBeNull()
  })

  it('empate en la nota más baja devuelve todos los ids', () => {
    const m = {
      tareas: [
        { id: 'A-1', local: 5 },
        { id: 'B-2', local: 5 },
        { id: 'C-3', local: 9 },
      ],
    }
    expect(notaMasBaja(m)).toEqual({ nota: 5, ids: ['A-1', 'B-2'] })
  })

  it('diferencia(0, 88790) da menos con 100', () => {
    expect(diferencia(0, 88790)).toEqual({ tipo: 'menos', valor: 100 })
  })
})

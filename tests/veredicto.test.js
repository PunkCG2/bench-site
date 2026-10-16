import { describe, it, expect } from 'vitest'
import data from '../src/data/benchmarks.json'
import { veredicto, UMBRALES } from '../src/lib/veredicto.js'

// Modelo mínimo: solo resumen.pareja y resumen.claude.
function modelo({ pareja = {}, claude = {} } = {}) {
  return {
    resumen: {
      pareja: { nota: 10, tiempo_s: 100, tokens_claude: 100, costo_usd: 0.01, ...pareja },
      claude: { nota: 10, tiempo_s: 100, tokens_claude: 100, costo_usd: 0.01, ...claude },
    },
  }
}

describe('UMBRALES', () => {
  it('tiene los cuatro ejes con bien y reservas', () => {
    expect(UMBRALES).toEqual({
      calidad: { bien: 0.5, reservas: 2 },
      ahorro: { bien: 50, reservas: 20 },
      costo: { bien: 30, reservas: 15 },
      tiempo: { bien: 6, reservas: 15 },
    })
  })
})

describe('calidad', () => {
  it('dif 0.5 (límite) es bien', () => {
    const v = veredicto(modelo({ pareja: { nota: 9.5 }, claude: { nota: 10 } }))
    expect(v.calidad).toEqual({ nivel: 'bien', dif: 0.5 })
  })

  it('dif 2 (límite) es reservas', () => {
    const v = veredicto(modelo({ pareja: { nota: 8 }, claude: { nota: 10 } }))
    expect(v.calidad).toEqual({ nivel: 'reservas', dif: 2 })
  })

  it('dif 2.1 es mal', () => {
    const v = veredicto(modelo({ pareja: { nota: 7.9 }, claude: { nota: 10 } }))
    expect(v.calidad).toEqual({ nivel: 'mal', dif: 2.1 })
  })

  it('dif negativa es bien', () => {
    const v = veredicto(modelo({ pareja: { nota: 10 }, claude: { nota: 9.5 } }))
    expect(v.calidad).toEqual({ nivel: 'bien', dif: -0.5 })
  })
})

describe('ahorro', () => {
  it('pct 50 (límite) es bien', () => {
    const v = veredicto(modelo({ pareja: { tokens_claude: 50 }, claude: { tokens_claude: 100 } }))
    expect(v.ahorro).toEqual({ nivel: 'bien', pct: 50 })
  })

  it('pct 20 (límite) es reservas', () => {
    const v = veredicto(modelo({ pareja: { tokens_claude: 80 }, claude: { tokens_claude: 100 } }))
    expect(v.ahorro).toEqual({ nivel: 'reservas', pct: 20 })
  })

  it('pct 10 es mal', () => {
    const v = veredicto(modelo({ pareja: { tokens_claude: 90 }, claude: { tokens_claude: 100 } }))
    expect(v.ahorro).toEqual({ nivel: 'mal', pct: 10 })
  })
})

describe('costo', () => {
  it('pct 30 (límite) es bien', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: 0.7 }, claude: { costo_usd: 1 } }))
    expect(v.costo).toEqual({ nivel: 'bien', pct: 30 })
  })

  it('pct 15 (límite) es reservas', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: 0.85 }, claude: { costo_usd: 1 } }))
    expect(v.costo).toEqual({ nivel: 'reservas', pct: 15 })
  })

  it('pct 5 es mal', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: 0.95 }, claude: { costo_usd: 1 } }))
    expect(v.costo).toEqual({ nivel: 'mal', pct: 5 })
  })

  it('pct negativo es mal', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: 1.2 }, claude: { costo_usd: 1 } }))
    expect(v.costo).toEqual({ nivel: 'mal', pct: -20 })
  })

  it('pareja.costo_usd null: nivel y pct null', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: null }, claude: { costo_usd: 1 } }))
    expect(v.costo).toEqual({ nivel: null, pct: null })
  })

  it('claude.costo_usd null: nivel y pct null', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: 0.5 }, claude: { costo_usd: null } }))
    expect(v.costo).toEqual({ nivel: null, pct: null })
  })

  it('claude.costo_usd 0: nivel y pct null', () => {
    const v = veredicto(modelo({ pareja: { costo_usd: 0.5 }, claude: { costo_usd: 0 } }))
    expect(v.costo).toEqual({ nivel: null, pct: null })
  })
})

describe('tiempo', () => {
  it('factor 6 (límite) es bien', () => {
    const v = veredicto(modelo({ pareja: { tiempo_s: 600 }, claude: { tiempo_s: 100 } }))
    expect(v.tiempo).toEqual({ nivel: 'bien', factor: 6 })
  })

  it('factor 15 (límite) es reservas', () => {
    const v = veredicto(modelo({ pareja: { tiempo_s: 1500 }, claude: { tiempo_s: 100 } }))
    expect(v.tiempo).toEqual({ nivel: 'reservas', factor: 15 })
  })

  it('factor 16 es mal', () => {
    const v = veredicto(modelo({ pareja: { tiempo_s: 1600 }, claude: { tiempo_s: 100 } }))
    expect(v.tiempo).toEqual({ nivel: 'mal', factor: 16 })
  })
})

describe('conclusion', () => {
  it('calidad mal: no', () => {
    const v = veredicto(modelo({ pareja: { nota: 7.9 }, claude: { nota: 10 } }))
    expect(v.conclusion).toBe('no')
  })

  it('ahorro mal: no', () => {
    const v = veredicto(modelo({ pareja: { tokens_claude: 90 }, claude: { tokens_claude: 100 } }))
    expect(v.conclusion).toBe('no')
  })

  it('calidad y ahorro bien, tiempo y costo no mal: si', () => {
    const v = veredicto(
      modelo({
        pareja: { nota: 10, tokens_claude: 50, tiempo_s: 100, costo_usd: 0.7 },
        claude: { nota: 10, tokens_claude: 100, tiempo_s: 100, costo_usd: 1 },
      }),
    )
    expect(v.conclusion).toBe('si')
  })

  it('calidad y ahorro bien pero tiempo mal: depende', () => {
    const v = veredicto(
      modelo({
        pareja: { nota: 10, tokens_claude: 50, tiempo_s: 1600, costo_usd: 0.7 },
        claude: { nota: 10, tokens_claude: 100, tiempo_s: 100, costo_usd: 1 },
      }),
    )
    expect(v.conclusion).toBe('depende')
  })

  it('calidad reservas: depende', () => {
    const v = veredicto(
      modelo({
        pareja: { nota: 8, tokens_claude: 50, tiempo_s: 100, costo_usd: 0.7 },
        claude: { nota: 10, tokens_claude: 100, tiempo_s: 100, costo_usd: 1 },
      }),
    )
    expect(v.conclusion).toBe('depende')
  })

  it('costo null no cuenta como mal: si', () => {
    const v = veredicto(
      modelo({
        pareja: { nota: 10, tokens_claude: 50, tiempo_s: 100, costo_usd: null },
        claude: { nota: 10, tokens_claude: 100, tiempo_s: 100, costo_usd: 1 },
      }),
    )
    expect(v.costo).toEqual({ nivel: null, pct: null })
    expect(v.conclusion).toBe('si')
  })
})

describe('con benchmarks.json real', () => {
  it('la conclusión es una de las tres para todos los modelos', () => {
    for (const m of data.modelos) {
      const v = veredicto(m)
      expect(['si', 'depende', 'no']).toContain(v.conclusion)
    }
  })
})

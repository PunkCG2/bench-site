import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseReport } from '../scripts/parse-report.js'
import { diccionarios } from '../src/i18n/index.js'

const rawDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'raw')
const gemma = parseReport(
  readFileSync(join(rawDir, 'calificacion_pareja_google_gemma-4-26b-a4b-qat_haiku_20261015-0229.txt'), 'utf8')
)
const qwen = parseReport(
  readFileSync(join(rawDir, 'calificacion_pareja_qwen3.8-27b_haiku_20261015-0014.txt'), 'utf8')
)

function tarea(modelo, id) {
  return modelo.tareas.find((t) => t.id === id)
}

describe('parseReport — Gemma', () => {
  it('identidad del modelo', () => {
    expect(gemma.id).toBe('google/gemma-4-26b-a4b-qat@Q4_0')
    expect(gemma.nombre).toBe('gemma-4-26b-a4b-qat')
    expect(gemma.etiqueta).toBe('gemma-4-26b-a4b-qat')
    expect(gemma.cuantizacion).toBe('Q4_0')
  })

  it('devuelve 13 tareas', () => {
    expect(gemma.tareas).toHaveLength(13)
  })

  it('resumen: tokens pareja, costo local null y revision', () => {
    expect(gemma.resumen.pareja.tokens_claude).toBe(23786)
    expect(gemma.resumen.local.costo_usd).toBeNull()
    expect(gemma.resumen.revision).toEqual({ mejoro: 4, empeoro: 0, aprobadas_primera: 3 })
  })

  it('T-103 tiene 2 revisiones', () => {
    expect(tarea(gemma, 'T-103').revisiones).toHaveLength(2)
  })

  it('UE-302 tiene ambito unreal y local 3.1', () => {
    const t = tarea(gemma, 'UE-302')
    expect(t.ambito).toBe('unreal')
    expect(t.local).toBe(3.1)
  })

  it('FB-601 tiene 5 revisiones y 1 fallo con quien pareja', () => {
    const t = tarea(gemma, 'FB-601')
    expect(t.revisiones).toHaveLength(5)
    expect(t.fallos).toHaveLength(1)
    expect(t.fallos[0].quien).toBe('pareja')
  })

  it('W-202 tiene 1 fallo con quien claude', () => {
    const t = tarea(gemma, 'W-202')
    expect(t.fallos).toHaveLength(1)
    expect(t.fallos[0].quien).toBe('claude')
  })

  it('ningún campo de identidad contiene "Qwen" (el bug de la etiqueta no se propaga)', () => {
    const ident = { id: gemma.id, nombre: gemma.nombre, etiqueta: gemma.etiqueta }
    expect(JSON.stringify(ident).includes('Qwen')).toBe(false)
  })
})

describe('parseReport — Qwen', () => {
  it('identidad del modelo', () => {
    expect(qwen.id).toBe('qwen3.8-27b@IQ3_XXS')
    expect(qwen.nombre).toBe('qwen3.8-27b')
    expect(qwen.etiqueta).toBe('qwen3.8-27b')
    expect(qwen.cuantizacion).toBe('IQ3_XXS')
  })

  it('devuelve 13 tareas', () => {
    expect(qwen.tareas).toHaveLength(13)
  })

  it('resumen.pareja.nota es 9.5', () => {
    expect(qwen.resumen.pareja.nota).toBe(9.5)
  })

  it('NET-501 con local 4.2 y pareja 3.2', () => {
    const t = tarea(qwen, 'NET-501')
    expect(t.local).toBe(4.2)
    expect(t.pareja).toBe(3.2)
  })

  it('ninguna tarea con fallos', () => {
    for (const t of qwen.tareas) {
      expect(t.fallos).toHaveLength(0)
    }
  })
})

describe('parseReport — errores', () => {
  it('un texto sin cabecera lanza un error', () => {
    expect(() => parseReport('esto no es un reporte')).toThrow()
  })
})

describe('parseReport — ámbito desconocido', () => {
  const texto = readFileSync(
    join(rawDir, 'calificacion_pareja_qwen3.8-27b_haiku_20261015-0014.txt'),
    'utf8'
  ).replace(/^(\s*)T-101(\s)/m, '$1XYZ-901$2')

  it('una tarea con prefijo nuevo cae en "otro" y las demás conservan su ámbito', () => {
    const m = parseReport(texto)
    expect(m.tareas.find((x) => x.id === 'XYZ-901').ambito).toBe('otro')
    expect(m.tareas.find((x) => x.id === 'T-102').ambito).toBe('unity')
  })

  it('"otro" y todos los ámbitos conocidos tienen texto en es y en', () => {
    const ambitos = ['unity', 'web', 'cpp', 'unreal', 'rust', 'dotnet', 'firebase', 'otro']
    for (const lang of ['es', 'en']) {
      for (const a of ambitos) {
        expect(diccionarios[lang][`tabla.ambito.${a}`], `${lang} ${a}`).toBeTruthy()
      }
    }
  })
})

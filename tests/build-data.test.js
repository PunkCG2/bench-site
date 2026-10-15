import { describe, it, expect, afterAll } from 'vitest'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildData } from '../scripts/build-data.js'
import { parseReport } from '../scripts/parse-report.js'

const rawDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'raw')
const qwenFile = 'calificacion_pareja_qwen3.8-27b_haiku_20261015-0014.txt'
const qwenTexto = readFileSync(join(rawDir, qwenFile), 'utf8')

const tmpDirs = []
afterAll(() => {
  for (const d of tmpDirs) rmSync(d, { recursive: true, force: true })
})

function dirTmp() {
  const d = mkdtempSync(join(tmpdir(), 'bench-data-'))
  tmpDirs.push(d)
  return d
}

function escribe(dir, nombre, texto) {
  writeFileSync(join(dir, nombre), texto)
}

describe('buildData', () => {
  it('devuelve 2 modelos con 13 tareas cada uno', () => {
    const data = buildData(rawDir)
    expect(data.version).toBe(1)
    expect(data.modelos).toHaveLength(2)
    for (const m of data.modelos) {
      expect(m.tareas).toHaveLength(13)
    }
  })

  it('un reporte nuevo aparece sin cambios de código', () => {
    const dir = dirTmp()
    escribe(dir, 'otro_nombre.txt', qwenTexto)
    const data = buildData(dir)
    expect(data.modelos).toEqual([parseReport(qwenTexto)])
  })

  it('dos archivos con el mismo modelo lanzan error que nombra ambos', () => {
    const dir = dirTmp()
    escribe(dir, 'uno.txt', qwenTexto)
    escribe(dir, 'dos.txt', qwenTexto)
    expect(() => buildData(dir)).toThrow(/uno\.txt/)
    expect(() => buildData(dir)).toThrow(/dos\.txt/)
  })

  it('dos reportes con la misma etiqueta terminan con etiquetas distintas', () => {
    const dir = dirTmp()
    const otroNombre = qwenTexto
      .split(/\r?\n/)
      .map((l) =>
        l.includes('Modelo local:')
          ? '  Modelo local:  qwen3.8-32b (IQ3_XXS)'
          : l
      )
      .join('\n')
    escribe(dir, 'a.txt', qwenTexto)
    escribe(dir, 'b.txt', otroNombre)
    const data = buildData(dir)
    const etiquetas = data.modelos.map((m) => m.etiqueta)
    expect(new Set(etiquetas).size).toBe(2)
    expect(etiquetas).toContain('qwen3.8-27b')
    expect(etiquetas).toContain('qwen3.8-32b')
  })

  it('el JSON del repo coincide con buildData', () => {
    const data = buildData(rawDir)
    const raw = readFileSync(join(rawDir, '..', '..', 'src', 'data', 'benchmarks.json'), 'utf8')
    expect(JSON.parse(raw)).toEqual(data)
    expect(raw).toBe(JSON.stringify(data, null, 2) + '\n')
  })
})

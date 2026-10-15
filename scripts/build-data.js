// build-data.js
// Lee todos los data/raw/*.txt, los pasa por parseReport y escribe
// src/data/benchmarks.json. Salida determinista: sin fechas de generación,
// modelos ordenados por id.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseReport } from './parse-report.js'

// La etiqueta del selector es el nombre del modelo. Si el mismo modelo aparece
// en dos reportes (por ejemplo con otra cuantización), las etiquetas que chocan
// llevan la cuantización entre paréntesis para que no se repitan.
function resolverEtiquetas(modelos) {
  const porEtiqueta = new Map()
  for (const m of modelos) {
    const lista = porEtiqueta.get(m.etiqueta) || []
    lista.push(m)
    porEtiqueta.set(m.etiqueta, lista)
  }
  for (const lista of porEtiqueta.values()) {
    if (lista.length > 1) {
      for (const m of lista) m.etiqueta = `${m.nombre} (${m.cuantizacion})`
    }
  }
}

export function buildData(rawDir) {
  const archivos = readdirSync(rawDir)
    .filter((f) => f.endsWith('.txt'))
    .sort()

  const modelos = []
  const archivoPorId = new Map()
  for (const f of archivos) {
    const texto = readFileSync(join(rawDir, f), 'utf8')
    const modelo = parseReport(texto)
    if (archivoPorId.has(modelo.id)) {
      throw new Error(
        `dos reportes con el mismo id de modelo "${modelo.id}": ${archivoPorId.get(modelo.id)} y ${f}`
      )
    }
    archivoPorId.set(modelo.id, f)
    modelos.push(modelo)
  }

  modelos.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  resolverEtiquetas(modelos)

  return { version: 1, modelos }
}

// Como script: node scripts/build-data.js
const esScript =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (esScript) {
  const data = buildData('data/raw')
  const out = join('src', 'data', 'benchmarks.json')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(data, null, 2) + '\n')
}

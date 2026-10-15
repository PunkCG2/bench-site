// parse-report.js
// Función pura: convierte el texto de un reporte de data/raw/*.txt en un objeto de modelo.
// Sin dependencias.

const AMBITOS = {
  T: 'unity',
  W: 'web',
  CPP: 'cpp',
  UE: 'unreal',
  RS: 'rust',
  NET: 'dotnet',
  FB: 'firebase',
}

function ambitoDe(id) {
  const pref = id.split('-')[0]
  return AMBITOS[pref] || 'otro'
}

// "23,786" -> 23786 ; "0" -> 0
function parseNumero(s) {
  return parseInt(s.replace(/,/g, ''), 10)
}

// "0.005$" -> 0.005 ; "—" -> null
function parseCosto(s) {
  if (s === '—' || s === '-') return null
  return parseFloat(s.replace('$', ''))
}

// Primera palabra alfabética de `nombre`, con inicial mayúscula.
function etiquetaDe(nombre) {
  const m = nombre.match(/[a-zA-Z]+/)
  const palabra = m ? m[0] : nombre
  return palabra.charAt(0).toUpperCase() + palabra.slice(1)
}

// Una fila de RESUMEN: [etiqueta]  nota  tiempo  tokens  costo
// Se lee de derecha a izquierda porque cada campo tiene formato propio.
function parseFilaResumen(l) {
  let rest = l.trim()

  const mCosto = rest.match(/(\d+\.\d+\$|—)\s*$/)
  const costo = mCosto ? parseCosto(mCosto[1]) : null
  rest = rest.slice(0, mCosto.index).trim()

  const mTok = rest.match(/(\d{1,3}(?:,\d{3})+|\d+)\s*$/)
  const tokens_claude = parseNumero(mTok[1])
  rest = rest.slice(0, mTok.index).trim()

  const mTiempo = rest.match(/(\d+)\s*s\s*$/)
  const tiempo_s = parseInt(mTiempo[1], 10)
  rest = rest.slice(0, mTiempo.index).trim()

  const mNota = rest.match(/(\d+\.\d+)\s*$/)
  const nota = parseFloat(mNota[1])

  return { nota, tiempo_s, tokens_claude, costo_usd: costo }
}

export function parseReport(texto) {
  const lineas = texto.split(/\r?\n/)

  // ---- Cabecera ----
  const lineaModelo = lineas.find((l) => /Modelo local:/.test(l))
  const lineaRevisor = lineas.find((l) => /Revisor:/.test(l))
  const lineaFecha = lineas.find((l) => /Fecha:/.test(l))
  if (!lineaModelo || !lineaRevisor || !lineaFecha) {
    throw new Error('falta la cabecera del reporte')
  }

  // Modelo local:  google/gemma-4-26b-a4b-qat (Q4_0)
  const mModelo = lineaModelo.match(/Modelo local:\s*(\S+)\s*\((\S+)\)/)
  const cuantizacion = mModelo[2]
  const id = mModelo[1].split('/').pop()
  const nombre = id
  const etiqueta = etiquetaDe(nombre)

  // Revisor:       Claude haiku (...)
  const mRevisor = lineaRevisor.match(/Revisor:\s*Claude\s+(\S+)/)
  const revisor = mRevisor[1].toLowerCase()

  // Fecha:         2026-10-15 02:29    Benchmark: v1    Tareas: 13
  const mFecha = lineaFecha.match(/Fecha:\s*([\d-]+\s+[\d:]+)/)
  const fecha = mFecha[1]
  const mVersion = lineaFecha.match(/Benchmark:\s*(\S+)/)
  const version = mVersion[1]

  // ---- RESUMEN ----
  const idxResumen = lineas.findIndex((l) => /^\s*RESUMEN\s*$/.test(l))
  if (idxResumen === -1) throw new Error('falta la sección RESUMEN')

  let idxColHeader = -1
  for (let i = idxResumen + 1; i < lineas.length; i++) {
    if (/tiempo\/tarea/.test(lineas[i])) {
      idxColHeader = i
      break
    }
  }
  const filasResumen = []
  for (let i = idxColHeader + 1; i < lineas.length && filasResumen.length < 3; i++) {
    if (lineas[i].trim() === '') continue
    filasResumen.push(lineas[i])
  }
  if (filasResumen.length < 3) throw new Error('falta la sección RESUMEN')

  // Las filas se identifican por posición (local, pareja, claude), no por etiqueta.
  const resumen = {
    local: parseFilaResumen(filasResumen[0]),
    pareja: parseFilaResumen(filasResumen[1]),
    claude: parseFilaResumen(filasResumen[2]),
  }

  // La revisión mejoró N tarea(s), empeoró M y K quedaron aprobadas en la primera revisión.
  const lineaRevision = lineas.find((l) => /La revisión mejoró/.test(l))
  const mRev = lineaRevision.match(/mejoró (\d+) tarea\(s\), empeoró (\d+) y (\d+) quedaron/)
  resumen.revision = {
    mejoro: parseInt(mRev[1], 10),
    empeoro: parseInt(mRev[2], 10),
    aprobadas_primera: parseInt(mRev[3], 10),
  }

  // ---- DETALLE POR TAREA ----
  const idxDetalle = lineas.findIndex((l) => /^\s*DETALLE POR TAREA\s*$/.test(l))
  if (idxDetalle === -1) throw new Error('falta la sección DETALLE POR TAREA')

  const tareas = []
  let actual = null
  for (let i = idxDetalle + 1; i < lineas.length; i++) {
    const l = lineas[i]

    // id  local  pareja  rondas  tokens_pareja  claude  tokens_claude
    const mTarea = l.match(
      /^\s*([A-Z]+-\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+)\s+(\d{1,3}(?:,\d{3})+|\d+)\s+(\d+\.\d+)\s+(\d{1,3}(?:,\d{3})+|\d+)\s*$/
    )
    if (mTarea) {
      actual = {
        id: mTarea[1],
        ambito: ambitoDe(mTarea[1]),
        local: parseFloat(mTarea[2]),
        pareja: parseFloat(mTarea[3]),
        rondas: parseInt(mTarea[4], 10),
        tokens_pareja: parseNumero(mTarea[5]),
        claude: parseFloat(mTarea[6]),
        tokens_claude: parseNumero(mTarea[7]),
        revisiones: [],
        fallos: [],
      }
      tareas.push(actual)
      continue
    }

    // · revisión N: [archivo] texto
    const mRev = l.match(/^\s*·\s*revisión (\d+):\s*\[([^\]]+)\]\s*(.*)$/)
    if (mRev && actual) {
      actual.revisiones.push({
        ronda: parseInt(mRev[1], 10),
        archivo: mRev[2],
        texto: mRev[3].trim(),
      })
      continue
    }

    // ✗ texto
    const mFal = l.match(/^\s*✗\s*(.*)$/)
    if (mFal && actual) {
      const texto = mFal[1].trim()
      let quien = 'local'
      if (texto.includes('Claude solo')) quien = 'claude'
      else if (texto.includes('pareja')) quien = 'pareja'
      actual.fallos.push({ quien, texto })
      continue
    }
  }

  return {
    id,
    nombre,
    etiqueta,
    cuantizacion,
    revisor,
    fecha,
    version,
    resumen,
    tareas,
  }
}

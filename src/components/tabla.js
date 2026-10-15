// Detalle por tarea: tabla de las tareas del modelo activo, agrupada por
// ámbito. Se re-actualiza al cambiar el modelo o el idioma.

import { t, getLang, onLangChange } from '../i18n/index.js'
import { getState, subscribe } from '../state.js'
import '../styles/tabla.css'

const UMBRAL_NOTA_BAJA = 5

// Columnas: id, nota local, nota pareja, rondas, tokens pareja, nota Claude,
// tokens Claude. Las tres de modo llevan data-modo y clase tabla__modo.
const COLS = [
  { clave: 'tabla.col.id' },
  { modo: 'local' },
  { modo: 'pareja' },
  { clave: 'tabla.col.rondas' },
  { clave: 'tabla.col.tokens' },
  { modo: 'claude' },
  { clave: 'tabla.col.tokens' },
]

export function renderTabla(contenedor, datos) {
  const section = document.createElement('section')
  section.className = 'tabla-detalle'

  const h2 = document.createElement('h2')
  h2.textContent = t('tabla.titulo')

  const tabla = document.createElement('table')
  tabla.className = 'tabla'

  const thead = document.createElement('thead')
  const filaHead = document.createElement('tr')
  thead.appendChild(filaHead)

  const tbody = document.createElement('tbody')

  tabla.append(thead, tbody)
  section.append(h2, tabla)
  contenedor.appendChild(section)

  function thCol(col) {
    const th = document.createElement('th')
    th.scope = 'col'
    if (col.modo) {
      th.classList.add('tabla__modo')
      th.dataset.modo = col.modo
      th.textContent = t(`modo.${col.modo}`)
    } else {
      th.textContent = t(col.clave)
    }
    return th
  }

  function celdaNota(valor) {
    const td = document.createElement('td')
    td.classList.add('tabla__num')
    if (valor < UMBRAL_NOTA_BAJA) td.classList.add('nota--baja')
    td.textContent = valor.toFixed(1)
    return td
  }

  function celdaNum(valor) {
    const td = document.createElement('td')
    td.classList.add('tabla__num')
    td.textContent = new Intl.NumberFormat(getLang()).format(valor)
    return td
  }

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return

    h2.textContent = t('tabla.titulo')

    filaHead.textContent = ''
    for (const col of COLS) filaHead.appendChild(thCol(col))

    // Agrupa las tareas por ámbito en orden de primera aparición.
    const orden = []
    const porAmbito = new Map()
    for (const tarea of modelo.tareas) {
      if (!porAmbito.has(tarea.ambito)) {
        porAmbito.set(tarea.ambito, [])
        orden.push(tarea.ambito)
      }
      porAmbito.get(tarea.ambito).push(tarea)
    }

    tbody.textContent = ''
    for (const ambito of orden) {
      const filaGrupo = document.createElement('tr')
      filaGrupo.className = 'tabla__grupo'
      const thGrupo = document.createElement('th')
      thGrupo.scope = 'colgroup'
      thGrupo.colSpan = 7
      thGrupo.textContent = t(`tabla.ambito.${ambito}`)
      filaGrupo.appendChild(thGrupo)
      tbody.appendChild(filaGrupo)

      for (const tarea of porAmbito.get(ambito)) {
        const fila = document.createElement('tr')

        const thId = document.createElement('th')
        thId.scope = 'row'
        thId.className = 'tabla__id'
        thId.textContent = tarea.id
        if (tarea.fallos.length > 0) {
          const fallo = document.createElement('span')
          fallo.className = 'tabla__fallo'
          fallo.setAttribute('role', 'img')
          fallo.setAttribute('aria-label', t('tabla.fallo'))
          fallo.textContent = '✗'
          thId.appendChild(fallo)
        }
        fila.appendChild(thId)

        fila.appendChild(celdaNota(tarea.local))
        fila.appendChild(celdaNota(tarea.pareja))
        fila.appendChild(celdaNum(tarea.rondas))
        fila.appendChild(celdaNum(tarea.tokens_pareja))
        fila.appendChild(celdaNota(tarea.claude))
        fila.appendChild(celdaNum(tarea.tokens_claude))

        tbody.appendChild(fila)
      }
    }
  }

  actualizar()

  const cancelarIdioma = onLangChange(actualizar)
  const cancelarEstado = subscribe(actualizar)

  return {
    cancelar() {
      cancelarIdioma()
      cancelarEstado()
    },
  }
}

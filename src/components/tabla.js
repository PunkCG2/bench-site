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
  { clave: 'tabla.col.tokens.pareja' },
  { modo: 'claude' },
  { clave: 'tabla.col.tokens.claude' },
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

  function celdaNota(valor, etiqueta) {
    const td = document.createElement('td')
    td.classList.add('tabla__num')
    if (valor < UMBRAL_NOTA_BAJA) td.classList.add('nota--baja')
    td.textContent = valor.toFixed(1)
    td.dataset.label = etiqueta
    return td
  }

  function celdaNum(valor, etiqueta) {
    const td = document.createElement('td')
    td.classList.add('tabla__num')
    td.textContent = new Intl.NumberFormat(getLang()).format(valor)
    td.dataset.label = etiqueta
    return td
  }

  // Resumen de la tarea en el panel: ámbito, rondas y el resultado de cada modo.
  function resumenTarea(tarea) {
    const caja = document.createElement('div')
    caja.className = 'tabla__resumen'
    const titulo = document.createElement('p')
    titulo.className = 'tabla__resumen-titulo'
    titulo.textContent = `${tarea.id} · ${t(`tabla.ambito.${tarea.ambito}`)} · ${t('tabla.detalle.rondas', { n: tarea.rondas })}`
    const modos = document.createElement('div')
    modos.className = 'tabla__resumen-modos'
    const datosModos = [
      ['local', tarea.local, null],
      ['pareja', tarea.pareja, tarea.tokens_pareja],
      ['claude', tarea.claude, tarea.tokens_claude],
    ]
    for (const [modo, nota, tokens] of datosModos) {
      const bloque = document.createElement('div')
      bloque.className = 'tabla__resumen-modo'
      bloque.dataset.modo = modo
      const nombre = document.createElement('span')
      nombre.className = 'tabla__resumen-nombre'
      nombre.textContent = t(`modo.${modo}`)
      const valor = document.createElement('span')
      valor.className = 'tabla__resumen-valor'
      valor.textContent = tokens === null
        ? nota.toFixed(1)
        : `${nota.toFixed(1)} · ${new Intl.NumberFormat(getLang()).format(tokens)} tokens`
      bloque.append(nombre, valor)
      modos.appendChild(bloque)
    }
    caja.append(titulo, modos)
    return caja
  }

  // Tareas expandidas (ids). Sobrevive al cambio de idioma; se vacía al
  // cambiar de modelo.
  const abiertas = new Set()
  let modeloAnterior = null

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return

    if (modeloAnterior !== null && modeloAnterior !== modelo.id) abiertas.clear()
    modeloAnterior = modelo.id

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
        const expandible = tarea.revisiones.length + tarea.fallos.length > 0
        if (expandible) {
          const boton = document.createElement('button')
          boton.type = 'button'
          boton.className = 'tabla__toggle'
          boton.textContent = tarea.id
          const abierta = abiertas.has(tarea.id)
          boton.setAttribute('aria-expanded', String(abierta))
          boton.setAttribute('aria-controls', `detalle-${tarea.id}`)
          boton.setAttribute('aria-label', `${abierta ? t('tabla.contraer') : t('tabla.expandir')}: ${tarea.id}`)
          boton.addEventListener('click', () => {
            if (abiertas.has(tarea.id)) abiertas.delete(tarea.id)
            else abiertas.add(tarea.id)
            const panel = document.getElementById(`detalle-${tarea.id}`)
            panel.hidden = !abiertas.has(tarea.id)
            boton.setAttribute('aria-expanded', String(abiertas.has(tarea.id)))
            boton.setAttribute(
              'aria-label',
              `${abiertas.has(tarea.id) ? t('tabla.contraer') : t('tabla.expandir')}: ${tarea.id}`,
            )
          })
          thId.appendChild(boton)
        } else {
          thId.textContent = tarea.id
        }
        if (tarea.fallos.length > 0) {
          const fallo = document.createElement('span')
          fallo.className = 'tabla__fallo'
          fallo.setAttribute('role', 'img')
          fallo.setAttribute('aria-label', t('tabla.fallo'))
          fallo.textContent = '✗'
          thId.appendChild(fallo)
        }
        fila.appendChild(thId)

        fila.appendChild(celdaNota(tarea.local, t('modo.local')))
        fila.appendChild(celdaNota(tarea.pareja, t('modo.pareja')))
        fila.appendChild(celdaNum(tarea.rondas, t('tabla.col.rondas')))
        fila.appendChild(celdaNum(tarea.tokens_pareja, t('tabla.col.tokens.pareja')))
        fila.appendChild(celdaNota(tarea.claude, t('modo.claude')))
        fila.appendChild(celdaNum(tarea.tokens_claude, t('tabla.col.tokens.claude')))

        tbody.appendChild(fila)

        if (expandible) {
          const filaDetalle = document.createElement('tr')
          filaDetalle.className = 'tabla__detalle'
          filaDetalle.id = `detalle-${tarea.id}`
          filaDetalle.hidden = !abiertas.has(tarea.id)
          const tdDetalle = document.createElement('td')
          tdDetalle.colSpan = 7
          tdDetalle.appendChild(resumenTarea(tarea))
          if (tarea.revisiones.length > 0) {
            const h4 = document.createElement('h4')
            h4.textContent = t('tabla.revisiones')
            const ul = document.createElement('ul')
            ul.className = 'tabla__revisiones'
            for (const rev of tarea.revisiones) {
              const li = document.createElement('li')
              const ronda = document.createElement('span')
              ronda.className = 'tabla__ronda'
              ronda.textContent = t('tabla.ronda_corta', { n: rev.ronda })
              // Solo el nombre del archivo; la ruta completa queda en el title.
              const archivo = document.createElement('span')
              archivo.className = 'tabla__archivo'
              archivo.textContent = rev.archivo.split('/').pop()
              archivo.title = rev.archivo
              const texto = document.createElement('p')
              texto.className = 'tabla__texto'
              texto.textContent = rev.texto
              // El texto va recortado a pocas líneas; un clic lo muestra completo.
              texto.addEventListener('click', () => texto.classList.toggle('tabla__texto--abierto'))
              li.append(ronda, archivo, texto)
              ul.appendChild(li)
            }
            tdDetalle.append(h4, ul)
          }
          if (tarea.fallos.length > 0) {
            const h4 = document.createElement('h4')
            h4.textContent = t('tabla.fallos')
            const ul = document.createElement('ul')
            ul.className = 'tabla__fallos'
            for (const fallo of tarea.fallos) {
              const li = document.createElement('li')
              li.textContent = `✗ ${t(`tabla.quien.${fallo.quien}`)}: ${fallo.texto}`
              ul.appendChild(li)
            }
            tdDetalle.append(h4, ul)
          }
          filaDetalle.appendChild(tdDetalle)
          tbody.appendChild(filaDetalle)
        }
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

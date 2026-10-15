// Hallazgos y metodología del modelo activo. Los cuatro hallazgos se
// muestran siempre; la variante se elige con metrics.js. Se re-actualiza al
// cambiar el modelo o el idioma.

import { t, onLangChange } from '../i18n/index.js'
import { getState, subscribe } from '../state.js'
import {
  reduccionTokens,
  factorTiempo,
  cambioPorRevision,
  notaMasBaja,
} from '../lib/metrics.js'
import '../styles/hallazgos.css'

// Devuelve las 4 claves i18n elegidas para `modelo`.
export function elegirVariantes(modelo) {
  const tokens = reduccionTokens(modelo)
  const tiempo = factorTiempo(modelo)
  const revision = cambioPorRevision(modelo)
  const nota = notaMasBaja(modelo)
  return {
    tokens: `hallazgos.tokens.${tokens < 0 ? 'mas' : tokens === 0 ? 'igual' : 'menos'}`,
    tiempo: `hallazgos.tiempo.${tiempo > 1 ? 'mas_lenta' : tiempo === 1 ? 'igual' : 'mas_rapida'}`,
    revision: `hallazgos.revision.${revision.tipo}`,
    nota: `hallazgos.nota.${nota.uniforme ? 'uniforme' : nota.ids.length === 1 ? 'una' : 'varias'}`,
  }
}

export function renderHallazgos(contenedor, datos) {
  const seccionHallazgos = document.createElement('section')
  seccionHallazgos.className = 'hallazgos'

  const h2Hallazgos = document.createElement('h2')
  const lista = document.createElement('ul')
  lista.className = 'hallazgos__lista'

  const items = []
  for (let i = 0; i < 4; i++) {
    const li = document.createElement('li')
    li.className = 'hallazgo'
    lista.appendChild(li)
    items.push(li)
  }

  const seccionMetodologia = document.createElement('section')
  seccionMetodologia.className = 'metodologia'
  const h2Metodologia = document.createElement('h2')
  const pMetodologia = document.createElement('p')
  pMetodologia.className = 'metodologia__texto'

  seccionHallazgos.append(h2Hallazgos, lista)
  seccionMetodologia.append(h2Metodologia, pMetodologia)
  contenedor.append(seccionHallazgos, seccionMetodologia)

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return
    const { claude, pareja } = modelo.resumen
    const claves = elegirVariantes(modelo)

    h2Hallazgos.textContent = t('hallazgos.titulo')
    h2Metodologia.textContent = t('metodologia.titulo')

    // Tokens
    const tokens = reduccionTokens(modelo)
    items[0].textContent =
      claves.tokens.endsWith('.igual')
        ? t(claves.tokens)
        : t(claves.tokens, { n: Math.abs(tokens) })

    // Tiempo
    const factor = factorTiempo(modelo)
    if (claves.tiempo.endsWith('.igual')) {
      items[1].textContent = t(claves.tiempo)
    } else if (claves.tiempo.endsWith('.mas_lenta')) {
      items[1].textContent = t(claves.tiempo, { n: factor })
    } else {
      items[1].textContent = t(claves.tiempo, {
        n: Math.round(claude.tiempo_s / pareja.tiempo_s),
      })
    }

    // Revisión
    const cambio = cambioPorRevision(modelo)
    items[2].textContent = t(claves.revision, {
      de: cambio.de.toFixed(1),
      a: cambio.a.toFixed(1),
    })

    // Nota más baja
    const r = notaMasBaja(modelo)
    items[3].textContent = t(claves.nota, {
      ids: r.ids.join(', '),
      nota: r.nota.toFixed(1),
    })

    // Metodología
    const revisor = modelo.revisor.charAt(0).toUpperCase() + modelo.revisor.slice(1)
    pMetodologia.textContent = t('metodologia.texto', {
      tareas: modelo.tareas.length,
      revisor,
    })
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

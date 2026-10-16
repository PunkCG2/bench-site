// Veredicto: cuatro semáforos y la conclusión para el modelo activo.
// Se re-actualiza al cambiar modelo o idioma.

import { t, onLangChange } from '../i18n/index.js'
import { getState, subscribe } from '../state.js'
import { veredicto } from '../lib/veredicto.js'
import '../styles/veredicto.css'

// Número con signo tipográfico (−) como en hero.js.
function conSigno(n, decimales = 0) {
  const s = Math.abs(n).toFixed(decimales)
  return n < 0 ? `−${s}` : n > 0 ? `+${s}` : s
}

function el(tag, clase) {
  const e = document.createElement(tag)
  e.className = clase
  return e
}

export function renderVeredicto(contenedor, datos) {
  const section = el('section', 'veredicto')
  const grid = el('div', 'veredicto__grid')
  const semaforos = el('div', 'veredicto__semaforos')
  const conclusion = el('div', 'veredicto__conclusion')
  const titulo = el('p', 'veredicto__eje')
  const respuesta = el('p', 'veredicto__respuesta')
  const frase = el('p', 'veredicto__frase')
  conclusion.append(titulo, respuesta, frase)

  const ejes = ['calidad', 'ahorro', 'costo', 'tiempo'].map(() => {
    const tarjeta = el('div', 'veredicto__tarjeta')
    const eje = el('p', 'veredicto__eje')
    const valor = el('p', 'veredicto__valor')
    const nivel = el('p', 'veredicto__nivel')
    tarjeta.append(eje, valor, nivel)
    semaforos.appendChild(tarjeta)
    return { eje, valor, nivel }
  })
  // La nota del costo va en la tarjeta de costo (tercera).
  const notaCosto = el('p', 'veredicto__eje')
  ejes[2].nivel.after(notaCosto)

  grid.append(semaforos, conclusion)
  section.appendChild(grid)
  contenedor.appendChild(section)

  function pintar(card, clave, valorTxt, nivel) {
    card.eje.textContent = t(`veredicto.eje.${clave}`)
    card.valor.textContent = valorTxt
    card.nivel.className = nivel ? `veredicto__nivel veredicto__nivel--${nivel}` : 'veredicto__nivel'
    card.nivel.textContent = t(nivel ? `veredicto.nivel.${nivel}` : 'veredicto.nivel.sin_dato')
  }

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return
    const v = veredicto(modelo)
    const { calidad, ahorro, costo, tiempo, conclusion: caso } = v

    pintar(ejes[0], 'calidad', t('veredicto.valor.pts', { n: conSigno(calidad.dif, 1) }), calidad.nivel)
    pintar(ejes[1], 'ahorro', t('veredicto.valor.pct', { n: conSigno(ahorro.pct) }), ahorro.nivel)
    if (costo.nivel === null) pintar(ejes[2], 'costo', t('veredicto.sin_valor'), null)
    else pintar(ejes[2], 'costo', t('veredicto.valor.pct', { n: conSigno(costo.pct) }), costo.nivel)
    pintar(ejes[3], 'tiempo', t('veredicto.valor.factor', { n: tiempo.factor }), tiempo.nivel)
    notaCosto.textContent = t('columnas.nota_costo')

    titulo.textContent = t('veredicto.titulo')
    respuesta.className = `veredicto__respuesta veredicto__respuesta--${caso}`
    respuesta.textContent = t(`veredicto.respuesta.${caso}`)
    frase.textContent = t(`veredicto.frase.${caso}`)
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

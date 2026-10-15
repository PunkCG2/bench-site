// Hero: la conclusión en una frase y tres cifras grandes animadas.
// Todo sale del modelo activo; se re-actualiza al cambiar modelo o idioma.

import { t, onLangChange } from '../i18n/index.js'
import { getState, subscribe } from '../state.js'
import { reduccionTokens, factorTiempo, cambioPorRevision } from '../lib/metrics.js'
import { animateNumber, onEnterViewport } from '../lib/animate.js'
import '../styles/hero.css'

// Durante la animación `n` trae decimales: las cifras siempre se muestran enteras.
export function formatoReduccion(n) {
  const r = Math.round(n)
  return r < 0 ? `+${Math.abs(r)} %` : `−${r} %`
}

export function formatoFactor(n) {
  return `${Math.round(n)}×`
}

export function renderHero(contenedor, datos) {
  const section = document.createElement('section')
  section.className = 'hero'

  const frase = document.createElement('p')
  frase.className = 'hero__frase'

  const cifras = document.createElement('div')
  cifras.className = 'hero__cifras'

  const valores = []
  const etiquetas = []
  for (let i = 0; i < 3; i++) {
    const c = document.createElement('div')
    c.className = 'hero__cifra'
    const e = document.createElement('span')
    e.className = 'hero__etiqueta'
    const v = document.createElement('span')
    v.className = 'hero__valor'
    c.append(e, v)
    cifras.appendChild(c)
    etiquetas.push(e)
    valores.push(v)
  }

  section.append(frase, cifras)
  contenedor.appendChild(section)

  let primera = true

  function claveFrase(cambio, factor, reduccion) {
    if (cambio.tipo === 'igual') return 'hero.frase.nota.igual'
    if (cambio.tipo === 'empeora') return 'hero.frase.nota.empeora'
    if (factor <= 0) return 'hero.frase.tiempo.mas_rapida'
    if (factor === 1) return 'hero.frase.tiempo.igual'
    if (reduccion < 0) return 'hero.frase.reduccion.mas'
    if (reduccion === 0) return 'hero.frase.reduccion.igual'
    return 'hero.frase'
  }

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return
    const { claude, pareja } = modelo.resumen
    const reduccion = reduccionTokens(modelo)
    const factor = factorTiempo(modelo)
    const cambio = cambioPorRevision(modelo)

    const params = {
      reduccion: reduccion < 0 ? Math.abs(reduccion) : reduccion,
      factor: factor <= 0 ? Math.round(claude.tiempo_s / pareja.tiempo_s) : factor,
      de: cambio.de.toFixed(1),
      a: cambio.a.toFixed(1),
    }
    frase.textContent = t(claveFrase(cambio, factor, reduccion), params)

    etiquetas[0].textContent = t('hero.cifra.tokens')
    etiquetas[1].textContent = t('hero.cifra.tiempo')
    etiquetas[2].textContent = t('hero.cifra.nota')

    if (primera) {
      primera = false
      onEnterViewport(section, () => {
        animateNumber(valores[0], reduccion, { formato: formatoReduccion })
        animateNumber(valores[1], factor, { formato: formatoFactor })
      })
    } else {
      animateNumber(valores[0], reduccion, { formato: formatoReduccion })
      animateNumber(valores[1], factor, { formato: formatoFactor })
    }
    valores[2].textContent = `${cambio.de.toFixed(1)} → ${cambio.a.toFixed(1)}`
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

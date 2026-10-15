// Tres modos: tres columnas (local, pareja, Claude) del modelo activo, cada una
// con cuatro tarjetas y la diferencia frente a Claude solo. Se re-actualiza al
// cambiar el modelo o el idioma.

import { t, getLang, onLangChange } from '../i18n/index.js'
import { getState, subscribe } from '../state.js'
import { diferencia, diferenciaNota } from '../lib/metrics.js'
import { animateNumber, revealStagger } from '../lib/animate.js'
import { crearCarrusel } from './carrusel.js'
import '../styles/columnas.css'

const MODOS = ['local', 'pareja', 'claude']

export function renderColumnas(contenedor, datos) {
  const section = document.createElement('section')
  section.className = 'columnas'

  const h2 = document.createElement('h2')
  h2.textContent = t('columnas.titulo')

  const rejilla = document.createElement('div')
  rejilla.className = 'columnas__rejilla'

  const nota = document.createElement('p')
  nota.className = 'columnas__nota'

  const columnas = {}
  for (const modo of MODOS) {
    const col = document.createElement('section')
    col.className = 'columna'
    col.dataset.modo = modo

    const titulo = document.createElement('h3')
    titulo.className = 'columna__titulo'
    col.appendChild(titulo)

    const tarjetas = []
    for (let i = 0; i < 4; i++) {
      const tarjeta = document.createElement('div')
      tarjeta.className = 'tarjeta'
      const etiqueta = document.createElement('span')
      etiqueta.className = 'tarjeta__etiqueta'
      const valor = document.createElement('span')
      valor.className = 'tarjeta__valor'
      const diff = document.createElement('span')
      diff.className = 'tarjeta__diff'
      tarjeta.append(etiqueta, valor, diff)
      col.appendChild(tarjeta)
      tarjetas.push({ etiqueta, valor, diff })
    }

    rejilla.appendChild(col)
    columnas[modo] = { col, titulo, tarjetas }
  }

  // Por debajo de 900 px la rejilla es un carrusel; los puntos se ocultan en escritorio.
  const carrusel = crearCarrusel(rejilla, MODOS.map((m) => columnas[m].col), () =>
    MODOS.map((m) => t(`modo.${m}`))
  )

  section.append(h2, rejilla, carrusel.puntos, nota)
  contenedor.appendChild(section)

  let primera = true

  // `d` es el resultado de `diferencia`/`diferenciaNota`. Sin diferencia si
  // `tipo==='igual'`; guion si no hay dato (`d===null` o `valor===null`);
  // si no, la clave con `{n}`.
  function lineaDiff(d, claveMenos, claveMas) {
    if (d === null) return '—'
    if (d.tipo === 'igual') return t('columnas.sin_diferencia')
    if (d.valor === null) return '—'
    return t(d.tipo === 'menos' ? claveMenos : claveMas, { n: d.valor })
  }

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return
    const { local, pareja, claude } = modelo.resumen

    h2.textContent = t('columnas.titulo')
    carrusel.actualizarEtiquetas()
    nota.textContent = t('columnas.nota_costo')

    const valores = {
      local: [local.nota, local.tiempo_s, local.tokens_claude, local.costo_usd],
      pareja: [pareja.nota, pareja.tiempo_s, pareja.tokens_claude, pareja.costo_usd],
      claude: [claude.nota, claude.tiempo_s, claude.tokens_claude, claude.costo_usd],
    }

    for (const modo of MODOS) {
      const { titulo, tarjetas } = columnas[modo]
      const v = valores[modo]
      titulo.textContent = t(`modo.${modo}`)

      tarjetas[0].etiqueta.textContent = t('columnas.precision')
      tarjetas[1].etiqueta.textContent = t('columnas.velocidad')
      tarjetas[2].etiqueta.textContent = t('columnas.tokens')
      tarjetas[3].etiqueta.textContent = t('columnas.costo')

      // Precisión: nota con un decimal, como texto.
      tarjetas[0].valor.textContent = v[0].toFixed(1)

      // Velocidad y tokens: animateNumber al cambiar de modelo; texto la primera vez.
      if (primera) {
        tarjetas[1].valor.textContent = t('columnas.unidad.s', { n: v[1] })
        tarjetas[2].valor.textContent = new Intl.NumberFormat(getLang()).format(v[2])
      } else {
        animateNumber(tarjetas[1].valor, v[1], { formato: (n) => t('columnas.unidad.s', { n: Math.round(n) }) })
        animateNumber(tarjetas[2].valor, v[2], { formato: (n) => new Intl.NumberFormat(getLang()).format(Math.round(n)) })
      }

      // Costo: null se muestra "—"; si no, tres decimales.
      tarjetas[3].valor.textContent = v[3] === null ? '—' : `${v[3].toFixed(3)} $`

      // Diferencia frente a Claude solo; la columna Claude es la referencia.
      if (modo === 'claude') {
        for (const tarjeta of tarjetas) {
          tarjeta.diff.textContent = t('columnas.referencia')
        }
      } else {
        const dNota = diferenciaNota(v[0], claude.nota)
        const dTiempo = diferencia(v[1], claude.tiempo_s)
        const dTokens = diferencia(v[2], claude.tokens_claude)
        const dCosto = diferencia(v[3], claude.costo_usd)
        tarjetas[0].diff.textContent = lineaDiff(dNota, 'columnas.pts.menos', 'columnas.pts.mas')
        tarjetas[1].diff.textContent = lineaDiff(dTiempo, 'columnas.pct.menos', 'columnas.pct.mas')
        tarjetas[2].diff.textContent = lineaDiff(dTokens, 'columnas.pct.menos', 'columnas.pct.mas')
        tarjetas[3].diff.textContent = lineaDiff(dCosto, 'columnas.pct.menos', 'columnas.pct.mas')
      }
    }

    if (primera) {
      primera = false
      revealStagger(MODOS.map((m) => columnas[m].col))
    }
  }

  actualizar()

  const cancelarIdioma = onLangChange(actualizar)
  const cancelarEstado = subscribe(actualizar)

  return {
    cancelar() {
      cancelarIdioma()
      cancelarEstado()
      carrusel.destruir()
    },
  }
}

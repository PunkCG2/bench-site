// Gráficos de barras del modelo activo: una barra por modo en cada métrica.
// Las barras parten de 0 y su escala sale del máximo de ese gráfico en los
// datos (la precisión usa la escala fija 0 a 10). No compara modelos.

import { t, getLang, onLangChange } from '../i18n/index.js'
import { getState, subscribe } from '../state.js'
import { onEnterViewport } from '../lib/animate.js'
import '../styles/grafico.css'

const MODOS = ['local', 'pareja', 'claude']
const ESCALA_NOTA = 10

// Métricas en el orden de la sección. `valor` lee `resumen[modo]`; `texto`
// formatea un valor no nulo; `escala` (opcional) fija el máximo del eje.
const METRICAS = [
  {
    clave: 'precision',
    valor: (r) => r.nota,
    texto: (v) => v.toFixed(1),
    escala: () => ESCALA_NOTA,
  },
  {
    clave: 'velocidad',
    valor: (r) => r.tiempo_s,
    texto: (v) => t('grafico.unidad.s', { n: v }),
  },
  {
    clave: 'tokens',
    valor: (r) => r.tokens_claude,
    texto: (v) => new Intl.NumberFormat(getLang()).format(v),
  },
  {
    clave: 'costo',
    valor: (r) => r.costo_usd,
    texto: (v) => `${v.toFixed(3)} $`,
  },
]

export function renderGrafico(contenedor, datos) {
  const section = document.createElement('section')
  section.className = 'grafico'

  const h2 = document.createElement('h2')
  const rejilla = document.createElement('div')
  rejilla.className = 'grafico__rejilla'
  section.append(h2, rejilla)
  contenedor.appendChild(section)

  // Estructura fija: 4 gráficos con 3 barras. Solo cambian textos y anchos.
  const graficos = METRICAS.map((metrica) => {
    const item = document.createElement('div')
    item.className = 'grafico__item'
    item.setAttribute('role', 'img')
    const titulo = document.createElement('h3')
    titulo.className = 'grafico__titulo'
    item.appendChild(titulo)
    const barras = MODOS.map((modo) => {
      const fila = document.createElement('div')
      fila.className = 'barra'
      fila.dataset.modo = modo
      const etiqueta = document.createElement('span')
      etiqueta.className = 'barra__etiqueta'
      const pista = document.createElement('span')
      pista.className = 'barra__pista'
      const relleno = document.createElement('span')
      relleno.className = 'barra__relleno'
      pista.appendChild(relleno)
      const valor = document.createElement('span')
      valor.className = 'barra__valor'
      fila.append(etiqueta, pista, valor)
      item.appendChild(fila)
      return { fila, etiqueta, relleno, valor }
    })
    rejilla.appendChild(item)
    return { metrica, item, titulo, barras }
  })

  // Las barras quedan en 0 hasta que la sección entra en pantalla.
  let visible = false

  function ancho(barra) {
    const p = barra.relleno.dataset.proporcion
    return visible && p !== undefined ? `${Number(p) * 100}%` : '0%'
  }

  function actualizar() {
    const modelo = datos.modelos.find((m) => m.id === getState().modelo)
    if (!modelo) return

    h2.textContent = t('grafico.titulo')

    for (const { metrica, item, titulo, barras } of graficos) {
      const valores = MODOS.map((modo) => metrica.valor(modelo.resumen[modo]))
      const maximo = metrica.escala
        ? metrica.escala()
        : Math.max(0, ...valores.filter((v) => v !== null))
      const nombre = t(`grafico.${metrica.clave}`)
      titulo.textContent = nombre

      const resumenAria = {}
      barras.forEach((barra, i) => {
        const v = valores[i]
        const etiqueta = t(`modo.${MODOS[i]}`)
        barra.etiqueta.textContent = etiqueta
        if (v === null) {
          // Sin dato: sin barra y con una etiqueta que explica por qué.
          barra.fila.classList.add('barra--vacia')
          delete barra.relleno.dataset.proporcion
          barra.valor.textContent = `— ${t('grafico.sin_costo')}`
          resumenAria[MODOS[i]] = t('grafico.aria.modo', { modo: etiqueta, valor: '—' })
        } else {
          barra.fila.classList.remove('barra--vacia')
          barra.relleno.dataset.proporcion = String(maximo > 0 ? v / maximo : 0)
          barra.valor.textContent = metrica.texto(v)
          resumenAria[MODOS[i]] = t('grafico.aria.modo', { modo: etiqueta, valor: metrica.texto(v) })
        }
        barra.relleno.style.width = ancho(barra)
      })
      item.setAttribute('aria-label', t('grafico.aria', { titulo: nombre, ...resumenAria }))
    }
  }

  actualizar()

  onEnterViewport(section, () => {
    visible = true
    actualizar()
  })

  const cancelarIdioma = onLangChange(actualizar)
  const cancelarEstado = subscribe(actualizar)

  return {
    cancelar() {
      cancelarIdioma()
      cancelarEstado()
    },
  }
}

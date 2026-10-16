import benchmarks from './data/benchmarks.json'
import './styles/tokens.css'
import './styles/base.css'
import './styles/animate.css'
import { initState } from './state.js'
import { t, onLangChange } from './i18n/index.js'
import { renderHeader } from './components/header.js'
import { renderHero } from './components/hero.js'
import { renderVeredicto } from './components/veredicto.js'
import { renderColumnas } from './components/columnas.js'
import { renderGrafico } from './components/grafico.js'
import { renderTabla } from './components/tabla.js'
import { renderHallazgos } from './components/hallazgos.js'
import { renderFooter } from './components/footer.js'

const IDS = ['hero', 'veredicto', 'modos', 'grafico', 'detalle', 'hallazgos', 'metodologia']

export function montar(raiz, datos) {
  raiz.textContent = ''
  initState(datos)

  const canceladores = []
  const ponerTitulo = () => { document.title = t('titulo') }
  ponerTitulo()
  canceladores.push(onLangChange(ponerTitulo))

  canceladores.push(renderHeader(raiz, datos).cancelar)

  const main = document.createElement('main')
  main.className = 'contenedor'
  raiz.appendChild(main)

  canceladores.push(renderFooter(raiz).cancelar)

  if (datos.modelos.length === 0) {
    const p = document.createElement('p')
    p.className = 'vacio'
    p.textContent = t('app.vacio')
    main.appendChild(p)
    canceladores.push(onLangChange(() => { p.textContent = t('app.vacio') }))
  } else {
    canceladores.push(renderHero(main, datos).cancelar)
    canceladores.push(renderVeredicto(main, datos).cancelar)
    canceladores.push(renderColumnas(main, datos).cancelar)
    canceladores.push(renderGrafico(main, datos).cancelar)
    canceladores.push(renderTabla(main, datos).cancelar)
    canceladores.push(renderHallazgos(main, datos).cancelar)
    for (let i = 0; i < main.children.length; i++) {
      main.children[i].id = IDS[i]
    }
  }

  return {
    cancelar() {
      for (const fn of canceladores) fn()
    },
  }
}

const app = document.getElementById('app')
if (app) montar(app, benchmarks)

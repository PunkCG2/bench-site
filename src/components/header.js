// Header estático: título, selector de modelo y botones de idioma y tema.
// Inserta el DOM en `contenedor` y se actualiza solo al cambiar el idioma
// (`onLangChange`) o el estado (`subscribe` de src/state.js).

import { t, getLang, onLangChange } from '../i18n/index.js'
import { getState, setModelo, setTema, setIdioma, subscribe } from '../state.js'
import '../styles/header.css'

export function renderHeader(contenedor, datos) {
  const modelos = datos?.modelos ?? []

  const header = document.createElement('header')
  header.className = 'header'
  const grid = document.createElement('div')
  grid.className = 'header__grid'

  // Zona izquierda: título y subtítulo.
  const titulo = document.createElement('div')
  titulo.className = 'header__titulo'
  const h1 = document.createElement('h1')
  h1.className = 'header__titulo-nombre'
  const sub = document.createElement('p')
  sub.className = 'header__titulo-sub'
  titulo.append(h1, sub)

  // Zona central: selector de modelo, un botón por modelo de los datos.
  const selector = document.createElement('div')
  selector.className = 'header__selector'
  selector.setAttribute('role', 'group')
  const botonesModelo = modelos.map((modelo) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'header__modelo'
    btn.dataset.modelo = modelo.id
    btn.textContent = modelo.etiqueta
    btn.addEventListener('click', () => setModelo(modelo.id))
    selector.appendChild(btn)
    return btn
  })

  // Zona derecha: botones de idioma y tema.
  const acciones = document.createElement('div')
  acciones.className = 'header__acciones'
  const btnIdioma = document.createElement('button')
  btnIdioma.type = 'button'
  btnIdioma.className = 'header__idioma'
  btnIdioma.addEventListener('click', () =>
    setIdioma(getLang() === 'es' ? 'en' : 'es')
  )
  const btnTema = document.createElement('button')
  btnTema.type = 'button'
  btnTema.className = 'header__tema'
  btnTema.addEventListener('click', () =>
    setTema(getState().tema === 'dark' ? 'light' : 'dark')
  )
  acciones.append(btnIdioma, btnTema)

  grid.append(titulo, selector, acciones)
  header.appendChild(grid)
  contenedor.appendChild(header)

  // Refresca todos los textos y estados que dependen del idioma o del
  // estado. Es idempotente: se llama al renderizar y en cada cambio.
  function actualizar() {
    const estado = getState()

    h1.textContent = t('titulo')
    sub.textContent = t('subtitulo')

    selector.setAttribute('aria-label', t('header.selector'))
    for (const btn of botonesModelo) {
      btn.setAttribute('aria-pressed', String(btn.dataset.modelo === estado.modelo))
    }

    // Cada botón muestra el valor al que cambiaría.
    const otroIdioma = getLang() === 'es' ? 'en' : 'es'
    btnIdioma.textContent = otroIdioma.toUpperCase()
    btnIdioma.setAttribute('aria-label', t(`header.idioma.${otroIdioma}`))

    const otroTema = estado.tema === 'dark' ? 'light' : 'dark'
    const claveTema = otroTema === 'light' ? 'claro' : 'oscuro'
    btnTema.textContent = t(`header.tema.${claveTema}`)
    btnTema.setAttribute('aria-label', t(`header.tema.aria.${claveTema}`))
  }

  actualizar()

  const cancelarIdioma = onLangChange(actualizar)
  const cancelarEstado = subscribe(actualizar)

  return {
    // Deja de escuchar los cambios y se puede volver a renderizar.
    cancelar() {
      cancelarIdioma()
      cancelarEstado()
    },
  }
}

// Estado de la aplicación: modelo elegido, tema e idioma.
// Se persiste en localStorage (claves bench.*) y notifica a los
// componentes cuando cambia. Toda lectura y escritura de localStorage
// va en try/catch: la app funciona aunque localStorage falle.

import { setLang, LANGS } from './i18n/index.js'

const CLAVES = {
  modelo: 'bench.modelo',
  tema: 'bench.tema',
  lang: 'bench.lang',
}

const TEMAS = ['dark', 'light']

let estado = { modelo: null, tema: 'dark', lang: 'es' }
let idsModelos = []
const suscriptores = new Set()

function leer(clave) {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // Sin persistencia: el estado sigue funcionando en memoria.
  }
}

// Tema por defecto: sigue prefers-color-scheme; oscuro si matchMedia no existe.
function temaPorDefecto() {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  }
  return 'dark'
}

function aplicarTema() {
  document.documentElement.dataset.theme = estado.tema
}

function notificar(que) {
  const copia = getState()
  for (const fn of suscriptores) fn(copia, que)
}

// Fija el estado inicial a partir de los datos y de lo guardado en
// localStorage. No escribe en localStorage: el tema solo se guarda cuando
// el usuario lo elige, para que siga prefers-color-scheme hasta entonces.
export function initState(datos) {
  const modelos = datos?.modelos ?? []
  idsModelos = modelos.map((m) => m.id)

  const modeloGuardado = leer(CLAVES.modelo)
  const modelo = idsModelos.includes(modeloGuardado)
    ? modeloGuardado
    : (modelos[0]?.id ?? null)

  const temaGuardado = leer(CLAVES.tema)
  const tema = TEMAS.includes(temaGuardado) ? temaGuardado : temaPorDefecto()

  const langGuardado = leer(CLAVES.lang)
  const lang = LANGS.includes(langGuardado) ? langGuardado : 'es'

  estado = { modelo, tema, lang }
  setLang(lang)
  aplicarTema()
  return getState()
}

// Devuelve una copia del estado actual.
export function getState() {
  return { ...estado }
}

export function setModelo(id) {
  if (!idsModelos.includes(id)) return
  estado.modelo = id
  escribir(CLAVES.modelo, id)
  notificar('modelo')
}

export function setTema(tema) {
  if (!TEMAS.includes(tema)) return
  estado.tema = tema
  escribir(CLAVES.tema, tema)
  aplicarTema()
  notificar('tema')
}

export function setIdioma(lang) {
  if (!LANGS.includes(lang)) return
  estado.lang = lang
  escribir(CLAVES.lang, lang)
  setLang(lang)
  notificar('lang')
}

// Registra `fn(estado, que)` para cada cambio y devuelve la función para
// cancelarlo. `que` es 'modelo' | 'tema' | 'lang'.
export function subscribe(fn) {
  suscriptores.add(fn)
  return () => suscriptores.delete(fn)
}

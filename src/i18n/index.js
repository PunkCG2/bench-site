// Sistema de textos en español e inglés.
// Los textos viven en src/i18n/sections/*.js; cada uno exporta por defecto
// `{ es: {...}, en: {...} }` con claves planas con punto. Aquí se fusionan
// en un diccionario por idioma. La persistencia en localStorage es de la
// tarea 007; este módulo no la toca.

export const LANGS = ['es', 'en']

// Fusiona todas las secciones en un diccionario por idioma.
const modulos = import.meta.glob('./sections/*.js', { eager: true })
export const diccionarios = { es: {}, en: {} }
for (const modulo of Object.values(modulos)) {
  const seccion = modulo.default
  for (const lang of LANGS) {
    Object.assign(diccionarios[lang], seccion[lang])
  }
}

let lang = 'es'
const suscriptores = new Set()

// Devuelve el texto de `clave` en el idioma activo, sustituyendo `{nombre}`
// por `params.nombre`. Si la clave no existe en el idioma activo usa el
// español; si tampoco existe, devuelve la propia clave. Nunca lanza.
export function t(clave, params = {}) {
  let texto = diccionarios[lang][clave]
  if (texto === undefined) texto = diccionarios.es[clave]
  if (texto === undefined) return clave
  return texto.replace(/\{(\w+)\}/g, (match, nombre) =>
    nombre in params ? String(params[nombre]) : match
  )
}

export function getLang() {
  return lang
}

export function setLang(nuevo) {
  if (!LANGS.includes(nuevo)) return
  lang = nuevo
  document.documentElement.lang = nuevo
  for (const fn of suscriptores) fn(nuevo)
}

// Registra un suscriptor del cambio de idioma y devuelve una función para
// cancelarlo.
export function onLangChange(fn) {
  suscriptores.add(fn)
  return () => suscriptores.delete(fn)
}

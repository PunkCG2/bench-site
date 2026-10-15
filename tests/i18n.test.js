import { describe, it, expect, beforeEach } from 'vitest'
import {
  t,
  getLang,
  setLang,
  onLangChange,
  LANGS,
  diccionarios,
} from '../src/i18n/index.js'

describe('i18n', () => {
  beforeEach(() => {
    setLang('es')
  })

  it('LANGS es [es, en]', () => {
    expect(LANGS).toEqual(['es', 'en'])
  })

  it('el idioma inicial es es', () => {
    expect(getLang()).toBe('es')
  })

  it('t devuelve español e inglés tras setLang', () => {
    setLang('es')
    expect(t('titulo')).toBe('Local + Claude')
    expect(t('subtitulo')).toBe('¿Vale la pena delegar?')
    expect(t('modo.local')).toBe('Modelo local solo')
    expect(t('modo.pareja')).toBe('Pareja (local + revisión)')
    expect(t('modo.claude')).toBe('Claude solo')
    expect(t('footer.leyenda')).toBe('Hecho con Claude Code y SDD')

    setLang('en')
    expect(t('titulo')).toBe('Local + Claude')
    expect(t('subtitulo')).toBe('Is delegating worth it?')
    expect(t('modo.local')).toBe('Local model only')
    expect(t('modo.pareja')).toBe('Pair (local + review)')
    expect(t('modo.claude')).toBe('Claude only')
    expect(t('footer.leyenda')).toBe('Made with Claude Code and SDD')
  })

  it('setLang actualiza document.documentElement.lang', () => {
    setLang('en')
    expect(document.documentElement.lang).toBe('en')
    setLang('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('sustituye parámetros {nombre} por params.nombre', () => {
    diccionarios.es['test.plantilla'] = 'Hola {nombre}, tienes {n} mensajes'
    diccionarios.en['test.plantilla'] = 'Hello {nombre}, you have {n} messages'
    try {
      setLang('es')
      expect(t('test.plantilla', { nombre: 'Ana', n: 3 })).toBe(
        'Hola Ana, tienes 3 mensajes'
      )
      setLang('en')
      expect(t('test.plantilla', { nombre: 'Ana', n: 3 })).toBe(
        'Hello Ana, you have 3 messages'
      )
    } finally {
      delete diccionarios.es['test.plantilla']
      delete diccionarios.en['test.plantilla']
    }
  })

  it('un parámetro ausente deja el marcador intacto', () => {
    diccionarios.es['test.plantilla'] = 'Hola {nombre}'
    diccionarios.en['test.plantilla'] = 'Hello {nombre}'
    try {
      expect(t('test.plantilla')).toBe('Hola {nombre}')
    } finally {
      delete diccionarios.es['test.plantilla']
      delete diccionarios.en['test.plantilla']
    }
  })

  it('clave inexistente devuelve la propia clave', () => {
    expect(t('no.existe.clave')).toBe('no.existe.clave')
  })

  it('clave inexistente en el idioma activo usa el español', () => {
    diccionarios.es['test.soloEs'] = 'Solo en español'
    try {
      setLang('en')
      expect(t('test.soloEs')).toBe('Solo en español')
    } finally {
      delete diccionarios.es['test.soloEs']
    }
  })

  it('setLang con otro valor se ignora', () => {
    setLang('en')
    setLang('fr')
    expect(getLang()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    setLang('es')
    setLang(null)
    expect(getLang()).toBe('es')
  })

  it('onLangChange notifica y se puede cancelar', () => {
    let visto = null
    const cancelar = onLangChange((lang) => {
      visto = lang
    })
    setLang('en')
    expect(visto).toBe('en')
    cancelar()
    setLang('es')
    expect(visto).toBe('en')
  })

  it('paridad: cada clave de es existe en en y viceversa', () => {
    const clavesEs = Object.keys(diccionarios.es)
    const clavesEn = Object.keys(diccionarios.en)
    expect(clavesEs.length).toBeGreaterThan(0)

    const faltaEnEn = clavesEs.filter((clave) => !(clave in diccionarios.en))
    expect(faltaEnEn).toEqual([])

    const faltaEnEs = clavesEn.filter((clave) => !(clave in diccionarios.es))
    expect(faltaEnEs).toEqual([])
  })
})

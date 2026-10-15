import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cssPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles', 'tokens.css')
const css = readFileSync(cssPath, 'utf8')

// Devuelve el cuerpo de la primera regla cuyo selector contenga `selector`.
function bloque(selector) {
  const inicio = css.indexOf(selector)
  expect(inicio, `selector no encontrado: ${selector}`).toBeGreaterThan(-1)
  const apertura = css.indexOf('{', inicio)
  let profundidad = 0
  for (let i = apertura; i < css.length; i++) {
    if (css[i] === '{') profundidad++
    if (css[i] === '}') {
      profundidad--
      if (profundidad === 0) return css.slice(apertura + 1, i)
    }
  }
  throw new Error(`sin cierre de llave para: ${selector}`)
}

const oscuro = bloque(':root[data-theme="dark"]')
const claro = bloque(':root[data-theme="light"]')

const colores = [
  '--c-local',
  '--c-pareja',
  '--c-claude',
  '--bg',
  '--surface',
  '--text',
  '--muted',
]

describe('tokens.css', () => {
  it('los 7 tokens de color aparecen en el bloque oscuro', () => {
    for (const token of colores) {
      expect(oscuro, `falta ${token} en el bloque oscuro`).toContain(token)
    }
  })

  it('los 7 tokens de color aparecen en el bloque claro', () => {
    for (const token of colores) {
      expect(claro, `falta ${token} en el bloque claro`).toContain(token)
    }
  })

  it('existen los tokens de espaciado --sp-*', () => {
    for (const token of ['--sp-4', '--sp-8', '--sp-12', '--sp-16', '--sp-24', '--sp-32', '--sp-48', '--sp-64']) {
      expect(css, `falta ${token}`).toContain(token)
    }
  })

  it('existen los tokens de tamaño de fuente --fs-*', () => {
    for (const token of ['--fs-14', '--fs-16', '--fs-20', '--fs-28', '--fs-44', '--fs-72']) {
      expect(css, `falta ${token}`).toContain(token)
    }
  })

  it('existen los tokens de duración --dur-*', () => {
    for (const token of ['--dur-counter', '--dur-bar', '--dur-theme', '--dur-reveal']) {
      expect(css, `falta ${token}`).toContain(token)
    }
  })
})

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const css = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/styles/tokens.css'), 'utf8');

function bloque(texto, selector) {
  const inicio = texto.indexOf(selector);
  if (inicio === -1) throw new Error(`Selector no encontrado: ${selector}`);
  const apertura = texto.indexOf('{', inicio);
  return texto.slice(apertura + 1, texto.indexOf('}', apertura));
}

function tokens(bloqueTexto) {
  const mapa = {};
  for (const m of bloqueTexto.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) mapa[m[1]] = m[2];
  return mapa;
}

function canal(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminancia(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * canal(n >> 16) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

function contraste(hexA, hexB) {
  const [a, b] = [luminancia(hexA), luminancia(hexB)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const oscuro = tokens(bloque(css, ':root[data-theme="dark"]'));
const claro = tokens(bloque(css, ':root[data-theme="light"]'));

const paresTexto = [
  ['--text', '--bg'],
  ['--text', '--surface'],
  ['--muted', '--bg'],
  ['--muted', '--surface'],
];
const paresColor = [
  ['--c-local', '--bg'],
  ['--c-local', '--surface'],
  ['--c-pareja', '--bg'],
  ['--c-pareja', '--surface'],
  ['--c-claude', '--bg'],
  ['--c-claude', '--surface'],
  ['--c-ok', '--bg'],
  ['--c-ok', '--surface'],
  ['--c-aviso', '--bg'],
  ['--c-aviso', '--surface'],
  ['--c-mal', '--bg'],
  ['--c-mal', '--surface'],
];

describe.each([['oscuro', oscuro], ['claro', claro]])('tema %s', (tema, t) => {
  it.each(paresTexto)('%s sobre %s (mín 4.5)', (a, b) => {
    const valor = contraste(t[a], t[b]);
    expect(valor, `tema ${tema}: par ${a}/${b} = ${valor.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });
  it.each(paresColor)('%s sobre %s (mín 3)', (a, b) => {
    const valor = contraste(t[a], t[b]);
    expect(valor, `tema ${tema}: par ${a}/${b} = ${valor.toFixed(2)}`).toBeGreaterThanOrEqual(3);
  });
});

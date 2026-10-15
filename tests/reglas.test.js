import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildData } from '../scripts/build-data.js';
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(raiz, 'src');
const rel = (p) => path.relative(raiz, p);

// Recursivo: rutas con la extensión, excluye src/data.
function archivos(dir, ext) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (path.resolve(p) !== path.resolve(path.join(src, 'data'))) out.push(...archivos(p, ext));
    } else if (e.isFile() && e.name.endsWith(ext)) out.push(p);
  }
  return out;
}
describe('reglas del proyecto', () => {
  it('1. sin colores literales fuera de tokens.css', () => {
    const inc = [];
    for (const p of archivos(src, '.css')) {
      if (path.basename(p) === 'tokens.css') continue;
      readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (/#[0-9a-fA-F]{3,8}\b/.test(l) || /rgb\(|hsl\(/.test(l))
          inc.push(`${rel(p)}:${i + 1}: color literal`);
      });
    }
    expect(inc, inc.join('\n')).toEqual([]);
  });

  it('2. las animaciones no dependen de prefers-reduced-motion y ninguna va en bucle', () => {
    // Decisión del autor (2026-10-15): se muestran siempre; por eso deben ser cortas y sin bucles.
    const inc = []
    for (const p of [...archivos(src, '.css'), ...archivos(src, '.js')]) {
      readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (/prefers-reduced-motion|prefersReducedMotion/.test(l) && !/^\s*(\/\/|\/\*|\*)/.test(l))
          inc.push(`${rel(p)}:${i + 1}: depende de prefers-reduced-motion`)
        if (p.endsWith('.css') && /\binfinite\b/.test(l)) inc.push(`${rel(p)}:${i + 1}: animación en bucle`)
      })
    }
    expect(inc, inc.join('\n')).toEqual([])
  })

  it('3. sin tildes en literales de src/components', () => {
    const inc = [];
    const re = /(['"`])(?:(?!\1).)*[áéíóúñÁÉÍÓÚÑ¿¡](?:(?!\1).)*\1/;
    for (const p of archivos(path.join(src, 'components'), '.js')) {
      const limpio = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      limpio.split('\n').forEach((l, i) => {
        if (re.test(l)) inc.push(`${rel(p)}:${i + 1}: literal con tildes`);
      });
    }
    expect(inc, inc.join('\n')).toEqual([]);
  });

  it('4. paridad de claves es-en en i18n/sections', () => {
    const inc = [];
    const mods = import.meta.glob('../src/i18n/sections/*.js', { eager: true });
    for (const [ruta, mod] of Object.entries(mods)) {
      const d = mod.default;
      const [es, en] = [d.es, d.en].map((o) => new Set(Object.keys(o)));
      for (const k of es) if (!en.has(k)) inc.push(`${ruta}: falta en en: ${k}`);
      for (const k of en) if (!es.has(k)) inc.push(`${ruta}: falta en es: ${k}`);
    }
    expect(inc, inc.join('\n')).toEqual([]);
  });

  it('5. benchmarks.json coincide con buildData', () => {
    const leido = JSON.parse(readFileSync(path.join(src, 'data', 'benchmarks.json'), 'utf8'));
    expect(leido).toEqual(buildData(path.join(raiz, 'data', 'raw')));
  });
});

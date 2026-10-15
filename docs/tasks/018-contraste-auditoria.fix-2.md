# Correcciones 018 - ronda 2

Ya existe `tests/contraste.test.js` (no lo toques). Falta solo `tests/reglas.test.js`, máximo 80 líneas, con
UNA llamada Write, sin razonar de más; NO crees archivos temporales ni depures con archivos sueltos (nada
fuera de `tests/reglas.test.js`). No toques `src/`. Lee antes `docs/tasks/018-contraste-auditoria.md` §Detalles.
Función auxiliar `archivos(dir, ext)` recursiva con `readdirSync(dir, { withFileTypes: true })` que devuelve las rutas
con esa extensión y excluye `src/data`. Cada incumplimiento se reporta como `archivo:línea: texto` y la prueba
falla con `expect(incumplimientos, incumplimientos.join('\n')).toEqual([])`. Pruebas:
1. Ningún `.css` en `src/` salvo `tokens.css` contiene `#` + 3, 6 u 8 dígitos hex (regex `/#[0-9a-fA-F]{3,8}\b/`)
   ni `rgb(`/`hsl(`. (Ignora líneas dentro de comentarios `/* */` solo si es sencillo; si no, no los ignores.)
2. `base.css` contiene `prefers-reduced-motion`; y todo `.css` que declare `transition` o `animation` fuera de
   `base.css` y `animate.css` también contiene `prefers-reduced-motion` o usa solo `transition: none`. (Si un
   archivo incumple de verdad, déjalo fallando y repórtalo; no lo arregles.)
3. Ningún `.js` en `src/components/` contiene literales de cadena (comillas simples, dobles o backtick, sin
   contar comentarios `//` ni `/* */`) con letras acentuadas `[áéíóúñÁÉÍÓÚÑ]` o `¿` `¡`. Quita primero los comentarios
   con una regex sencilla `/\/\*[\s\S]*?\*\/|\/\/.*$/gm` y luego busca con `/(['"`])(?:(?!\1).)*[áéíóúñÁÉÍÓÚÑ¿¡](?:(?!\1).)*\1/`
   por línea. Excepción permitida: la marca `✗` y `—` no cuentan (no son letras acentuadas).
4. Paridad de claves: para cada `src/i18n/sections/*.js` (import dinámico con `import(ruta)` o `import.meta.glob`
   con `eager: true`), `Object.keys(es)` y `Object.keys(en)` son iguales como conjuntos.
5. `src/data/benchmarks.json` coincide con `buildData('data/raw')` (de `../scripts/build-data.js`): `toEqual`.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas, indicando qué pruebas fallan de verdad.

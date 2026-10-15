# Correcciones 018 - ronda 1 (reparto en partes)

Trabaja por partes, UNA llamada Write por archivo, sin razonar de más. Esta ronda: solo
`tests/contraste.test.js` (máximo 70 líneas; NO crees reglas.test.js ahora). No toques `src/`. Lee antes
`docs/tasks/018-contraste-auditoria.md` y `src/styles/tokens.css`.
- Lee `tokens.css` con `readFileSync`. Extrae el bloque oscuro (`:root,\n:root[data-theme="dark"] { ... }`) y el
  claro (`:root[data-theme="light"] { ... }`) con una función `bloque(css, selector)` que busque desde el selector hasta la
  siguiente `}`; y una función `tokens(bloqueTexto)` que devuelva `{ '--bg': '#14161A', ... }` con una regex
  `/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g`.
- Función `luminancia(hex)` y `contraste(hexA, hexB)` según WCAG 2.x (canales sRGB a lineal con
  `c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4`; `L = 0.2126 R + 0.7152 G + 0.0722 B`; razón `(L1+0.05)/(L2+0.05)` con L1 la mayor).
- Para cada tema (`describe.each([['oscuro', ...], ['claro', ...]])`) comprueba con `it.each` los pares:
  `--text`/`--bg` y `--text`/`--surface` y `--muted`/`--bg` y `--muted`/`--surface` con mínimo 4.5; y
  `--c-local`, `--c-pareja`, `--c-claude` sobre `--bg` y sobre `--surface` con mínimo 3. El mensaje de fallo
  debe incluir tema, par y valor (`expect(valor, mensaje).toBeGreaterThanOrEqual(min)` con un mensaje en texto).
- NO ajustes los tokens para que pase: si un par falla, déjalo fallando y repórtalo en tu respuesta final.
Al terminar ejecuta `npm test` y `npm run build`. Respuesta final: máximo 5 líneas, indicando los pares que fallen.

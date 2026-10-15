---
id: 018
estado: hecha
ejecuta: local
depende: [017]
rondas: 2
---
# Auditar contraste, reglas del proyecto y movimiento reducido

## Objetivo
Pruebas automáticas protegen las reglas de CLAUDE.md y el contraste de los dos temas.

## Archivos en alcance
- tests/contraste.test.js (crear)
- tests/reglas.test.js (crear)

## No tocar
- data/raw/
- Código fuente de `src/` (si una prueba falla por un problema real, se reporta en las notas; no se arregla en esta tarea)

## Detalles
- `contraste.test.js`: lee `src/styles/tokens.css`, extrae los valores hexadecimales de cada
  tema y calcula la relación de contraste WCAG (luminancia relativa) de estos pares, en oscuro y
  en claro: `--text` sobre `--bg`, `--text` sobre `--surface`, `--muted` sobre `--bg`, `--muted`
  sobre `--surface` (mínimo **4.5**); y `--c-local`, `--c-pareja`, `--c-claude` sobre `--bg` y
  sobre `--surface` (mínimo **3**, son cifras y elementos gráficos grandes). La función de
  contraste se escribe en el propio test. Si algún par no cumple, la prueba falla y muestra el
  par y su valor; **no ajustes los tokens para que pase**: déjala fallando y repórtalo.
- `reglas.test.js`: recorre `src/**/*.css` y `src/**/*.js` (sin `src/data/`) y comprueba:
  (1) ningún `.css` fuera de `tokens.css` contiene `#` seguido de 3, 6 u 8 dígitos hexadecimales
  ni `rgb(`/`hsl(`; (2) cada `.css` que declara `transition` o `animation` aparece junto a un
  bloque `prefers-reduced-motion` (en el mismo archivo o en `base.css`, que ya lo hace global:
  la prueba verifica que `base.css` lo contenga); (3) ningún `.js` bajo `src/components/`
  contiene texto con tildes o `¿` entre comillas que no venga de i18n (regla simple: busca
  literales de cadena con letras acentuadas o `¿` `¡` y falla; excluye comentarios); (4) cada
  `src/i18n/sections/*.js` tiene paridad de claves es-en; (5) `src/data/benchmarks.json` coincide
  con la salida de `buildData('data/raw')`.
- Las pruebas deben ser legibles y mostrar el archivo y la línea de cada incumplimiento.

## Criterios de aceptación
- [ ] `npm test` pasa (si el contraste de un par falla de verdad, se documenta en "Notas de revisión" y Claude decide el ajuste de tokens)
- [ ] `npm run build` pasa

## Notas de revisión
Ronda 1: contraste (los 22 pares pasan en ambos temas). Ronda 2: reglas. Claude corrigio la regla 2 (mi instruccion era demasiado estricta: base.css ya apaga transiciones y animaciones globalmente). 144 tests y build verificados. Worker dejo restos (test de depuracion, tests/_tmp_check.mjs) que se borraron.

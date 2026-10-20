---
id: 010
status: done
runner: local
depends: [005, 008, 009]
rounds: 1
---
# Construir el hero con cifras animadas

## Objetivo
El hero muestra la conclusión en una frase y tres cifras grandes animadas, calculadas desde
los datos, que se actualizan al cambiar el modelo.

## Archivos en alcance
- src/components/hero.js (crear)
- src/styles/hero.css (crear)
- src/i18n/sections/hero.js (crear)
- tests/hero.test.js (crear)

## No tocar
- data/raw/
- src/lib/metrics.js (solo se usa)

## Detalles
Aplica docs/spec.md §Secciones 1 y docs/diseno.md §Tipografía y §Animación. Todo es del modelo
activo; no se comparan modelos. La frase y las cifras dicen la verdad también si la reducción es
negativa, el factor es 1 o la nota no sube (usa `−`/`+` según el signo y variantes de frase
`hero.frase.*`, igual que los hallazgos de la tarea 016).
- `renderHero(contenedor, datos)`: lee el modelo activo de `getState()` y calcula todo con
  `src/lib/metrics.js` (`reduccionTokens`, `factorTiempo`) y con `modelo.resumen`. Se actualiza
  cuando cambia el modelo o el idioma.
- Tres cifras, cada una con una etiqueta pequeña (`--font-mono`, `--fs-14`, `--muted`) y el valor
  en `--font-mono` a `--fs-72` (en móvil `--fs-44`):
  1. Reducción de tokens de Claude de la pareja frente a Claude solo (`−{n} %`).
  2. Factor de lentitud de la pareja (`{n}× más lenta`, texto traducido).
  3. Nota de la pareja frente a la del modelo local solo (`{a} → {b}`, un decimal).
- La frase de conclusión usa una plantilla traducida con parámetros: no escribe cifras
  (ej. `hero.frase`: "La pareja usa {reduccion} % menos tokens de Claude…"). Los textos van en
  `src/i18n/sections/hero.js` con `{ es, en }`.
- Animación: los números cuentan de 0 al valor al entrar en pantalla (`onEnterViewport` +
  `animateNumber`, 900 ms). Al cambiar de modelo transicionan desde el valor actual con
  `animateNumber`, sin recargar. Con reduced-motion se muestran finales (lo resuelve `animate.js`).
- Pruebas (jsdom, `animateNumber` simulado o reduced-motion activo): con Gemma, el valor de la
  reducción es `73` y con Qwen `78`; el texto de la frase está en español y cambia a inglés al
  cambiar el idioma; el HTML generado no contiene cifras que no vengan de los datos (las
  pruebas comparan con `reduccionTokens` y `factorTiempo`, no con literales).

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `hero.css` y `hero.js` no contienen ningún número de benchmark literal (73, 78, 7, 9, 8.8…)
- [ ] Las claves de `sections/hero.js` tienen paridad es-en (lo verifica la prueba de i18n)

## Notas de revisión
Worker agotó tokens de salida dos veces (solo dejó i18n). Ronda 1 con fix-1 que divide el trabajo en archivos cortos: correcta. 81 tests y build verificados; sin cifras literales.

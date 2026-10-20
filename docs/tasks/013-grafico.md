---
id: 013
status: done
runner: claude
depends: [007, 008, 009]
rounds: 0
---
# Construir los gráficos de comparación entre modos

## Objetivo
La sección "Gráfico" muestra, para el modelo activo, cuatro gráficos de barras (precisión,
velocidad, tokens de Claude, costo), cada uno con una barra por modo. No compara modelos.

## Archivos en alcance
- src/components/grafico.js (crear)
- src/styles/grafico.css (crear)
- src/i18n/sections/grafico.js (crear)
- tests/grafico.test.js (crear)

## No tocar
- data/raw/

## Detalles
Aplica docs/spec.md §Secciones 4 y §Decisiones 8, y docs/diseno.md §Gráfico, §Color y
§Animación. Va a Claude porque el diseño de los gráficos (cómo se lee la diferencia sin
exagerarla) pide criterio visual.
- `renderGrafico(contenedor, datos)`: lee el modelo activo de `getState()`; se actualiza al cambiar
  de modelo o de idioma.
- Cuatro gráficos pequeños, en este orden y con los datos de `modelo.resumen`:
  **precisión** (nota, escala 0 a 10), **velocidad** (tiempo por tarea en segundos),
  **tokens de Claude por tarea** y **costo equivalente** (dólares). Cada gráfico tiene tres
  barras (local, pareja, Claude) con el color del modo, su etiqueta de texto y el valor
  al lado (el color nunca va solo).
- Las barras parten de 0 y su escala sale del máximo de ese gráfico en los datos; no se recorta
  el eje para exagerar diferencias. Si dos valores son iguales, las barras son iguales. Un
  valor `null` (costo del modo local) se muestra como "—" sin barra, con una etiqueta que lo
  explique.
- Implementación en SVG o CSS (decisión de la tarea), generada desde los datos. Sin librerías.
- Animación: las barras crecen desde 0 en 700 ms (`--dur-bar`), con 80 ms (`--stagger-bar`) entre
  barras, al entrar en pantalla (`onEnterViewport`). Al cambiar de modelo, las barras
  transicionan a los nuevos valores. Con reduced-motion aparecen finales.
- Accesibilidad: cada gráfico es `role="img"` con `aria-label` traducido que resume los tres
  valores; además los valores están en texto visible.
- Sin `z-index` (el header queda siempre por encima).
- Textos en `src/i18n/sections/grafico.js` con `{ es, en }`.
- Pruebas: 4 gráficos con 3 barras cada uno; la longitud de cada barra es proporcional al valor
  de los datos (calculado en la prueba desde el JSON); valores iguales dan barras iguales
  (datos mínimos inventados); costo `null` no dibuja barra y muestra "—"; etiquetas de texto
  presentes; textos traducidos; cambiar el modelo actualiza los valores.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] Cada barra tiene la etiqueta de su modo en texto (no solo color)
- [ ] `grafico.css` no contiene hexadecimales ni `z-index`

## Notas de revisión
Implementada por Claude con barras CSS (ancho proporcional, escala 0 a 10 en precision y maximo del grafico en el resto). 113 tests y build verificados. Verificacion visual pendiente hasta ensamblar la pagina (017/018).

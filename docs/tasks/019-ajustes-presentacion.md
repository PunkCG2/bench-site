---
id: 019
estado: hecha
ejecuta: claude
depende: [018]
rondas: 0
---
# Ajustes de presentación tras la revisión visual

## Objetivo
Corregir lo que se vio al abrir el sitio en el navegador (capturas del autor, 2026-10-15).

## Archivos en alcance
- src/styles/columnas.css, src/styles/hero.css, src/styles/tabla.css, src/styles/grafico.css

## Detalles
1. Tarjetas de "Tres modos": etiqueta, valor y diferencia en bloque, no en línea; valor destacado.
2. Hero: `8.8 → 10.0` no se parte en dos líneas; el hero se alinea con el resto de secciones.
3. Tabla: ids alineados; indicador de apertura en las filas expandibles (las demás no se expanden por
   diseño: no tienen revisiones ni fallos); rayas de color de los encabezados separadas por modo.
4. Gráfico: la etiqueta "Pareja (local + revisión)" cabe en una línea en escritorio.

## Criterios de aceptación
- [ ] `npm test` y `npm run build` pasan
- [ ] El autor lo verifica en el navegador (escritorio y móvil)

## Notas de revisión
Hecho por Claude. 142 tests y build verificados. Falta la verificacion visual del autor en el navegador.

---
id: 014
estado: en-curso
ejecuta: local
depende: [008, 009]
rondas: 0
---
# Construir la tabla de detalle por tarea

## Objetivo
La sección "Detalle por tarea" muestra una tabla de las 13 tareas del modelo activo, agrupada
por ámbito, con las notas, rondas y tokens de los tres modos.

## Archivos en alcance
- src/components/tabla.js (crear)
- src/styles/tabla.css (crear)
- src/i18n/sections/tabla.js (crear)
- tests/tabla.test.js (crear)

## No tocar
- data/raw/

## Detalles
Aplica docs/spec.md §Secciones 5 y docs/diseno.md §Color y §Responsive (la parte de escritorio;
el comportamiento expandible y la vista móvil apilada son la tarea 015).
- `renderTabla(contenedor, datos)`: lee el modelo activo de `getState()`; se actualiza al
  cambiar modelo o idioma.
- Agrupa las tareas por `tarea.ambito` en el orden de primera aparición. Cada grupo tiene una
  fila de encabezado con el nombre traducido del ámbito (`tabla.ambito.unity`, `.web`, `.cpp`,
  `.unreal`, `.rust`, `.dotnet`, `.firebase`, `.otro`).
- Columnas por tarea: id (`--font-mono`), nota local solo, nota pareja, rondas, tokens de Claude
  de la pareja, nota Claude solo, tokens de Claude solo. Los encabezados de las columnas de modo
  llevan la etiqueta de texto (`t('modo.*')`) y el color del modo en un indicador.
- Notas con un decimal. Tokens con separador de miles según el idioma. Si la nota de un modo es
  menor que 5, la celda lleva la clase `nota--baja` (estilo con borde o negrita; no solo color).
- Las tareas con fallos (`fallos.length > 0`) muestran una marca `✗` con `aria-label` traducido.
- Tabla semántica (`<table>`, `<thead>`, `<th scope>`). Sin costo API en esta vista.
- Textos en `src/i18n/sections/tabla.js` con `{ es, en }`.
- Pruebas (jsdom): 13 filas de tarea y 7 filas de grupo para el modelo Gemma; ámbitos con su
  texto en español e inglés; valores de una fila (p. ej. `NET-501`) iguales a los del JSON;
  `nota--baja` en `NET-501` para el modo local; `✗` en `FB-601`.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `tabla.css` no contiene hexadecimales

## Notas de revisión
(las escribe Claude al aprobar)

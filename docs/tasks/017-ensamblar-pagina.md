---
id: 017
estado: en-curso
ejecuta: local
depende: [007, 009, 010, 011, 012, 013, 015, 016]
rondas: 0
---
# Ensamblar la página completa

## Objetivo
`src/main.js` carga los datos, inicia el estado y monta header, hero, columnas, gráfico,
detalle, hallazgos, metodología y footer, en el orden de la spec.

## Archivos en alcance
- src/main.js (modificar)
- index.html (modificar solo si hace falta añadir contenedores)
- tests/app.test.js (crear)

## No tocar
- data/raw/
- Los componentes ya hechos (solo se importan y se montan)

## Detalles
Aplica docs/spec.md §Secciones (orden: header, hero, tres modos, gráfico, detalle, hallazgos,
metodología, footer).
- `main.js` importa `src/data/benchmarks.json`, los CSS (`tokens`, `base`, `animate`, `header`,
  `hero`, `columnas`, `grafico`, `tabla`, `hallazgos`) y llama a `initState(datos)`.
- Estructura del DOM: `<header>`, luego `<main>` con una `<section>` por bloque (con `id` y un
  título `<h2>` traducido en las secciones que lo necesiten) y `<footer>`. Ver
  docs/diseno.md §Espaciado (ancho máximo 1100 px, `.contenedor`).
- Exporta una función `montar(raiz, datos)` para poder probarla sin el módulo de entrada.
- Actualiza `document.title` a `t('titulo')` al cambiar el idioma.
- Si `datos.modelos` está vacío, muestra un mensaje traducido en lugar de romperse.
- Nada supone dos modelos: la página debe montarse igual con 1 a 5 modelos.
- Pruebas (jsdom, `matchMedia` e `IntersectionObserver` simulados; incluye un caso con 3 modelos
  inventados): `montar` produce las 8 zonas
  en orden; cambiar el modelo actualiza la sección de columnas (los valores cambian); cambiar
  el idioma cambia textos de varias secciones; cambiar el tema cambia `data-theme`; con datos
  vacíos aparece el mensaje.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa
- [ ] `npm run build` genera un `dist/` cuyo `index.html` referencia un script y un CSS
- [ ] No hay errores en consola al abrir `npm run preview` (verificado en el navegador)

## Notas de revisión
(las escribe Claude al aprobar)

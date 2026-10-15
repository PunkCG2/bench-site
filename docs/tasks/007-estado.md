---
id: 007
estado: pendiente
ejecuta: local
depende: [004, 006]
rondas: 0
---
# Crear el estado de la aplicación (modelo, tema, idioma)

## Objetivo
Existe un store pequeño que guarda el modelo elegido, el tema y el idioma, los persiste en
`localStorage` y notifica a los componentes cuando cambian.

## Archivos en alcance
- src/state.js (crear)
- tests/state.test.js (crear)

## No tocar
- data/raw/
- src/i18n/index.js (solo se usa su API)

## Detalles
Aplica docs/spec.md §Decisiones 3 (tema e idioma) y docs/diseno.md §Header (Preferencias).
- `initState(datos)`: recibe `{ modelos }` (el JSON) y fija el estado inicial:
  - `modelo`: el `id` guardado en `localStorage` si existe en `datos`; si no, el primer modelo.
  - `tema`: `'dark'` o `'light'`; el guardado, o si no hay, `prefers-color-scheme` vía
    `window.matchMedia('(prefers-color-scheme: light)')` (oscuro si `matchMedia` no existe).
  - `lang`: el guardado, o `'es'`. Llama a `setLang` de i18n.
  - Aplica el tema con `document.documentElement.dataset.theme = tema`.
- `getState()` devuelve una copia `{ modelo, tema, lang }`.
- `setModelo(id)`, `setTema(t)`, `setIdioma(l)`: validan el valor (ignoran los inválidos),
  guardan en `localStorage` y notifican. `setTema` actualiza `data-theme`; `setIdioma` llama a
  `setLang`.
- `subscribe(fn)`: `fn(estado, que)` donde `que` es `'modelo' | 'tema' | 'lang'`; devuelve
  la función para cancelar.
- Claves de `localStorage`: `bench.modelo`, `bench.tema`, `bench.lang`. Toda lectura y escritura va
  en `try/catch` y la app funciona si `localStorage` falla.
- Pruebas (jsdom): valores por defecto; restaurar desde `localStorage`; id de modelo guardado
  que ya no existe vuelve al primero; valores inválidos se ignoran; notificación con el `que`
  correcto; `data-theme` cambia; funciona cuando `localStorage.getItem` lanza.

## Criterios de aceptación
- [ ] `npm test` pasa
- [ ] `npm run build` pasa

## Notas de revisión
(las escribe Claude al aprobar)
